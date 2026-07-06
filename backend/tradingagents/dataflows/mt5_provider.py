import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Annotated, Optional
from io import StringIO

from services.mt5_service import mt5_service

logger = logging.getLogger(__name__)

FOREX_SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD",
                 "USDCAD", "NZDUSD", "EURJPY", "GBPJPY", "XAUUSD",
                 "XAGUSD", "BTCUSD", "ETHUSD", "NAS100", "US30",
                 "GER40", "SPX500"]


def get_mt5_rates(
    symbol: Annotated[str, "ticker symbol of the forex pair"],
    timeframe: Annotated[str, "MT5 timeframe: M1, M5, M15, M30, H1, H4, D1, W1, MN1"],
    count: Annotated[int, "number of bars to fetch"],
) -> list[dict]:
    rates = mt5_service.get_rates(symbol, timeframe, count)
    return rates if rates else []


def get_mt5_stock_data(
    symbol: Annotated[str, "ticker symbol of the forex pair"],
    start_date: Annotated[str, "Start date in yyyy-mm-dd format"],
    end_date: Annotated[str, "End date in yyyy-mm-dd format"],
):
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    days = (end_dt - start_dt).days

    tf = "H1"
    if days <= 1:
        tf = "M5"
        count = (days * 24 * 60) // 5
    elif days <= 7:
        tf = "H1"
        count = days * 24
    elif days <= 30:
        tf = "H4"
        count = days * 6
    else:
        tf = "D1"
        count = days

    count = min(count, 5000)
    rates = mt5_service.get_rates(symbol, tf, max(count, 10))
    if not rates:
        return f"NO_DATA_AVAILABLE: No market data for '{symbol}' from {start_date} to {end_date}"

    header = f"# {tf} OHLCV data for {symbol} from {start_date} to {end_date}\n"
    header += f"# Total records: {len(rates)}\n"
    header += f"# Data retrieved on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"

    buf = StringIO()
    buf.write("Datetime,Open,High,Low,Close,Volume\n")
    for r in rates:
        dt_str = datetime.fromtimestamp(r["time"]).strftime("%Y-%m-%d %H:%M:%S")
        buf.write(f"{dt_str},{r['open']},{r['high']},{r['low']},{r['close']},{r['tick_volume']}\n")

    return header + buf.getvalue()


def calculate_rsi(prices: list[float], period: int = 14) -> float:
    if len(prices) < period + 1:
        return 50.0
    deltas = np.diff(prices[-period - 1:])
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.mean(gains)
    avg_loss = np.mean(losses)
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def calculate_ema(prices: list[float], period: int = 20) -> float:
    if len(prices) < period:
        return float(np.mean(prices)) if prices else 0.0
    multiplier = 2.0 / (period + 1)
    ema = np.mean(prices[:period])
    for price in prices[period:]:
        ema = (price - ema) * multiplier + ema
    return float(ema)


def calculate_macd(prices: list[float]) -> dict:
    if len(prices) < 26:
        return {"macd": 0.0, "signal": 0.0, "histogram": 0.0, "value": "insufficient_data"}
    ema12 = calculate_ema(prices, 12)
    macd_line = ema12 - calculate_ema(prices, 26)
    signal = calculate_ema(prices[-9:], 9) if len(prices) >= 9 else macd_line
    histogram = macd_line - signal
    return {"macd": round(macd_line, 5), "signal": round(signal, 5), "histogram": round(histogram, 5)}


def get_mt5_indicators(
    symbol: Annotated[str, "ticker symbol of the forex pair"],
    indicator: Annotated[str, "technical indicator to analyze"],
    curr_date: Annotated[str, "The current trading date, YYYY-mm-dd"],
    look_back_days: Annotated[int, "how many days to look back"],
) -> str:
    rates = mt5_service.get_rates(symbol, "H1", max(look_back_days * 24, 100))
    if not rates:
        return f"DATA_UNAVAILABLE: No data for {symbol}"

    close_prices = [r["close"] for r in rates]
    high_prices = [r["high"] for r in rates]
    low_prices = [r["low"] for r in rates]

    result = f"# Technical Indicators for {symbol}\n"
    result += f"# Date: {curr_date}\n"
    result += f"# Lookback: {look_back_days} days\n\n"

    current_price = close_prices[-1] if close_prices else 0

    rsi = calculate_rsi(close_prices, 14)
    result += f"RSI(14): {rsi:.1f}\n"
    if rsi > 70:
        result += "  OVERBOUGHT - potential reversal down\n"
    elif rsi < 30:
        result += "  OVERSOLD - potential reversal up\n"
    else:
        result += "  Neutral zone\n"

    macd = calculate_macd(close_prices)
    result += f"MACD: {macd['macd']:.5f}\n"
    result += f"MACD Signal: {macd['signal']:.5f}\n"
    result += f"MACD Histogram: {macd['histogram']:.5f}\n"
    if macd["histogram"] > 0:
        result += "  MACD above signal - bullish momentum\n"
    else:
        result += "  MACD below signal - bearish momentum\n"

    ema_9 = calculate_ema(close_prices, 9)
    ema_20 = calculate_ema(close_prices, 20)
    ema_50 = calculate_ema(close_prices, 50) if len(close_prices) >= 50 else None
    result += f"EMA(9): {ema_9:.5f}\n"
    result += f"EMA(20): {ema_20:.5f}\n"
    result += f"Current Price: {current_price:.5f}\n"
    result += f"Price vs EMA(9): {'ABOVE (bullish)' if current_price > ema_9 else 'BELOW (bearish)'}\n"
    result += f"Price vs EMA(20): {'ABOVE (bullish)' if current_price > ema_20 else 'BELOW (bearish)'}\n"
    if ema_50:
        result += f"Price vs EMA(50): {'ABOVE (bullish)' if current_price > ema_50 else 'BELOW (bearish)'}\n"

    highest_high = max(high_prices[-20:]) if len(high_prices) >= 20 else max(high_prices)
    lowest_low = min(low_prices[-20:]) if len(low_prices) >= 20 else min(low_prices)
    atr = highest_high - lowest_low
    result += f"\n20-period Range: {lowest_low:.5f} - {highest_high:.5f}\n"
    result += f"ATR (approx): {atr:.5f}\n"

    return result


def get_mt5_market_snapshot(
    symbol: Annotated[str, "ticker symbol to get current market data for"],
) -> str:
    tick = mt5_service.get_tick(symbol)
    if not tick:
        return f"DATA_UNAVAILABLE: Cannot get current tick for {symbol}"

    rates_d1 = mt5_service.get_rates(symbol, "D1", 2)
    rates_h1 = mt5_service.get_rates(symbol, "H1", 24)

    result = f"# Market Snapshot for {symbol}\n"
    result += f"# Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    result += f"Bid: {tick['bid']}\n"
    result += f"Ask: {tick['ask']}\n"
    result += f"Spread: {abs(tick['ask'] - tick['bid']):.5f}\n"
    result += f"Last Volume: {tick['volume']}\n"

    if rates_d1 and len(rates_d1) >= 2:
        change_pct = ((rates_d1[-1]["close"] - rates_d1[-2]["close"]) / rates_d1[-2]["close"]) * 100
        result += f"Daily Change: {change_pct:+.3f}%\n"
        result += f"Daily Open: {rates_d1[-1]['open']}\n"
        result += f"Daily High: {rates_d1[-1]['high']}\n"
        result += f"Daily Low: {rates_d1[-1]['low']}\n"

    if rates_h1:
        h1_close = [r["close"] for r in rates_h1]
        rsi_val = calculate_rsi(h1_close, 14)
        result += f"\nH1 RSI(14): {rsi_val:.1f}\n"

    return result


def get_mt5_forex_fundamentals(
    symbol: Annotated[str, "ticker symbol"],
) -> str:
    return (
        f"NO_FUNDAMENTAL_DATA: Forex pair '{symbol}' has no balance sheet, "
        f"income statement, or cash flow statement. Forex analysis is based on "
        f"technical indicators, macroeconomic factors, and geopolitical events. "
        f"Use macro indicators (interest rates, GDP, inflation) from FRED or "
        f"other economic data sources for fundamental context."
    )
