const strategies = require('../data/strategies');
const marketDataService = require('./marketDataService');
const tradeEngine = require('./tradeEngine');

// Utility to calculate EMA
function calculateEMA(prices, period) {
  if (prices.length < period) return 0;
  let ema = prices[0];
  const k = 2 / (period + 1);
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * k) + (ema * (1 - k));
  }
  return ema;
}

// Utility to calculate RSI
function calculateRSI(prices, period = 14) {
  if (prices.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = ((avgGain * (period - 1)) + (diff > 0 ? diff : 0)) / period;
    avgLoss = ((avgLoss * (period - 1)) + (diff < 0 ? -diff : 0)) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Evaluates technical strategies when a candle closes (every 1 minute)
function onCandleClose(symbol, candle) {
  const candles = marketDataService.candlesCache[symbol];
  if (!candles || candles.length < 30) return; // Wait for enough warm data

  const prices = candles.map(c => c.close);
  const len = prices.length;

  const currentPrice = prices[len - 1];
  const prevPrice = prices[len - 2];

  // Loop through all active accounts and evaluate strategies
  Object.entries(strategies).forEach(([accountId, accountBots]) => {
    const bots = accountBots[symbol] || [];
    if (bots.length === 0) return;

    // Retrieve account settings for default lot size
    const accounts = require('../data/accounts');
    const activeAccount = accounts.find(a => String(a.id) === String(accountId));
    if (!activeAccount) return;

    const settings = require('../data/settings');
    const userSettings = settings[accountId] || { default_lot_size: 0.10, bot_status: 'active' };

    // If bot state is disabled globally, do not execute
    if (userSettings.bot_status !== 'active') return;

    const lotSize = userSettings.default_lot_size || 0.10;

    bots.forEach(strategyType => {
      let signal = null; // 'buy', 'sell' or null

      // 1. EMA Strategy (EMA 9/21 Crossover)
      if (strategyType === 'ema') {
        const ema9Current = calculateEMA(prices, 9);
        const ema21Current = calculateEMA(prices, 21);
        const ema9Prev = calculateEMA(prices.slice(0, -1), 9);
        const ema21Prev = calculateEMA(prices.slice(0, -1), 21);

        if (ema9Prev <= ema21Prev && ema9Current > ema21Current) {
          signal = 'buy';
        } else if (ema9Prev >= ema21Prev && ema9Current < ema21Current) {
          signal = 'sell';
        }
      }

      // 2. RSI Strategy (Oversold 30 / Overbought 70)
      else if (strategyType === 'rsi') {
        const rsiCurrent = calculateRSI(prices, 14);
        const rsiPrev = calculateRSI(prices.slice(0, -1), 14);

        if (rsiPrev < 30 && rsiCurrent >= 30) {
          signal = 'buy'; // Rising out of oversold
        } else if (rsiPrev > 70 && rsiCurrent <= 70) {
          signal = 'sell'; // Falling out of overbought
        }
      }

      // 3. Breakout Strategy (20-candle High/Low Breakout)
      else if (strategyType === 'breakout') {
        const range20 = prices.slice(-21, -1);
        const high20 = Math.max(...range20);
        const low20 = Math.min(...range20);

        if (prevPrice <= high20 && currentPrice > high20) {
          signal = 'buy';
        } else if (prevPrice >= low20 && currentPrice < low20) {
          signal = 'sell';
        }
      }

      // 4. Gold Strategy (Specialized scalp optimized for XAUUSD)
      else if (strategyType === 'gold' && symbol.toUpperCase() === 'XAUUSD') {
        const rsi = calculateRSI(prices, 14);
        const ema10 = calculateEMA(prices, 10);
        
        if (rsi < 35 && currentPrice > ema10) {
          signal = 'buy';
        } else if (rsi > 65 && currentPrice < ema10) {
          signal = 'sell';
        }
      }

      // 5. Custom Strategy (EMA trend filter)
      else if (strategyType === 'custom') {
        const ema50 = calculateEMA(prices, 50);
        if (currentPrice > ema50 && prevPrice <= ema50) {
          signal = 'buy';
        } else if (currentPrice < ema50 && prevPrice >= ema50) {
          signal = 'sell';
        }
      }

      if (signal) {
        executeBotTrade(activeAccount.id, symbol, signal, lotSize, strategyType);
      }
    });
  });
}

// Open simulated trade based on bot signal
function executeBotTrade(accountId, symbol, direction, lotSize, strategyName) {
  try {
    const pos = tradeEngine.openPosition(accountId, {
      symbol,
      type: direction,
      volume: lotSize,
      sl: 0,
      tp: 0
    });

    tradeEngine.addLog(accountId, 'info', `[Strategy: ${strategyName.toUpperCase()}] Auto-opened ${direction.toUpperCase()} trade on ${symbol} at $${pos.open_price} (Ticket: ${pos.ticket})`);

    // Broadcast alert via Socket.IO
    if (tradeEngine.io) {
      tradeEngine.io.emit('bot_signal', {
        account_id: accountId,
        symbol,
        signal: direction,
        strategy: strategyName,
        message: `[Bot: ${strategyName.toUpperCase()}] Executed simulated ${direction.toUpperCase()} order for ${lotSize} lot`
      });
    }
  } catch (err) {
    tradeEngine.addLog(accountId, 'warning', `[Bot: ${strategyName.toUpperCase()}] Failed to execute trade: ${err.message}`);
  }
}

module.exports = {
  onCandleClose,
  calculateEMA,
  calculateRSI
};
