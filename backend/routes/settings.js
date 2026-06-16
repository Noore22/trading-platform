const express = require('express');
const router = express.Router();
const settingsStore = require('../data/settings');
const authMiddleware = require('../middleware/auth');
const tradeEngine = require('../services/tradeEngine');

router.get('/:accountId', authMiddleware, (req, res) => {
  const accountId = parseInt(req.params.accountId);
  const settings = settingsStore[accountId] || {
    id: accountId,
    account_id: accountId,
    default_lot_size: 0.1,
    risk_percentage: 1.0,
    max_trades: 5,
    trading_hours_start: "00:00",
    trading_hours_end: "23:59",
    allowed_symbols: "BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT,XRPUSDT,ADAUSDT,DOGEUSDT",
    news_filter_enabled: false,
    bot_status: "idle",
    auto_trading_enabled: false,
    take_profit: 100,
    stop_loss: 50,
    trailing_stop: 10,
    max_daily_loss: 500,
    max_daily_profit: 1000
  };
  return res.json(settings);
});

router.put('/:accountId', authMiddleware, (req, res) => {
  const accountId = parseInt(req.params.accountId);
  const current = settingsStore[accountId] || { account_id: accountId };
  
  settingsStore[accountId] = {
    ...current,
    ...req.body,
    id: accountId,
    account_id: accountId
  };

  tradeEngine.addLog(accountId, 'info', 'Updated account trading settings.');
  return res.json(settingsStore[accountId]);
});

router.post('/:accountId/control', authMiddleware, (req, res) => {
  const accountId = parseInt(req.params.accountId);
  const action = req.query.action; // 'start_bot' | 'stop_bot' | 'pause_bot'
  
  if (!settingsStore[accountId]) {
    settingsStore[accountId] = {
      id: accountId,
      account_id: accountId,
      bot_status: 'idle',
      auto_trading_enabled: false
    };
  }

  const current = settingsStore[accountId];
  if (action === 'start_bot') {
    current.bot_status = 'running';
    current.auto_trading_enabled = true;
  } else if (action === 'stop_bot') {
    current.bot_status = 'idle';
    current.auto_trading_enabled = false;
  } else if (action === 'pause_bot') {
    current.bot_status = 'paused';
    current.auto_trading_enabled = false;
  }

  tradeEngine.addLog(accountId, 'info', `Bot control state modified to: ${current.bot_status} (${action})`);
  
  tradeEngine.syncAccount(accountId);
  return res.json(current);
});

module.exports = router;
