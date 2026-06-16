const express = require('express');
const router = express.Router();
const logs = require('../data/logs');
const authMiddleware = require('../middleware/auth');

router.get('/:accountId', authMiddleware, (req, res) => {
  const accountId = parseInt(req.params.accountId);
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;

  const accountLogs = logs.filter(l => l.account_id === accountId).slice(0, limit);
  return res.json(accountLogs);
});

module.exports = router;
