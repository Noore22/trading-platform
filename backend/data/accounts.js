const accounts = [
  {
    id: 1,
    name: "Binance Demo Spot Account",
    login: 888888,
    broker: "Binance Inc.",
    server: "Binance-Spot-Prod",
    api_token: "tok_binance_spot_production_credentials",
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
    is_active: true,
    last_sync_at: new Date().toISOString()
  }
];

module.exports = accounts;
