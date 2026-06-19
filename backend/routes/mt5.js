const express = require('express');
const router = express.Router();
const StorageManager = require('../services/StorageManager');
const tradeEngine = require('../services/tradeEngine');
const marketDataService = require('../services/marketDataService');
const authMiddleware = require('../middleware/auth');

router.get('/account', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  if (!activeAccount) {
    return res.status(404).json({ detail: 'No active account found' });
  }
  return res.json({
    login: activeAccount.login,
    broker: activeAccount.broker,
    server: activeAccount.server,
    balance: activeAccount.balance,
    equity: activeAccount.equity,
    margin: activeAccount.margin,
    free_margin: activeAccount.free_margin,
    margin_level: activeAccount.margin_level,
    profit: activeAccount.floating_profit
  });
});

router.get('/positions', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const positions = await StorageManager.read('positions');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const activePositions = positions.filter(p => p.account_id === activeAccount.id);
  return res.json(activePositions);
});

router.get('/history', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const trades = await StorageManager.read('trades');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const activeTrades = trades.filter(t => t.account_id === activeAccount.id);
  return res.json(activeTrades);
});

router.post('/buy', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { symbol, lot_size, stop_loss, take_profit } = req.body;
  try {
    const pos = tradeEngine.openPosition(activeAccount.id, {
      symbol,
      type: 'buy',
      volume: lot_size,
      sl: stop_loss,
      tp: take_profit
    });
    return res.json({ status: 'success', ticket: pos.ticket, price: pos.open_price });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/sell', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { symbol, lot_size, stop_loss, take_profit } = req.body;
  try {
    const pos = tradeEngine.openPosition(activeAccount.id, {
      symbol,
      type: 'sell',
      volume: lot_size,
      sl: stop_loss,
      tp: take_profit
    });
    return res.json({ status: 'success', ticket: pos.ticket, price: pos.open_price });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/close', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { ticket } = req.body;
  try {
    const pos = tradeEngine.closePosition(activeAccount.id, ticket, 'manual close');
    return res.json({ status: 'success', ticket: pos.ticket });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/close-all', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  try {
    const result = tradeEngine.closeGroup(activeAccount.id, 'close_all');
    return res.json({ status: 'success', closed_count: result.closed_count });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/modify-sl-tp', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { ticket, sl, tp } = req.body;
  try {
    const pos = tradeEngine.modifySLTP(activeAccount.id, ticket, sl, tp);
    return res.json({ status: 'success', ticket: pos.ticket });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/partial-close', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { ticket, volume } = req.body;
  try {
    const pos = tradeEngine.partialClose(activeAccount.id, ticket, volume);
    return res.json({ status: 'success', ticket: pos.ticket });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/connect', authMiddleware, (req, res) => {
  return res.json({
    connected: true,
    status: 'connected',
    message: 'Connected to simulated trade engine.'
  });
});

router.get('/status', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const positions = await StorageManager.read('positions');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const activePositions = positions.filter(p => p.account_id === activeAccount.id);
  
  return res.json({
    connected: marketDataService.isConnected(),
    login: activeAccount.login,
    server: activeAccount.server,
    balance: activeAccount.balance,
    equity: activeAccount.equity,
    profit: activeAccount.floating_profit,
    margin: activeAccount.margin,
    free_margin: activeAccount.free_margin,
    positions: activePositions,
    open_positions: activePositions,
    error: marketDataService.isConnected() ? null : 'Market data stream disconnected',
    last_update: activeAccount.last_sync_at
  });
});

// --- PENDING LIMIT/STOP ORDERS ---
router.get('/orders', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const orders = await StorageManager.read('orders');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const pendingOrders = orders.filter(o => o.account_id === activeAccount.id);
  return res.json(pendingOrders);
});

router.post('/order', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { symbol, type, lot_size, price, stop_loss, take_profit } = req.body;
  try {
    const order = tradeEngine.placeOrder(activeAccount.id, {
      symbol,
      type, // buy_limit, buy_stop, sell_limit, sell_stop
      volume: lot_size,
      price,
      sl: stop_loss,
      tp: take_profit
    });
    return res.json({ status: 'success', ticket: order.ticket });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.delete('/order/:ticket', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const ticket = parseInt(req.params.ticket);
  try {
    const order = tradeEngine.cancelOrder(activeAccount.id, ticket);
    return res.json({ status: 'success', ticket: order.ticket });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

// --- STRATEGY BOT CONTROLS ---
router.get('/bot/status', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const strategies = await StorageManager.read('strategies');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const activeBots = Array.isArray(strategies) ? {} : strategies[activeAccount.id] || {};
  return res.json(activeBots);
});

router.post('/bot/strategy', authMiddleware, async (req, res) => {
  const accounts = await StorageManager.read('accounts');
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { symbol, strategy, active } = req.body;
  let strategies = await StorageManager.read('strategies');
  if (Array.isArray(strategies)) strategies = {};
  
  if (!strategies[activeAccount.id]) {
    strategies[activeAccount.id] = {};
  }
  
  if (!strategies[activeAccount.id][symbol]) {
    strategies[activeAccount.id][symbol] = [];
  }
  
  const currentList = strategies[activeAccount.id][symbol];
  if (active) {
    if (!currentList.includes(strategy)) {
      currentList.push(strategy);
    }
  } else {
    strategies[activeAccount.id][symbol] = currentList.filter(s => s !== strategy);
  }
  
  await StorageManager.write('strategies', strategies);
  tradeEngine.addLog(activeAccount.id, 'info', `Bot Strategy updated for ${symbol}: ${strategy} is now ${active ? 'ENABLED' : 'DISABLED'}`);
  
  return res.json({ status: 'success', active_bots: strategies[activeAccount.id][symbol] });
});

module.exports = router;
