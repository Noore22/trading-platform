const settings = {
  1: {
    id: 1,
    account_id: 1,
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
  }
};

module.exports = settings;
