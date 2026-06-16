//+------------------------------------------------------------------+
//|                                                       EA_Bot.mq5 |
//|                                  Copyright 2026, Trading Platform|
//|                                             https://localhost    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trading Platform"
#property link      "https://localhost"
#property version   "1.00"
#property strict

// Include header files
#include "Config.mqh"
#include "ApiClient.mqh"
#include "RiskManager.mqh"
#include "TradeManager.mqh"
#include "TelegramManager.mqh"

// Instantiate managers
CApiClient        ApiClient;
CRiskManager      RiskManager;
CTradeManager     TradeManager;
CTelegramManager  Telegram;

// Trading Strategy Input Group
input group "=== MA Automation Strategy ==="
input bool     InpStrategyEnabled = true;       // Enable Automated Moving Average Strategy
input int      InpFastMAPeriod    = 10;         // Fast Moving Average Period
input int      InpSlowMAPeriod    = 20;         // Slow Moving Average Period

// Local variables
int            MAFastHandle;
int            MASlowHandle;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Initializing MT5 Trading Automation EA...");
   
   // Load inputs into global config state
   InitConfig();
   
   // Set up timer for API Sync updates (Required: Every 1 second)
   EventSetTimer(1);
   
   // Initialize Moving Average indicator handles for strategy
   MAFastHandle = iMA(_Symbol, _Period, InpFastMAPeriod, 0, MODE_EMA, PRICE_CLOSE);
   MASlowHandle = iMA(_Symbol, _Period, InpSlowMAPeriod, 0, MODE_EMA, PRICE_CLOSE);
   
   if(MAFastHandle == INVALID_HANDLE || MASlowHandle == INVALID_HANDLE)
   {
      Print("Error creating indicator handles.");
      return(INIT_FAILED);
   }
   
   Print("EA loaded successfully. Ready for Dashboard commands.");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   IndicatorRelease(MAFastHandle);
   IndicatorRelease(MASlowHandle);
   Print("EA deinitialized. Reason code: ", reason);
}

//+------------------------------------------------------------------+
//| Helper to calculate realized net profit and win rate metrics     |
//+------------------------------------------------------------------+
void CalculatePerformanceMetrics(double &daily_profit, double &weekly_profit, double &monthly_profit, double &win_rate)
{
   daily_profit = 0.0;
   weekly_profit = 0.0;
   monthly_profit = 0.0;
   win_rate = 0.0;
   
   int win_count = 0;
   int loss_count = 0;
   
   MqlDateTime current_time;
   TimeToStruct(TimeCurrent(), current_time);
   
   // Start of today (00:00)
   MqlDateTime today_struct = current_time;
   today_struct.hour = 0;
   today_struct.min = 0;
   today_struct.sec = 0;
   datetime start_of_day = StructToTime(today_struct);
   
   // Start of week (Monday 00:00)
   int days_since_monday = current_time.day_of_week - 1;
   if(days_since_monday < 0) days_since_monday = 6;
   datetime start_of_week = start_of_day - days_since_monday * 86400;
   
   // Start of month (1st of month 00:00)
   MqlDateTime month_struct = current_time;
   month_struct.day = 1;
   month_struct.hour = 0;
   month_struct.min = 0;
   month_struct.sec = 0;
   datetime start_of_month = StructToTime(month_struct);
   
   // Select deals history (from beginning of the month onwards)
   datetime start_select = start_of_month;
   if (start_of_week < start_select) start_select = start_of_week;
   
   if(HistorySelect(start_select, TimeCurrent()))
   {
      int deals_total = HistoryDealsTotal();
      for(int i = 0; i < deals_total; i++)
      {
         ulong deal_ticket = HistoryDealGetTicket(i);
         if(deal_ticket > 0)
         {
            long entry_type = HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
            // Sum exiting deals profit, commission and swap
            if(entry_type == DEAL_ENTRY_OUT)
            {
               double deal_profit = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
               double deal_commission = HistoryDealGetDouble(deal_ticket, DEAL_COMMISSION);
               double deal_swap = HistoryDealGetDouble(deal_ticket, DEAL_SWAP);
               double net_profit = deal_profit + deal_commission + deal_swap;
               
               datetime deal_time = (datetime)HistoryDealGetInteger(deal_ticket, DEAL_TIME);
               
               if(deal_time >= start_of_day)
               {
                  daily_profit += net_profit;
               }
               if(deal_time >= start_of_week)
               {
                  weekly_profit += net_profit;
               }
               if(deal_time >= start_of_month)
               {
                  monthly_profit += net_profit;
               }
               
               if(net_profit > 0) win_count++;
               else if(net_profit < 0) loss_count++;
            }
         }
      }
   }
   
   if(win_count + loss_count > 0)
   {
      win_rate = ((double)win_count / (win_count + loss_count)) * 100.0;
   }
}

//+------------------------------------------------------------------+
//| Timer function - Handles Web API synchronization                 |
//+------------------------------------------------------------------+
void OnTimer()
{
   // 1. Reset initial daily watermark if a new calendar day has started
   RiskManager.ResetDailyWatermarkIfNewDay();

   // 2. Perform Local Drawdown Safety Checks
   if(RiskManager.CheckRiskDrawdown())
   {
      Print("EMERGENCY: Local drawdown limit exceeded! Closing all positions.");
      TradeManager.CloseAllPositions();
      GlConfigState.bot_running = false;
      GlConfigState.auto_trading_enabled = false;
   }

   // 3. Assemble trade and account reports for synchronization
   double balance        = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity         = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin         = AccountInfoDouble(ACCOUNT_MARGIN);
   double free_margin    = AccountInfoDouble(ACCOUNT_FREE_MARGIN);
   double margin_level   = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
   double floating_profit = AccountInfoDouble(ACCOUNT_PROFIT);
   
   // Calculate real-time profit and win statistics
   double daily_profit = 0;
   double weekly_profit = 0;
   double monthly_profit = 0;
   double win_rate = 0;
   CalculatePerformanceMetrics(daily_profit, weekly_profit, monthly_profit, win_rate);

   // Array to compile open positions & historical trades
   SMT5TradeReport reports[];
   int reports_count = 0;
   
   // Gather active open positions
   int pos_total = PositionsTotal();
   for(int i = 0; i < pos_total; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0)
      {
         ArrayResize(reports, reports_count + 1);
         reports[reports_count].ticket       = ticket;
         reports[reports_count].symbol       = PositionGetString(POSITION_SYMBOL);
         reports[reports_count].type         = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? "buy" : "sell";
         reports[reports_count].volume       = PositionGetDouble(POSITION_VOLUME);
         reports[reports_count].open_price   = PositionGetDouble(POSITION_PRICE_OPEN);
         reports[reports_count].close_price  = PositionGetDouble(POSITION_PRICE_CURRENT);
         reports[reports_count].sl           = PositionGetDouble(POSITION_SL);
         reports[reports_count].tp           = PositionGetDouble(POSITION_TP);
         reports[reports_count].profit       = PositionGetDouble(POSITION_PROFIT);
         reports[reports_count].open_time     = PositionGetInteger(POSITION_TIME);
         reports[reports_count].close_time    = 0;
         reports[reports_count].status       = "open";
         reports[reports_count].comment      = PositionGetString(POSITION_COMMENT);
         
         reports_count++;
      }
   }
   
   // Gather closed trade history in the last 2 hours (to report finalized closed trades)
   datetime from_time = TimeCurrent() - 7200;
   HistorySelect(from_time, TimeCurrent());
   int deals_total = HistoryDealsTotal();
   for(int i = 0; i < deals_total; i++)
   {
      ulong deal_ticket = HistoryDealGetTicket(i);
      long entry_type = HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
      // We only care about exit deals (DEAL_ENTRY_OUT) since they represent closed trades
      if(deal_ticket > 0 && entry_type == DEAL_ENTRY_OUT)
      {
         long position_ticket = HistoryDealGetInteger(deal_ticket, DEAL_POSITION_ID);
         
         // Avoid duplicates in report
         bool already_added = false;
         for(int j = 0; j < reports_count; j++)
         {
            if(reports[j].ticket == position_ticket)
            {
               already_added = true;
               break;
            }
         }
         
         if(!already_added)
         {
            ArrayResize(reports, reports_count + 1);
            reports[reports_count].ticket       = position_ticket;
            reports[reports_count].symbol       = HistoryDealGetString(deal_ticket, DEAL_SYMBOL);
            long type = HistoryDealGetInteger(deal_ticket, DEAL_TYPE);
            // Reverse type because the EXIT deal is opposite of open direction (e.g. exit buy is a sell deal)
            reports[reports_count].type         = (type == DEAL_TYPE_SELL) ? "buy" : "sell"; 
            reports[reports_count].volume       = HistoryDealGetDouble(deal_ticket, DEAL_VOLUME);
            
            // To get open price, we search the history position database
            reports[reports_count].open_price   = HistoryDealGetDouble(deal_ticket, DEAL_PRICE); // default placeholder
            reports[reports_count].close_price  = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
            reports[reports_count].sl           = 0;
            reports[reports_count].tp           = 0;
            reports[reports_count].profit       = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
            reports[reports_count].open_time     = HistoryDealGetInteger(deal_ticket, DEAL_TIME) - 300; // approximate
            reports[reports_count].close_time    = HistoryDealGetInteger(deal_ticket, DEAL_TIME);
            reports[reports_count].status       = "closed";
            reports[reports_count].comment      = HistoryDealGetString(deal_ticket, DEAL_COMMENT);
            
            reports_count++;
         }
      }
   }
   
   // 4. Synchronize with API Gateway
   string response = "";
   if(ApiClient.Sync(balance, equity, margin, free_margin, margin_level, floating_profit, daily_profit, weekly_profit, monthly_profit, win_rate, reports, reports_count, response))
   {
      // Extract bot configs
      string bot_status = ExtractJsonValue(response, "bot_status", "stopped");
      string auto_trading = ExtractJsonValue(response, "auto_trading_enabled", "true");
      
      GlConfigState.bot_running = (bot_status == "running" || bot_status == "paused");
      GlConfigState.auto_trading_enabled = (auto_trading == "true");
      
      // Parse commands
      int cmd_idx = StringFind(response, "\"commands\":");
      if(cmd_idx >= 0)
      {
         string cmds_section = StringSubstr(response, cmd_idx);
         int start_search = 0;
         
         // Extract individual commands sequentially
         while(true)
         {
            int block_start = StringFind(cmds_section, "{", start_search);
            if(block_start < 0) break;
            
            int block_end = StringFind(cmds_section, "}", block_start);
            if(block_end < 0) break;
            
            string cmd_block = StringSubstr(cmds_section, block_start, block_end - block_start + 1);
            start_search = block_end + 1;
            
            // Parse fields
            string cmd_id = ExtractJsonValue(cmd_block, "id");
            string cmd_name = ExtractJsonValue(cmd_block, "command");
            
            if(cmd_name != "")
            {
               Print("Dashboard command received: ", cmd_name, " (ID: ", cmd_id, ")");
               ExecuteCommand(cmd_name, cmd_block);
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Processes and executes action commands dispatched from Dashboard  |
//+------------------------------------------------------------------+
void ExecuteCommand(string command, string payload)
{
   if(command == "buy" || command == "sell" || command == "BUY" || command == "SELL")
   {
      string symbol = ExtractJsonValue(payload, "symbol");
      if(symbol == "") symbol = _Symbol;
      
      double volume = StringToDouble(ExtractJsonValue(payload, "lot", "0.0"));
      if(volume <= 0.0) volume = StringToDouble(ExtractJsonValue(payload, "volume", "0.01"));
      
      double sl = StringToDouble(ExtractJsonValue(payload, "sl", "0.0"));
      double tp = StringToDouble(ExtractJsonValue(payload, "tp", "0.0"));
      
      string final_type = (command == "buy" || command == "BUY") ? "buy" : "sell";
      TradeManager.OpenPosition(symbol, final_type, volume, sl, tp, "Dashboard Manual");
   }
   else if(command == "close_all" || command == "CLOSE_ALL")
   {
      TradeManager.CloseAllPositions();
   }
   else if(command == "close_buys" || command == "CLOSE_BUYS")
   {
      TradeManager.CloseBuyPositions();
   }
   else if(command == "close_sells" || command == "CLOSE_SELLS")
   {
      TradeManager.CloseSellPositions();
   }
   else if(command == "modify_sl_tp" || command == "MODIFY_SL_TP")
   {
      long ticket = StringToInteger(ExtractJsonValue(payload, "ticket"));
      double sl = StringToDouble(ExtractJsonValue(payload, "sl", "0.0"));
      double tp = StringToDouble(ExtractJsonValue(payload, "tp", "0.0"));
      
      TradeManager.ModifySLTP(ticket, sl, tp);
   }
   else if(command == "partial_close" || command == "PARTIAL_CLOSE")
   {
      long ticket = StringToInteger(ExtractJsonValue(payload, "ticket"));
      double volume = StringToDouble(ExtractJsonValue(payload, "volume", "0.0"));
      
      TradeManager.PartialClose(ticket, volume);
   }
   else if(command == "start" || command == "restart" || command == "START_BOT")
   {
      GlConfigState.bot_running = true;
      Print("EA bot status set to: RUNNING");
   }
   else if(command == "stop" || command == "STOP_BOT")
   {
      GlConfigState.bot_running = false;
      Print("EA bot status set to: STOPPED");
   }
   else if(command == "pause" || command == "PAUSE_BOT")
   {
      GlConfigState.bot_running = false;
      Print("EA bot status set to: PAUSED");
   }
   else if(command == "enable_auto" || command == "ENABLE_AUTO")
   {
      GlConfigState.auto_trading_enabled = true;
      Print("Auto Trading flag ENABLED");
   }
   else if(command == "disable_auto" || command == "DISABLE_AUTO")
   {
      GlConfigState.auto_trading_enabled = false;
      Print("Auto Trading flag DISABLED");
   }
}

//+------------------------------------------------------------------+
//| OnTick - Executes local automated trading bot strategy           |
//+------------------------------------------------------------------+
void OnTick()
{
   // Check strategy configuration flags
   if(!InpStrategyEnabled || !GlConfigState.bot_running || !GlConfigState.auto_trading_enabled)
      return;
      
   // Only execute strategy checks if inside allowed hours
   if(!RiskManager.IsInsideTradingHours("00:00", "23:59"))
      return;
      
   // Implement simple MA crossover strategy for demonstration
   double fast_ma[], slow_ma[];
   ArraySetAsSeries(fast_ma, true);
   ArraySetAsSeries(slow_ma, true);
   
   if(CopyBuffer(MAFastHandle, 0, 0, 3, fast_ma) < 3 || CopyBuffer(MASlowHandle, 0, 0, 3, slow_ma) < 3)
      return;
      
   // Crossover logic
   // Fast MA crosses above Slow MA -> BUY signal
   bool buy_cross = (fast_ma[1] > slow_ma[1]) && (fast_ma[2] <= slow_ma[2]);
   // Fast MA crosses below Slow MA -> SELL signal
   bool sell_cross = (fast_ma[1] < slow_ma[1]) && (fast_ma[2] >= slow_ma[2]);
   
   // If strategy triggers, execute trade if no positions are open on this symbol
   if(PositionsTotal() == 0)
   {
      if(buy_cross)
      {
         Print("Automated Strategy: Buying EURUSD (EMA Crossover)");
         TradeManager.OpenPosition(_Symbol, "buy", 0.05, 0.0, 0.0, "Auto EMA Cross Buy");
      }
      else if(sell_cross)
      {
         Print("Automated Strategy: Selling EURUSD (EMA Crossover)");
         TradeManager.OpenPosition(_Symbol, "sell", 0.05, 0.0, 0.0, "Auto EMA Cross Sell");
      }
   }
}
