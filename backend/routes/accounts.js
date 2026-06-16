const express = require('express');
const router = express.Router();
const accounts = require('../data/accounts');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  return res.json(accounts);
});

router.post('/', authMiddleware, (req, res) => {
  const { name, login, broker, server } = req.body;
  if (!login) {
    return res.status(400).json({ detail: 'Account login is required' });
  }

  const nextId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
  const newAccount = {
    id: nextId,
    name: name || `Simulated Account ${login}`,
    login: parseInt(login),
    broker: broker || 'Binance Inc.',
    server: server || 'Binance-Spot-Prod',
    api_token: `tok_binance_spot_${login}`,
    balance: 10000.0,
    equity: 10000.0,
    margin: 0.0,
    free_margin: 10000.0,
    margin_level: 0.0,
    floating_profit: 0.0,
    daily_profit: 0.0,
    weekly_profit: 0.0,
    monthly_profit: 0.0,
    win_rate: 0.0,
    is_active: false,
    last_sync_at: new Date().toISOString()
  };

  accounts.push(newAccount);
  return res.json(newAccount);
});

router.put('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const account = accounts.find(a => a.id === id);
  if (!account) {
    return res.status(404).json({ detail: 'Account not found' });
  }

  const { is_active, name, broker, server } = req.body;

  if (is_active !== undefined) {
    if (is_active) {
      // Set all other accounts to active = false
      accounts.forEach(a => { a.is_active = false; });
    }
    account.is_active = is_active;
  }
  if (name !== undefined) account.name = name;
  if (broker !== undefined) account.broker = broker;
  if (server !== undefined) account.server = server;

  return res.json(account);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = accounts.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Account not found' });
  }

  accounts.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
