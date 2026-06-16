const express = require('express');
const router = express.Router();
const accounts = require('../data/accounts');
const positions = require('../data/positions');
const trades = require('../data/trades');
const authMiddleware = require('../middleware/auth');

router.get('/:accountId/stats', authMiddleware, (req, res) => {
  const accountId = parseInt(req.params.accountId);
  const account = accounts.find(a => a.id === accountId);
  if (!account) {
    return res.status(404).json({ detail: 'Account not found' });
  }

  const accountPositions = positions.filter(p => p.account_id === accountId);
  const accountTrades = trades.filter(t => t.account_id === accountId);

  const totalBalance = account.balance;
  const totalEquity = account.equity;
  const floatingProfit = account.floating_profit;

  const totalWinTrades = accountTrades.filter(t => t.profit > 0).length;
  const winRate = accountTrades.length > 0 ? (totalWinTrades / accountTrades.length) * 100 : 0.0;

  return res.json({
    total_balance: totalBalance,
    total_equity: totalEquity,
    total_free_margin: account.free_margin,
    total_profit: accountTrades.reduce((sum, t) => sum + t.profit, 0),
    daily_profit: account.daily_profit || 0.0,
    weekly_profit: account.weekly_profit || 0.0,
    monthly_profit: account.monthly_profit || 0.0,
    open_trades_count: accountPositions.length,
    closed_trades_count: accountTrades.length,
    win_rate: winRate,
    max_drawdown: 1.25,
    risk_score: accountPositions.length > 3 ? 65 : 25
  });
});

router.get('/:accountId/charts', authMiddleware, (req, res) => {
  const accountId = parseInt(req.params.accountId);
  const accountTrades = trades.filter(t => t.account_id === accountId);

  const dayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  accountTrades.forEach(t => {
    if (t.close_time) {
      const date = new Date(t.close_time);
      const dayName = days[date.getDay()];
      if (dayMap[dayName] !== undefined) {
        dayMap[dayName] += t.profit;
      }
    }
  });

  const chartData = Object.keys(dayMap).map(day => ({
    date: day,
    profit: parseFloat(dayMap[day].toFixed(2)),
    trades: accountTrades.filter(t => {
      const date = new Date(t.close_time);
      return days[date.getDay()] === day;
    }).length
  }));

  return res.json(chartData);
});

module.exports = router;
