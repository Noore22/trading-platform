const WebSocket = require('ws');
const { Spot } = require('@binance/connector');
const config = require('../config/binance');

// In-memory cache for live tick data
const priceCache = {};

// Active clients
let io = null;
let ws = null;
let isConnected = false;

// Instantiate Binance Spot Client (with fallback to US base URL if needed)
const client = new Spot(config.apiKey, config.secretKey, {
  baseURL: 'https://api.binance.com'
});

const symbols = ['btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt', 'adausdt', 'dogeusdt'];

// Generate streams list
const streams = [];
symbols.forEach(sym => {
  streams.push(`${sym}@trade`);
  streams.push(`${sym}@ticker`);
  streams.push(`${sym}@bookTicker`);
  streams.push(`${sym}@kline_1m`);
});

const wsUrl = `${config.wsUrl}/stream?streams=${streams.join('/')}`;

async function validateAPIKeys() {
  try {
    // Check account information to validate credentials (signed request)
    const res = await client.account();
    console.log('Successfully validated Binance API Keys. Status:', res.status);
    return true;
  } catch (err) {
    console.warn('Binance API key validation failed (may be demo or blocked keys):', err.message);
    return false;
  }
}

let useBackupUrl = false;
let pingInterval = null;

function connectWebSocket(socketIoInstance) {
  io = socketIoInstance;
  
  // Validate keys asynchronously in background
  validateAPIKeys();

  const activeUrl = useBackupUrl 
    ? wsUrl.replace('stream.binance.com:9443', 'stream.binance.us:9443') 
    : wsUrl;

  console.log(`Connecting to Binance WebSockets at: ${activeUrl}`);
  ws = new WebSocket(activeUrl);

  ws.on('open', () => {
    console.log('Connected to Binance Combined Streams WebSocket.');
    isConnected = true;

    // Send heartbeat pings every 30 seconds to prevent timeout
    clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);
  });

  // Explicitly handle ping/pong handshake to avoid disconnects
  ws.on('ping', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.pong();
    }
  });

  ws.on('message', (data) => {
    try {
      const payload = JSON.parse(data);
      const streamName = payload.stream;
      const streamData = payload.data;
      
      const parts = streamName.split('@');
      const symbol = parts[0].toUpperCase();
      const type = parts[1];

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
      } else if (type === 'trade') {
        const tradeEngine = require('./tradeEngine');
        tradeEngine.onPriceUpdate(symbol, parseFloat(streamData.p));
      } else if (type === 'kline_1m') {
        if (io) {
          io.emit('kline_update', {
            symbol,
            kline: {
              time: streamData.k.t,
              open: parseFloat(streamData.k.o),
              high: parseFloat(streamData.k.h),
              low: parseFloat(streamData.k.l),
              close: parseFloat(streamData.k.c),
              volume: parseFloat(streamData.k.v),
              closed: streamData.k.x
            }
          });
        }
      }
    } catch (e) {
      console.error('Error parsing Binance message:', e);
    }
  });

  ws.on('close', (code, reason) => {
    console.warn(`Binance WebSocket connection closed. Code: ${code}, Reason: ${reason || 'none'}. Reconnecting...`);
    isConnected = false;
    clearInterval(pingInterval);
    
    // Toggle between US and Global streams on connection drop
    useBackupUrl = !useBackupUrl;
    setTimeout(() => connectWebSocket(io), 5000);
  });

  ws.on('error', (err) => {
    console.error('Binance WebSocket Error:', err.message);
    ws.close();
  });
}

function emitTick(symbol) {
  if (io && priceCache[symbol]) {
    const data = priceCache[symbol];
    io.emit('tick_data', {
      symbol,
      bid: data.bid,
      ask: data.ask,
      last: data.last,
      volume: data.volume,
      high: data.high,
      low: data.low,
      open: data.open,
      time: data.time
    });
  }
}

async function getHistoricalCandles(symbol, interval = '1m', limit = 100) {
  try {
    // Utilize the SDK's klines method (handles retries/rate limit metrics natively)
    const response = await client.klines(symbol.toUpperCase(), interval, { limit });
    return response.data.map(k => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));
  } catch (err) {
    console.error(`Error fetching historical candles for ${symbol}:`, err.message);
    return [];
  }
}

module.exports = {
  connectWebSocket,
  getHistoricalCandles,
  priceCache,
  isConnected: () => isConnected,
  client
};
