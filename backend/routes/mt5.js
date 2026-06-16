const express = require('express');
const router = express.Router();
const accounts = require('../data/accounts');
const positions = require('../data/positions');
const trades = require('../data/trades');
const tradeEngine = require('../services/tradeEngine');
const binanceService = require('../services/binanceService');
const authMiddleware = require('../middleware/auth');

router.get('/account', authMiddleware, (req, res) => {
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

router.get('/positions', authMiddleware, (req, res) => {
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const activePositions = positions.filter(p => p.account_id === activeAccount.id);
  return res.json(activePositions);
});

router.get('/history', authMiddleware, (req, res) => {
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const activeTrades = trades.filter(t => t.account_id === activeAccount.id);
  return res.json(activeTrades);
});

router.post('/buy', authMiddleware, (req, res) => {
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

router.post('/sell', authMiddleware, (req, res) => {
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

router.post('/close', authMiddleware, (req, res) => {
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { ticket } = req.body;
  try {
    const pos = tradeEngine.closePosition(activeAccount.id, ticket, 'manual close');
    return res.json({ status: 'success', ticket: pos.ticket });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/close-all', authMiddleware, (req, res) => {
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  try {
    const result = tradeEngine.closeGroup(activeAccount.id, 'close_all');
    return res.json({ status: 'success', closed_count: result.closed_count });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/modify-sl-tp', authMiddleware, (req, res) => {
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const { ticket, sl, tp } = req.body;
  try {
    const pos = tradeEngine.modifySLTP(activeAccount.id, ticket, sl, tp);
    return res.json({ status: 'success', ticket: pos.ticket });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/partial-close', authMiddleware, (req, res) => {
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
    message: 'Connected to simulated Binance trade engine.'
  });
});

router.get('/status', authMiddleware, (req, res) => {
  const activeAccount = accounts.find(a => a.is_active) || accounts[0];
  const activePositions = positions.filter(p => p.account_id === activeAccount.id);
  
  return res.json({
    connected: binanceService.isConnected(),
    login: activeAccount.login,
    server: activeAccount.server,
    balance: activeAccount.balance,
    equity: activeAccount.equity,
    profit: activeAccount.floating_profit,
    margin: activeAccount.margin,
    free_margin: activeAccount.free_margin,
    positions: activePositions,
    open_positions: activePositions,
    error: binanceService.isConnected() ? null : 'Binance stream disconnected',
    last_update: activeAccount.last_sync_at
  });
});

module.exports = router;
