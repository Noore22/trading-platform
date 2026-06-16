const positions = require('../data/positions');
const trades = require('../data/trades');
const accounts = require('../data/accounts');
const logs = require('../data/logs');
const settings = require('../data/settings');

let io = null;

function setSocketIo(socketIoInstance) {
  io = socketIoInstance;
}

function getNextTicket() {
  const all = [...positions, ...trades];
  if (all.length === 0) return 100001;
  return Math.max(...all.map(t => t.ticket)) + 1;
}

function openPosition(accountId, { symbol, type, volume, sl = 0, tp = 0 }) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) throw new Error('Account not found');

  const binanceService = require('./binanceService');
  const priceData = binanceService.priceCache[symbol.toUpperCase()];
  if (!priceData || !priceData.bid) {
    throw new Error(`No market data available for symbol: ${symbol}`);
  }

  const openPrice = type.toLowerCase() === 'buy' ? priceData.ask : priceData.bid;
  const ticket = getNextTicket();

  const pos = {
    id: ticket,
    account_id: accountId,
    ticket,
    symbol: symbol.toUpperCase(),
    type: type.toLowerCase(),
    volume: parseFloat(volume),
    open_price: openPrice,
    current_price: openPrice,
    sl: parseFloat(sl || 0),
    tp: parseFloat(tp || 0),
    profit: 0.0,
    open_time: new Date().toISOString(),
    status: 'open',
    comment: 'Binance Direct'
  };

  positions.push(pos);
  
  // Log event
  addLog(accountId, 'info', `Opened ${type.toUpperCase()} position for ${volume} ${symbol} at ${openPrice}`);
  
  syncAccount(accountId);

  // Send Telegram Alert
  const telegram = require('./telegram');
  const alertMsg = `🟢 <b>Binance Trade Opened</b>\n` +
                   `Account: ${account.login}\n` +
                   `Ticket: ${ticket}\n` +
                   `Type: ${type.toUpperCase()}\n` +
                   `Symbol: ${symbol.toUpperCase()}\n` +
                   `Volume: ${volume} Lot\n` +
                   `Price: $${openPrice.toFixed(2)}`;
  telegram.sendTelegramAlert(alertMsg);

  return pos;
}

function modifySLTP(accountId, ticket, sl, tp) {
  const pos = positions.find(p => p.ticket === ticket && p.account_id === accountId);
  if (!pos) throw new Error('Position not found');

  pos.sl = parseFloat(sl || 0);
  pos.tp = parseFloat(tp || 0);

  addLog(accountId, 'info', `Modified SL/TP for Ticket ${ticket}: SL=${sl}, TP=${tp}`);
  syncAccount(accountId);
  return pos;
}

function closePosition(accountId, ticket, reason = 'manual close') {
  const index = positions.findIndex(p => p.ticket === ticket && p.account_id === accountId);
  if (index === -1) throw new Error('Position not found');

  const pos = positions[index];
  const binanceService = require('./binanceService');
  const priceData = binanceService.priceCache[pos.symbol];
  
  const closePrice = pos.type === 'buy' ? (priceData?.bid || pos.current_price) : (priceData?.ask || pos.current_price);
  pos.current_price = closePrice;
  
  // Calculate final profit
  let finalProfit = 0;
  if (pos.type === 'buy') {
    finalProfit = (closePrice - pos.open_price) * pos.volume;
  } else {
    finalProfit = (pos.open_price - closePrice) * pos.volume;
  }
  pos.profit = finalProfit;
  pos.close_price = closePrice;
  pos.close_time = new Date().toISOString();
  pos.status = 'closed';
  pos.comment = `${pos.comment || ''} [${reason}]`;

  // Remove from open positions, add to closed trades
  positions.splice(index, 1);
  trades.push(pos);

  // Update account balance
  const account = accounts.find(a => a.id === accountId);
  if (account) {
    account.balance += finalProfit;
  }

  addLog(accountId, 'info', `Closed Position Ticket ${ticket} at ${closePrice} with profit $${finalProfit.toFixed(2)} (${reason})`);
  syncAccount(accountId);

  // Send Telegram Alert
  const telegram = require('./telegram');
  const profitEmoji = finalProfit >= 0 ? '💰' : '💸';
  const alertMsg = `🔴 <b>Binance Trade Closed (${reason})</b>\n` +
                   `Account: ${account ? account.login : accountId}\n` +
                   `Ticket: ${pos.ticket}\n` +
                   `Type: ${pos.type.toUpperCase()}\n` +
                   `Symbol: ${pos.symbol}\n` +
                   `Volume: ${pos.volume} Lot\n` +
                   `Entry: $${pos.open_price.toFixed(2)} | Exit: $${closePrice.toFixed(2)}\n` +
                   `Profit: ${profitEmoji} <b>$${finalProfit.toFixed(2)}</b>`;
  telegram.sendTelegramAlert(alertMsg);

  return pos;
}

function partialClose(accountId, ticket, volume) {
  const pos = positions.find(p => p.ticket === ticket && p.account_id === accountId);
  if (!pos) throw new Error('Position not found');

  const vol = parseFloat(volume);
  if (vol >= pos.volume) {
    return closePosition(accountId, ticket, 'partial close');
  }

  // Create closed part
  const binanceService = require('./binanceService');
  const priceData = binanceService.priceCache[pos.symbol];
  const closePrice = pos.type === 'buy' ? (priceData?.bid || pos.current_price) : (priceData?.ask || pos.current_price);
  
  let partProfit = 0;
  if (pos.type === 'buy') {
    partProfit = (closePrice - pos.open_price) * vol;
  } else {
    partProfit = (pos.open_price - closePrice) * vol;
  }

  const closedPart = {
    ...pos,
    ticket: getNextTicket(),
    volume: vol,
    profit: partProfit,
    close_price: closePrice,
    close_time: new Date().toISOString(),
    status: 'closed',
    comment: `${pos.comment || ''} [partial close part]`
  };
  trades.push(closedPart);

  // Update original position
  pos.volume -= vol;
  if (pos.type === 'buy') {
    pos.profit = (pos.current_price - pos.open_price) * pos.volume;
  } else {
    pos.profit = (pos.open_price - pos.current_price) * pos.volume;
  }

  // Update account balance
  const account = accounts.find(a => a.id === accountId);
  if (account) {
    account.balance += partProfit;
  }

  addLog(accountId, 'info', `Partially closed Position Ticket ${ticket}: closed ${vol} lot, remaining ${pos.volume} lot (${partProfit.toFixed(2)})`);
  syncAccount(accountId);
  return pos;
}

function closeGroup(accountId, action) {
  const toClose = positions.filter(p => p.account_id === accountId);
  let closedCount = 0;

  for (const pos of toClose) {
    if (action === 'close_all') {
      closePosition(accountId, pos.ticket, 'group close');
      closedCount++;
    } else if (action === 'close_buys' && pos.type === 'buy') {
      closePosition(accountId, pos.ticket, 'group close buy');
      closedCount++;
    } else if (action === 'close_sells' && pos.type === 'sell') {
      closePosition(accountId, pos.ticket, 'group close sell');
      closedCount++;
    }
  }

  return { closed_count: closedCount };
}

function onPriceUpdate(symbol, price) {
  // Update open positions prices and evaluate SL/TP
  let hasChanges = false;
  
  for (let i = positions.length - 1; i >= 0; i--) {
    const pos = positions[i];
    if (pos.symbol !== symbol) continue;

    pos.current_price = price;
    
    // Update floating profit
    if (pos.type === 'buy') {
      pos.profit = (price - pos.open_price) * pos.volume;
    } else {
      pos.profit = (pos.open_price - price) * pos.volume;
    }

    hasChanges = true;

    // Check SL/TP
    let hit = false;
    let reason = '';

    if (pos.type === 'buy') {
      if (pos.sl > 0 && price <= pos.sl) {
        hit = true;
        reason = 'Stop Loss Hit 🛑';
      } else if (pos.tp > 0 && price >= pos.tp) {
        hit = true;
        reason = 'Take Profit Hit 💰';
      }
    } else {
      if (pos.sl > 0 && price >= pos.sl) {
        hit = true;
        reason = 'Stop Loss Hit 🛑';
      } else if (pos.tp > 0 && price <= pos.tp) {
        hit = true;
        reason = 'Take Profit Hit 💰';
      }
    }

    if (hit) {
      closePosition(pos.account_id, pos.ticket, reason);
    }
  }

  if (hasChanges) {
    // Sync active accounts
    const activeAccountIds = [...new Set(positions.map(p => p.account_id))];
    activeAccountIds.forEach(id => syncAccount(id));
  }
}

function addLog(accountId, level, message) {
  const log = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    account_id: accountId,
    level,
    message,
    created_at: new Date().toISOString()
  };
  logs.unshift(log);
  if (logs.length > 500) logs.pop();

  if (io) {
    io.emit('log', log);
  }
}

function syncAccount(accountId) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return;

  const accountPositions = positions.filter(p => p.account_id === accountId);
  const floatingProfit = accountPositions.reduce((sum, p) => sum + p.profit, 0);

  // Compute stats
  account.floating_profit = floatingProfit;
  account.equity = account.balance + floatingProfit;
  
  // Simulated margins
  account.margin = accountPositions.reduce((sum, p) => sum + (p.open_price * p.volume * 0.1), 0);
  account.free_margin = account.equity - account.margin;
  account.margin_level = account.margin > 0 ? (account.equity / account.margin) * 100 : 0;
  
  account.last_sync_at = new Date().toISOString();

  if (io) {
    io.emit('terminal_sync', {
      type: 'terminal_sync',
      connected: true,
      account_id: accountId,
      login: account.login,
      broker: account.broker,
      balance: account.balance,
      equity: account.equity,
      margin: account.margin,
      free_margin: account.free_margin,
      margin_level: account.margin_level,
      floating_profit: floatingProfit,
      daily_profit: account.daily_profit || 0.0,
      weekly_profit: account.weekly_profit || 0.0,
      monthly_profit: account.monthly_profit || 0.0,
      win_rate: account.win_rate || 0.0,
      open_trades: accountPositions,
      timestamp: account.last_sync_at
    });
  }
}

module.exports = {
  setSocketIo,
  openPosition,
  modifySLTP,
  closePosition,
  partialClose,
  closeGroup,
  onPriceUpdate,
  addLog,
  syncAccount
};
