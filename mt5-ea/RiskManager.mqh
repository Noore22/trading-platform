//+------------------------------------------------------------------+
//|                                                  RiskManager.mqh |
//|                                  Copyright 2026, Trading Platform|
//|                                             https://localhost    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trading Platform"
#property link      "https://localhost"
#property strict

#include "Config.mqh"

class CRiskManager
{
public:
   // Check local equity limits
   bool CheckRiskDrawdown()
   {
      if(!GlConfigState.local_risk_mgmt)
         return false; // Local safety disabled
         
      double equity = AccountInfoDouble(ACCOUNT_EQUITY);
      double initial = GlConfigState.initial_daily_balance;
      
      if(initial <= 0) return false;
      
      double dd_pct = (initial - equity) / initial * 100.0;
      
      if(dd_pct >= GlConfigState.max_drawdown_pct)
      {
         Print("CRITICAL: Local Daily Drawdown breached. current: ", DoubleToString(dd_pct, 2), "%, Limit: ", DoubleToString(GlConfigState.max_drawdown_pct, 2), "%");
         return true;
      }
      
      return false;
   }
   
   // Check if trading is allowed within hours
   bool IsInsideTradingHours(string start_hour_str, string end_hour_str)
   {
      datetime dt = TimeCurrent();
      MqlDateTime mql_dt;
      TimeToStruct(dt, mql_dt);
      
      int current_minutes = mql_dt.hour * 60 + mql_dt.min;
      
      // Parse start (e.g., "08:00")
      int start_hour = 0, start_min = 0;
      string start_parts[];
      if(StringSplit(start_hour_str, ':', start_parts) == 2)
      {
         start_hour = (int)StringToInteger(start_parts[0]);
         start_min = (int)StringToInteger(start_parts[1]);
      }
      
      // Parse end (e.g., "20:00")
      int end_hour = 23, end_min = 59;
      string end_parts[];
      if(StringSplit(end_hour_str, ':', end_parts) == 2)
      {
         end_hour = (int)StringToInteger(end_parts[0]);
         end_min = (int)StringToInteger(end_parts[1]);
      }
      
      int start_minutes = start_hour * 60 + start_min;
      int end_minutes = end_hour * 60 + end_min;
      
      if(start_minutes <= end_minutes)
      {
         return (current_minutes >= start_minutes && current_minutes <= end_minutes);
      }
      else
      {
         // Overnight schedule (e.g., start 22:00, end 04:00)
         return (current_minutes >= start_minutes || current_minutes <= end_minutes);
      }
   }
   
   // Reset daily equity watermark at midnight
   void ResetDailyWatermarkIfNewDay()
   {
      static int last_day = -1;
      datetime dt = TimeCurrent();
      MqlDateTime mql_dt;
      TimeToStruct(dt, mql_dt);
      
      if(last_day == -1)
      {
         last_day = mql_dt.day;
         return;
      }
      
      if(mql_dt.day != last_day)
      {
         GlConfigState.initial_daily_balance = AccountInfoDouble(ACCOUNT_BALANCE);
         last_day = mql_dt.day;
         Print("New day detected. Resetting initial daily watermark to: ", GlConfigState.initial_daily_balance);
      }
   }
};
