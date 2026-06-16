//+------------------------------------------------------------------+
//|                                                       Config.mqh |
//|                                  Copyright 2026, Trading Platform|
//|                                             https://localhost    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trading Platform"
#property link      "https://localhost"
#property strict

// Input parameter configurations
input group "=== API Config ==="
input string   InpApiBaseUrl      = "http://127.0.0.1:8000/api/v1"; // FastAPI Backend base URL
input string   InpApiToken        = "token_scalper_pro_secret_9988"; // MT5 API Access Token
input int      InpSyncIntervalSeconds = 1;                         // Terminal sync interval in seconds

input group "=== Local Safety Controls ==="
input double   InpMaxDailyDrawdownPercent = 5.0;                   // Local Max Daily Drawdown %
input bool     InpLocalRiskManagement     = true;                  // Enable local checks alongside API targets

// Global state variables
struct SState
{
   string   api_url;
   string   api_token;
   int      sync_interval_sec;
   double   max_drawdown_pct;
   bool     local_risk_mgmt;
   bool     bot_running;
   bool     auto_trading_enabled;
   double   initial_daily_balance;
};

// Global config instance
SState GlConfigState;

//+------------------------------------------------------------------+
//| Initialize global configuration from inputs                      |
//+------------------------------------------------------------------+
void InitConfig()
{
   GlConfigState.api_url = InpApiBaseUrl;
   GlConfigState.api_token = InpApiToken;
   GlConfigState.sync_interval_sec = InpSyncIntervalSeconds;
   GlConfigState.max_drawdown_pct = InpMaxDailyDrawdownPercent;
   GlConfigState.local_risk_mgmt = InpLocalRiskManagement;
   GlConfigState.bot_running = false;
   GlConfigState.auto_trading_enabled = true;
   GlConfigState.initial_daily_balance = AccountInfoDouble(ACCOUNT_BALANCE);
   
   Print("Config initialized. API Endpoint: ", GlConfigState.api_url);
}
