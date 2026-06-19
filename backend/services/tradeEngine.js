const StorageManager = require('./StorageManager');

const proxyArray = (name) => new Proxy([], {
    get: (target, prop) => {
        const cache = StorageManager.getCache(name) || [];
        const val = cache[prop];
        if (typeof val === 'function') return val.bind(cache);
        return val;
    },
    set: (target, prop, value) => {
        const cache = StorageManager.getCache(name);
        if (cache) {
            cache[prop] = value;
            StorageManager.saveBackground(name);
            return true;
        }
        return false;
    }
});

const accounts = proxyArray('accounts');
const positions = proxyArray('positions');
const trades = proxyArray('trades');
const orders = proxyArray('orders');
const logs = proxyArray('logs');

const settings = new Proxy({}, {
    get: (target, prop) => (StorageManager.getCache('settings') || {})[prop],
    set: (target, prop, value) => {
        const cache = StorageManager.getCache('settings');
        if (cache) {
            cache[prop] = value;
            StorageManager.saveBackground('settings');
            return true;
        }
        return false;
    }
});

let io = null;

function setSocketIo(socketIoInstance) {
  io = socketIoInstance;
}

function getNextTicket() {
  const all = [...positions, ...trades, ...orders];
  if (all.length === 0) return 100001;
  return Math.max(...all.map(t => t.ticket)) + 1;
}

// Open active simulated position immediately
function openPosition(accountId, { symbol, type, volume, sl = 0, tp = 0 }) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) throw new Error('Account not found');

  const marketDataService = require('./marketDataService');
  const priceData = marketDataService.priceCache[symbol.toUpperCase()];
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

// Place simulated pending Limit or Stop order
function placeOrder(accountId, { symbol, type, volume, price, sl = 0, tp = 0 }) {
  const account = accounts.find(a => a.id === accountId);
  if (!account) throw new Error('Account not found');

  const ticket = getNextTicket();
  const order = {
    id: ticket,
    account_id: accountId,
    ticket,
    symbol: symbol.toUpperCase(),
    type: type.toLowerCase(), // buy_limit, buy_stop, sell_limit, sell_stop
    volume: parseFloat(volume),
    price: parseFloat(price),
    sl: parseFloat(sl || 0),
    tp: parseFloat(tp || 0),
    open_time: new Date().toISOString(),
    status: 'pending'
  };

  orders.push(order);
  addLog(accountId, 'info', `Placed simulated pending ${type.toUpperCase()} order on ${symbol} at $${price}`);
  
  // Notify client immediately of pending orders list change
  syncAccount(accountId);
  return order;
}

// Cancel simulated pending order
function cancelOrder(accountId, ticket) {
  const idx = orders.findIndex(o => o.ticket === ticket && o.account_id === accountId);
  if (idx === -1) throw new Error('Pending order not found');

  const order = orders[idx];
  orders.splice(idx, 1);
  addLog(accountId, 'info', `Cancelled pending ${order.type.toUpperCase()} order (Ticket: ${ticket})`);
  
  syncAccount(accountId);
  return order;
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
  const marketDataService = require('./marketDataService');
  const priceData = marketDataService.priceCache[pos.symbol];
  
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
  const marketDataService = require('./marketDataService');
  const priceData = marketDataService.priceCache[pos.symbol];
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
  let hasChanges = false;
  
  // 1. Evaluate Trailing Stop and SL/TP for open positions
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

    // Trailing Stop logic
    const accountSettings = settings[pos.account_id];
    if (accountSettings && accountSettings.trailing_stop > 0) {
      const tsDist = parseFloat(accountSettings.trailing_stop);
      
      if (pos.type === 'buy') {
        const potentialSL = price - tsDist;
        if (price - pos.open_price > tsDist && potentialSL > pos.sl) {
          pos.sl = potentialSL;
          addLog(pos.account_id, 'info', `Trailing Stop: Adjusted SL for Ticket ${pos.ticket} to $${potentialSL.toFixed(4)}`);
        }
      } else {
        const potentialSL = price + tsDist;
        if (pos.open_price - price > tsDist && (pos.sl === 0 || potentialSL < pos.sl)) {
          pos.sl = potentialSL;
          addLog(pos.account_id, 'info', `Trailing Stop: Adjusted SL for Ticket ${pos.ticket} to $${potentialSL.toFixed(4)}`);
        }
      }
    }

    hasChanges = true;

    // Check SL/TP boundaries
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

  // 2. Evaluate simulated pending limit & stop orders
  for (let i = orders.length - 1; i >= 0; i--) {
    const order = orders[i];
    if (order.symbol !== symbol) continue;

    let trigger = false;
    
    if (order.type === 'buy_limit') {
      if (price <= order.price) trigger = true;
    } else if (order.type === 'buy_stop') {
      if (price >= order.price) trigger = true;
    } else if (order.type === 'sell_limit') {
      if (price >= order.price) trigger = true;
    } else if (order.type === 'sell_stop') {
      if (price <= order.price) trigger = true;
    }

    if (trigger) {
      // Remove from pending orders list
      orders.splice(i, 1);
      addLog(order.account_id, 'info', `Pending Order Triggered: Executed ${order.type.toUpperCase()} for ${order.volume} lot on ${symbol} at $${price}`);
      
      try {
        const typeNormalized = order.type.startsWith('buy') ? 'buy' : 'sell';
        
        // Open the active simulated position
        const ticket = getNextTicket();
        const pos = {
          id: ticket,
          account_id: order.account_id,
          ticket,
          symbol: order.symbol,
          type: typeNormalized,
          volume: order.volume,
          open_price: price,
          current_price: price,
          sl: order.sl,
          tp: order.tp,
          profit: 0.0,
          open_time: new Date().toISOString(),
          status: 'open',
          comment: `Triggered ${order.type.toUpperCase()}`
        };
        positions.push(pos);

        // Notify client of order trigger execution
        if (io) {
          io.emit('order_trigger', {
            account_id: order.account_id,
            ticket: order.ticket,
            position_ticket: ticket,
            symbol,
            type: order.type,
            price
          });
        }
      } catch (err) {
        addLog(order.account_id, 'warning', `Failed to open position from triggered order: ${err.message}`);
      }
      
      hasChanges = true;
    }
  }

  if (hasChanges) {
    const activeAccountIds = [...new Set([...positions.map(p => p.account_id), ...orders.map(o => o.account_id)])];
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
  const accountOrders = orders.filter(o => o.account_id === accountId);
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
      pending_orders: accountOrders,
      timestamp: account.last_sync_at
    });
  }
}

module.exports = {
  setSocketIo,
  openPosition,
  placeOrder,
  cancelOrder,
  modifySLTP,
  closePosition,
  partialClose,
  closeGroup,
  onPriceUpdate,
  addLog,
  syncAccount,
  io: () => io
};
