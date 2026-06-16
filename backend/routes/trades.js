const express = require('express');
const router = express.Router();
const positions = require('../data/positions');
const trades = require('../data/trades');
const tradeEngine = require('../services/tradeEngine');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const accountId = req.query.account_id ? parseInt(req.query.account_id) : null;
  const status = req.query.status; // 'open' | 'closed'
  const symbol = req.query.symbol;

  let list = [];
  if (status === 'open') {
    list = [...positions];
  } else if (status === 'closed') {
    list = [...trades];
  } else {
    list = [...positions, ...trades];
  }

  if (accountId) {
    list = list.filter(t => t.account_id === accountId);
  }
  if (symbol) {
    list = list.filter(t => t.symbol.toUpperCase() === symbol.toUpperCase());
  }

  return res.json(list);
});

router.post('/manual-trade', authMiddleware, (req, res) => {
  const accountId = req.query.account_id ? parseInt(req.query.account_id) : null;
  if (!accountId) {
    return res.status(400).json({ detail: 'account_id query parameter required' });
  }

  try {
    const { symbol, type, volume, sl, tp } = req.body;
    const pos = tradeEngine.openPosition(accountId, { symbol, type, volume, sl, tp });
    return res.json(pos);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/modify-sl-tp', authMiddleware, (req, res) => {
  const accountId = req.query.account_id ? parseInt(req.query.account_id) : null;
  if (!accountId) {
    return res.status(400).json({ detail: 'account_id query parameter required' });
  }

  try {
    const { ticket, sl, tp } = req.body;
    const pos = tradeEngine.modifySLTP(accountId, ticket, sl, tp);
    return res.json(pos);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/partial-close', authMiddleware, (req, res) => {
  const accountId = req.query.account_id ? parseInt(req.query.account_id) : null;
  if (!accountId) {
    return res.status(400).json({ detail: 'account_id query parameter required' });
  }

  try {
    const { ticket, volume } = req.body;
    const pos = tradeEngine.partialClose(accountId, ticket, volume);
    return res.json(pos);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post('/close-group', authMiddleware, (req, res) => {
  const accountId = req.query.account_id ? parseInt(req.query.account_id) : null;
  const action = req.query.action; // 'close_all' | 'close_buys' | 'close_sells'
  
  if (!accountId || !action) {
    return res.status(400).json({ detail: 'account_id and action query parameters required' });
  }

  try {
    const result = tradeEngine.closeGroup(accountId, action);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
});

module.exports = router;
