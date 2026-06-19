const express = require('express');
const router = express.Router();
const StorageManager = require('../services/StorageManager');
const authMiddleware = require('../middleware/auth');
const tradeEngine = require('../services/tradeEngine');

router.get('/:accountId', authMiddleware, async (req, res) => {
  const accountId = parseInt(req.params.accountId);
  let targetsStore = await StorageManager.read('targets');
  if (Array.isArray(targetsStore)) targetsStore = {};
  
  const targets = targetsStore[accountId] || {
    id: accountId,
    account_id: accountId,
    daily_profit_target: 200,
    monthly_profit_target: 2000,
    daily_loss_limit: 100,
    weekly_loss_limit: 500,
    auto_close_on_target: false,
    auto_disable_on_target: false
  };
  return res.json(targets);
});

router.put('/:accountId', authMiddleware, async (req, res) => {
  const accountId = parseInt(req.params.accountId);
  let targetsStore = await StorageManager.read('targets');
  if (Array.isArray(targetsStore)) targetsStore = {};

  const current = targetsStore[accountId] || { account_id: accountId };

  targetsStore[accountId] = {
    ...current,
    ...req.body,
    id: accountId,
    account_id: accountId
  };

  await StorageManager.write('targets', targetsStore);
  tradeEngine.addLog(accountId, 'info', 'Updated account profit targets and risk limits.');
  return res.json(targetsStore[accountId]);
});

module.exports = router;
