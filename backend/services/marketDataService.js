const WebSocket = require('ws');
const axios = require('axios');
const { Spot } = require('@binance/connector');
const config = require('../config/marketData');

// In-memory cache for live tick data
const priceCache = {};

// In-memory cache for historical 1m candles (used for bot strategy indicators)
const candlesCache = {};

// Active clients
let io = null;
let binanceWs = null;
let bybitWs = null;
let twelveDataWs = null;

let isBinanceConnected = false;
let isBybitConnected = false;
let isTwelveDataConnected = false;
let fallbackInterval = null;

// Instantiate Binance Spot Client (with fallback to US base URL if needed)
const binanceClient = new Spot(config.binance.apiKey, config.binance.secretKey, {
  baseURL: 'https://api.binance.com'
});

const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'XRPUSDT'];
const forexSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'];
const metalsSymbols = ['XAUUSD', 'XAGUSD'];
const indexSymbols = ['US30', 'NAS100', 'SPX500'];
const allSymbols = [...cryptoSymbols, ...forexSymbols, ...metalsSymbols, ...indexSymbols];

// Spread offsets (fallback)
function getSpreadOffset(symbol) {
  const sym = symbol.toUpperCase();
  if (sym === 'XAUUSD') return 0.20; // 20 cents spread for Gold
  if (sym === 'XAGUSD') return 0.02; // 2 cents spread for Silver
  if (sym === 'US30') return 2.0;    // 2 points spread for Dow Jones
  if (sym === 'NAS100') return 1.0;   // 1 point spread for Nasdaq
  if (sym === 'SPX500') return 0.25;  // 0.25 points spread for S&P
  if (forexSymbols.includes(sym)) {
    if (sym.includes('JPY')) return 0.015; // 1.5 pips for Yen
    return 0.00015; // 1.5 pips standard Forex
  }
  // Crypto default spread offsets if bookTicker is missing
  if (sym === 'BTCUSDT') return 2.0;
  if (sym === 'ETHUSDT') return 0.20;
  if (sym === 'SOLUSDT') return 0.02;
  return 0.01;
}

// Convert frontend symbol to Twelve Data symbol (e.g. EURUSD -> EUR/USD, XAUUSD -> XAU/USD)
function getTwelveDataSymbol(symbol) {
  const sym = symbol.toUpperCase();
  if (forexSymbols.includes(sym) || metalsSymbols.includes(sym)) {
    return `${sym.slice(0, 3)}/${sym.slice(3)}`;
  }
  if (sym === 'US30') return 'DJI';
  if (sym === 'NAS100') return 'NDX';
  if (sym === 'SPX500') return 'SPX';
  return sym;
}

// Map Twelve Data symbol back to frontend symbol (e.g. EUR/USD -> EURUSD, DJI -> US30)
function getFrontendSymbol(tdSymbol) {
  const clean = tdSymbol.toUpperCase().replace('/', '');
  if (clean === 'DJI') return 'US30';
  if (clean === 'NDX') return 'NAS100';
  if (clean === 'SPX') return 'SPX500';
  return clean;
}

// Initialize historical candles in background for technical indicators
async function warmUpHistoricalCandles() {
  console.log('Warming up historical candles in background...');
  
  // Warm up Crypto candles via Binance REST API
  for (const symbol of cryptoSymbols) {
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=60`);
      candlesCache[symbol] = response.data.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        closed: true
      }));
    } catch (err) {
      console.warn(`Failed to warm up historical candles for ${symbol}:`, err.message);
    }
  }

  // Warm up Forex/Metals/Indices via Twelve Data REST API
  if (config.twelvedata.apiKey) {
    for (const symbol of [...forexSymbols, ...metalsSymbols, ...indexSymbols]) {
      try {
        const tdSymbol = getTwelveDataSymbol(symbol);
        const response = await axios.get(`${config.twelvedata.apiUrl}/time_series?symbol=${tdSymbol}&interval=1min&outputsize=60&apikey=${config.twelvedata.apiKey}`);
        if (response.data && response.data.values) {
          candlesCache[symbol] = response.data.values.map(k => ({
            time: new Date(k.datetime).getTime(),
            open: parseFloat(k.open),
            high: parseFloat(k.high),
            low: parseFloat(k.low),
            close: parseFloat(k.close),
            volume: parseFloat(k.volume || 0),
            closed: true
          })).reverse(); // Twelve Data returns newest first; reverse to get chronological order
        }
      } catch (err) {
        console.warn(`Failed to warm up historical candles for ${symbol}:`, err.message);
      }
    }
  }
}

// Connect WebSocket feeds
function connectWebSocket(socketIoInstance) {
  io = socketIoInstance;

  // Run warm-up in background
  warmUpHistoricalCandles();

  // Connect feeds
  connectBinanceCrypto();
  connectTwelveData();
  startRESTFallbackPolling();
}

// ----------------------------------------------------
// 1. Binance Crypto WS Connection (with fallback to Bybit)
// ----------------------------------------------------
let useBinanceBackupUrl = false;
let binancePingInterval = null;

function connectBinanceCrypto() {
  const streams = [];
  cryptoSymbols.forEach(sym => {
    const symLower = sym.toLowerCase();
    streams.push(`${symLower}@ticker`);
    streams.push(`${symLower}@bookTicker`);
    streams.push(`${symLower}@kline_1m`);
  });

  const activeUrl = useBinanceBackupUrl
    ? `wss://stream.binance.us:9443/stream?streams=${streams.join('/')}`
    : `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;

  console.log(`Connecting to Binance WebSockets: ${activeUrl}`);
  binanceWs = new WebSocket(activeUrl);

  binanceWs.on('open', () => {
    console.log('Connected to Binance Combined Streams WebSocket.');
    isBinanceConnected = true;

    // Ping interval to keep alive
    clearInterval(binancePingInterval);
    binancePingInterval = setInterval(() => {
      if (binanceWs && binanceWs.readyState === WebSocket.OPEN) {
        binanceWs.ping();
      }
    }, 30000);
  });

  binanceWs.on('ping', () => {
    if (binanceWs && binanceWs.readyState === WebSocket.OPEN) {
      binanceWs.pong();
    }
  });

  binanceWs.on('message', (data) => {
    try {
      const payload = JSON.parse(data);
      const streamName = payload.stream;
      const streamData = payload.data;
      
      const parts = streamName.split('@');
      const symbol = parts[0].toUpperCase();
      const type = parts[1];

      initializePriceCache(symbol);

      if (type === 'bookTicker') {
        priceCache[symbol].bid = parseFloat(streamData.b);
        priceCache[symbol].ask = parseFloat(streamData.a);
        priceCache[symbol].time = Date.now();
        emitTick(symbol);
      } else if (type === 'ticker') {
        priceCache[symbol].last = parseFloat(streamData.c);
        priceCache[symbol].volume = parseFloat(streamData.v);
        priceCache[symbol].high = parseFloat(streamData.h);
        priceCache[symbol].low = parseFloat(streamData.l);
        priceCache[symbol].open = parseFloat(streamData.o);
        
        // Feed into Simulated Position/Trade engine
        const tradeEngine = require('./tradeEngine');
        tradeEngine.onPriceUpdate(symbol, priceCache[symbol].last);
      } else if (type === 'kline_1m') {
        updateKlineCache(symbol, {
          time: streamData.k.t,
          open: parseFloat(streamData.k.o),
          high: parseFloat(streamData.k.h),
          low: parseFloat(streamData.k.l),
          close: parseFloat(streamData.k.c),
          volume: parseFloat(streamData.k.v),
          closed: streamData.k.x
        });
      }
    } catch (e) {
      console.error('Error parsing Binance message:', e);
    }
  });

  binanceWs.on('close', (code, reason) => {
    console.warn(`Binance WS closed (Code: ${code}). Reconnecting/Falling back to Bybit...`);
    isBinanceConnected = false;
    clearInterval(binancePingInterval);

    // Switch URLs
    useBinanceBackupUrl = !useBinanceBackupUrl;

    // Attempt to connect Bybit as immediate backup, or retry Binance
    setTimeout(() => {
      if (!isBinanceConnected) {
        connectBybitCrypto();
      }
    }, 5000);
  });

  binanceWs.on('error', (err) => {
    console.error('Binance WS Error:', err.message);
    binanceWs.close();
  });
}

// ----------------------------------------------------
// 2. Bybit Backup Crypto Connection (if Binance is offline)
// ----------------------------------------------------
let bybitPingInterval = null;

function connectBybitCrypto() {
  if (isBinanceConnected) return; // Binance recovered; do not establish Bybit

  console.log(`Connecting to Bybit Spot WebSocket: ${config.bybit.wsUrl}`);
  bybitWs = new WebSocket(config.bybit.wsUrl);

  bybitWs.on('open', () => {
    console.log('Connected to Bybit public Spot WebSocket.');
    isBybitConnected = true;

    // Subscribe to tickers for symbols
    const args = cryptoSymbols.map(sym => `tickers.${sym}`);
    bybitWs.send(JSON.stringify({
      op: 'subscribe',
      args
    }));

    // Keep alive ping
    clearInterval(bybitPingInterval);
    bybitPingInterval = setInterval(() => {
      if (bybitWs && bybitWs.readyState === WebSocket.OPEN) {
        bybitWs.send(JSON.stringify({ op: 'ping' }));
      }
    }, 20000);
  });

  bybitWs.on('message', (data) => {
    try {
      const payload = JSON.parse(data);
      if (payload.topic && payload.topic.startsWith('tickers.')) {
        const symbol = payload.topic.split('.')[1].toUpperCase();
        const tick = payload.data;

        initializePriceCache(symbol);
        
        const lastPrice = parseFloat(tick.lastPrice);
        priceCache[symbol].last = lastPrice;
        priceCache[symbol].high = parseFloat(tick.highPrice24h || lastPrice);
        priceCache[symbol].low = parseFloat(tick.lowPrice24h || lastPrice);
        priceCache[symbol].volume = parseFloat(tick.volume24h || 0);
        priceCache[symbol].open = parseFloat(tick.prevPrice24h || lastPrice);

        // Bybit tickers do not have direct spreads in the tickers channel; simulate
        const spreadOffset = getSpreadOffset(symbol);
        priceCache[symbol].bid = lastPrice - (spreadOffset / 2);
        priceCache[symbol].ask = lastPrice + (spreadOffset / 2);
        priceCache[symbol].time = payload.ts;

        emitTick(symbol);

        const tradeEngine = require('./tradeEngine');
        tradeEngine.onPriceUpdate(symbol, lastPrice);
      }
    } catch (e) {
      console.error('Error parsing Bybit message:', e);
    }
  });

  bybitWs.on('close', () => {
    console.warn('Bybit WS closed. Retrying Binance/Bybit...');
    isBybitConnected = false;
    clearInterval(bybitPingInterval);
    setTimeout(() => {
      if (!isBinanceConnected) {
        connectBinanceCrypto();
      }
    }, 10000);
  });

  bybitWs.on('error', (err) => {
    console.error('Bybit WS Error:', err.message);
    bybitWs.close();
  });
}

// ----------------------------------------------------
// 3. Twelve Data (Forex, Metals & Indices) WS
// ----------------------------------------------------
let twelveDataPingInterval = null;

function connectTwelveData() {
  if (!config.twelvedata.apiKey) {
    console.warn('No Twelve Data API Key provided. Twelve Data feeds will fallback strictly to simulated rates.');
    return;
  }

  const url = `${config.twelvedata.wsUrl}?apikey=${config.twelvedata.apiKey}`;
  console.log(`Connecting to Twelve Data WebSocket: wss://ws.twelvedata.com/v1/...`);
  twelveDataWs = new WebSocket(url);

  twelveDataWs.on('open', () => {
    console.log('Connected to Twelve Data Quote WebSocket.');
    isTwelveDataConnected = true;

    // Build comma-separated subscription list (must use Twelve Data format e.g. EUR/USD)
    const symbolsToSubscribe = [...forexSymbols, ...metalsSymbols].map(getTwelveDataSymbol);
    
    // Twelve Data Index symbols can also be added if they are enabled in subscription
    symbolsToSubscribe.push('DJI', 'NDX', 'SPX');

    twelveDataWs.send(JSON.stringify({
      action: 'subscribe',
      params: {
        symbols: symbolsToSubscribe.join(',')
      }
    }));

    // Keep alive ping
    clearInterval(twelveDataPingInterval);
    twelveDataPingInterval = setInterval(() => {
      if (twelveDataWs && twelveDataWs.readyState === WebSocket.OPEN) {
        twelveDataWs.send(JSON.stringify({ action: 'heartbeat' }));
      }
    }, 10000);
  });

  twelveDataWs.on('message', (data) => {
    try {
      const payload = JSON.parse(data);
      if (payload.event === 'price') {
        const symbol = getFrontendSymbol(payload.symbol);
        initializePriceCache(symbol);

        const price = parseFloat(payload.price);
        priceCache[symbol].last = price;
        priceCache[symbol].time = payload.timestamp * 1000 || Date.now();

        // Calculate spreads
        const offset = getSpreadOffset(symbol);
        priceCache[symbol].bid = payload.bid ? parseFloat(payload.bid) : (price - offset);
        priceCache[symbol].ask = payload.ask ? parseFloat(payload.ask) : (price + offset);

        // Update high/low if missing
        if (!priceCache[symbol].high || price > priceCache[symbol].high) priceCache[symbol].high = price;
        if (!priceCache[symbol].low || price < priceCache[symbol].low) priceCache[symbol].low = price;

        emitTick(symbol);

        const tradeEngine = require('./tradeEngine');
        tradeEngine.onPriceUpdate(symbol, price);
      }
    } catch (e) {
      console.error('Error parsing Twelve Data WS message:', e);
    }
  });

  twelveDataWs.on('close', () => {
    console.warn('Twelve Data WS closed. Reconnecting...');
    isTwelveDataConnected = false;
    clearInterval(twelveDataPingInterval);
    setTimeout(connectTwelveData, 10000);
  });

  twelveDataWs.on('error', (err) => {
    console.error('Twelve Data WS Error:', err.message);
    twelveDataWs.close();
  });
}

// ----------------------------------------------------
// 4. Fallback REST Polling Feed (Enforces continuous operation)
// ----------------------------------------------------
function startRESTFallbackPolling() {
  clearInterval(fallbackInterval);
  fallbackInterval = setInterval(async () => {
    // 1. Fetch Forex and Metals if WS is offline or missing quotes
    if (config.twelvedata.apiKey) {
      const offlineSymbols = [...forexSymbols, ...metalsSymbols, ...indexSymbols].filter(
        sym => !priceCache[sym] || (Date.now() - priceCache[sym].time > 8000)
      );

      if (offlineSymbols.length > 0) {
        try {
          const tdQuery = offlineSymbols.map(getTwelveDataSymbol).join(',');
          const response = await axios.get(`${config.twelvedata.apiUrl}/quote?symbol=${tdQuery}&apikey=${config.twelvedata.apiKey}`);
          
          const processQuoteData = (sym, q) => {
            if (!q || !q.price) return;
            initializePriceCache(sym);
            const price = parseFloat(q.price);
            priceCache[sym].last = price;
            priceCache[sym].open = parseFloat(q.open || price);
            priceCache[sym].high = parseFloat(q.high || price);
            priceCache[sym].low = parseFloat(q.low || price);
            priceCache[sym].volume = parseFloat(q.volume || 0);
            
            const offset = getSpreadOffset(sym);
            priceCache[sym].bid = q.bid ? parseFloat(q.bid) : (price - offset);
            priceCache[sym].ask = q.ask ? parseFloat(q.ask) : (price + offset);
            priceCache[sym].time = Date.now();

            emitTick(sym);

            const tradeEngine = require('./tradeEngine');
            tradeEngine.onPriceUpdate(sym, price);
          };

          if (offlineSymbols.length === 1) {
            const sym = offlineSymbols[0];
            processQuoteData(sym, response.data);
          } else {
            Object.entries(response.data).forEach(([tdSym, quote]) => {
              const sym = getFrontendSymbol(tdSym);
              processQuoteData(sym, quote);
            });
          }
        } catch (err) {
          console.debug('Twelve Data REST poll failed (normal limit boundaries):', err.message);
        }
      }
    }

    // 2. Generate simulated prices for any offline assets (ensures XAUUSD and Forex NEVER fail)
    allSymbols.forEach(sym => {
      const cached = priceCache[sym];
      // If no data is available after 10 seconds, generate realistic ticks
      if (!cached || (Date.now() - cached.time > 10000)) {
        simulateFallbackTick(sym);
      }
    });

  }, 4000);
}

function simulateFallbackTick(symbol) {
  initializePriceCache(symbol);
  
  let basePrice = priceCache[symbol].last || 1.0;
  if (basePrice === 1.0) {
    // Starting defaults
    if (symbol === 'BTCUSDT') basePrice = 67000;
    else if (symbol === 'ETHUSDT') basePrice = 3500;
    else if (symbol === 'BNBUSDT') basePrice = 580;
    else if (symbol === 'SOLUSDT') basePrice = 150;
    else if (symbol === 'DOGEUSDT') basePrice = 0.14;
    else if (symbol === 'ADAUSDT') basePrice = 0.48;
    else if (symbol === 'XRPUSDT') basePrice = 0.49;
    else if (symbol === 'EURUSD') basePrice = 1.085;
    else if (symbol === 'GBPUSD') basePrice = 1.272;
    else if (symbol === 'USDJPY') basePrice = 156.50;
    else if (symbol === 'AUDUSD') basePrice = 0.665;
    else if (symbol === 'USDCAD') basePrice = 1.368;
    else if (symbol === 'USDCHF') basePrice = 0.892;
    else if (symbol === 'NZDUSD') basePrice = 0.612;
    else if (symbol === 'XAUUSD') basePrice = 2330.00; // Gold Spot
    else if (symbol === 'XAGUSD') basePrice = 29.20;  // Silver Spot
    else if (symbol === 'US30') basePrice = 39800.00;
    else if (symbol === 'NAS100') basePrice = 18600.00;
    else if (symbol === 'SPX500') basePrice = 5300.00;
  }

  // Add random fractional fluctuation (-0.05% to +0.05%)
  const change = basePrice * (Math.random() - 0.5) * 0.0006;
  const newPrice = basePrice + change;
  
  priceCache[symbol].last = newPrice;
  if (!priceCache[symbol].open) priceCache[symbol].open = newPrice;
  if (!priceCache[symbol].high || newPrice > priceCache[symbol].high) priceCache[symbol].high = newPrice;
  if (!priceCache[symbol].low || newPrice < priceCache[symbol].low) priceCache[symbol].low = newPrice;
  priceCache[symbol].volume = (priceCache[symbol].volume || 0) + Math.floor(Math.random() * 10);
  
  const offset = getSpreadOffset(symbol);
  priceCache[symbol].bid = newPrice - (offset / 2);
  priceCache[symbol].ask = newPrice + (offset / 2);
  priceCache[symbol].time = Date.now();

  emitTick(symbol);

  // Update kline bar
  updateSimulatedKline(symbol, newPrice);

  const tradeEngine = require('./tradeEngine');
  tradeEngine.onPriceUpdate(symbol, newPrice);
}

// Initialize price caches
function initializePriceCache(symbol) {
  if (!priceCache[symbol]) {
    priceCache[symbol] = {
      bid: 0,
      ask: 0,
      last: 0,
      volume: 0,
      high: 0,
      low: 0,
      open: 0,
      time: Date.now()
    };
  }
}

// Batching variables
const dirtyTicks = new Set();

// Socket Emitters
function emitTick(symbol) {
  if (io && priceCache[symbol]) {
    dirtyTicks.add(symbol);
  }
}

// Start Batch Broadcaster
setInterval(() => {
  if (!io || dirtyTicks.size === 0) return;

  const ticksToSend = {};
  for (const sym of dirtyTicks) {
    ticksToSend[sym] = {
      symbol: sym,
      bid: priceCache[sym].bid,
      ask: priceCache[sym].ask,
      last: priceCache[sym].last,
      volume: priceCache[sym].volume,
      high: priceCache[sym].high,
      low: priceCache[sym].low,
      open: priceCache[sym].open,
      time: priceCache[sym].time
    };
  }

  // Iterate over connected clients and send only what they are subscribed to
  io.sockets.sockets.forEach((socket) => {
    const subs = socket.subscriptions || [];
    const clientBatch = [];
    
    // If no subscriptions array exists, assume they want nothing, or we can send all (backward compatibility).
    // Let's assume if it's undefined, they get all (for now) or nothing. Best to send all if undefined to prevent breaking changes while transitioning.
    const sendAll = !socket.subscriptions || socket.subscriptions.length === 0;

    for (const sym of dirtyTicks) {
      if (sendAll || subs.includes(sym)) {
        clientBatch.push(ticksToSend[sym]);
      }
    }

    if (clientBatch.length > 0) {
      socket.emit('tick_batch', clientBatch);
    }
  });

  dirtyTicks.clear();
}, 250);

// ----------------------------------------------------
// Kline / Candlestick Cache updates
// ----------------------------------------------------
function updateKlineCache(symbol, kline) {
  if (!candlesCache[symbol]) {
    candlesCache[symbol] = [];
  }

  const list = candlesCache[symbol];
  const lastIndex = list.findIndex(c => c.time === kline.time);

  if (lastIndex !== -1) {
    list[lastIndex] = kline;
  } else {
    list.push(kline);
    if (list.length > 150) list.shift();
  }

  // Forward candlestick update to client
  if (io) {
    io.emit('kline_update', { symbol, kline });
  }

  // Trigger strategy bot check when a candle completes
  if (kline.closed) {
    const botEngine = require('./botEngine');
    botEngine.onCandleClose(symbol, kline);
  }
}

// Update candle bars for simulated feeds
function updateSimulatedKline(symbol, price) {
  if (!candlesCache[symbol]) {
    candlesCache[symbol] = [];
  }
  
  const list = candlesCache[symbol];
  const now = Date.now();
  const oneMinuteMs = 60000;
  const currentMinuteTime = Math.floor(now / oneMinuteMs) * oneMinuteMs;
  
  const lastCandle = list[list.length - 1];
  
  if (lastCandle && lastCandle.time === currentMinuteTime) {
    // Update current candle
    lastCandle.close = price;
    if (price > lastCandle.high) lastCandle.high = price;
    if (price < lastCandle.low) lastCandle.low = price;
    lastCandle.volume += 1;
    
    if (io) {
      io.emit('kline_update', { symbol, kline: lastCandle });
    }
  } else {
    // Close previous candle
    if (lastCandle) {
      lastCandle.closed = true;
      const botEngine = require('./botEngine');
      botEngine.onCandleClose(symbol, lastCandle);
    }
    
    // Start new candle
    const newCandle = {
      time: currentMinuteTime,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1,
      closed: false
    };
    list.push(newCandle);
    if (list.length > 150) list.shift();
    
    if (io) {
      io.emit('kline_update', { symbol, kline: newCandle });
    }
  }
}

// Fetch historical candles via REST fallback (for charts or technical warm-ups)
async function getHistoricalCandles(symbol, interval = '1m', limit = 100) {
  const sym = symbol.toUpperCase();
  // Fetch from cached memory if available
  if (candlesCache[sym] && candlesCache[sym].length > 0) {
    return candlesCache[sym].slice(-limit);
  }

  // Fetch from REST API fallback
  try {
    if (cryptoSymbols.includes(sym)) {
      const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`);
      return response.data.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));
    } else if (config.twelvedata.apiKey) {
      const tdSym = getTwelveDataSymbol(sym);
      const response = await axios.get(`${config.twelvedata.apiUrl}/time_series?symbol=${tdSym}&interval=1min&outputsize=${limit}&apikey=${config.twelvedata.apiKey}`);
      if (response.data && response.data.values) {
        return response.data.values.map(k => ({
          time: new Date(k.datetime).getTime(),
          open: parseFloat(k.open),
          high: parseFloat(k.high),
          low: parseFloat(k.low),
          close: parseFloat(k.close),
          volume: parseFloat(k.volume || 0)
        })).reverse();
      }
    }
  } catch (err) {
    console.error(`Error fetching historical candles for ${sym}:`, err.message);
  }
  
  return [];
}

module.exports = {
  connectWebSocket,
  getHistoricalCandles,
  priceCache,
  candlesCache,
  isConnected: () => isBinanceConnected || isBybitConnected || isTwelveDataConnected,
  getTwelveDataSymbol,
  getFrontendSymbol
};
