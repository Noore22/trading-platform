//+------------------------------------------------------------------+
//|                                                    ApiClient.mqh |
//|                                  Copyright 2026, Trading Platform|
//|                                             https://localhost    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trading Platform"
#property link      "https://localhost"
#property strict

#include "Config.mqh"

// Custom structures to represent trades in MQL5 sync
struct SMT5TradeReport
{
   long     ticket;
   string   symbol;
   string   type;
   double   volume;
   double   open_price;
   double   close_price;
   double   sl;
   double   tp;
   double   profit;
   long     open_time;
   long     close_time;
   string   status;
   string   comment;
};

//+------------------------------------------------------------------+
//| Format a single trade into a JSON string snippet                 |
//+------------------------------------------------------------------+
string TradeToJson(const SMT5TradeReport &trade)
{
   string json = "{";
   json += "\"ticket\":" + IntegerToString(trade.ticket) + ",";
   json += "\"symbol\":\"" + trade.symbol + "\",";
   json += "\"type\":\"" + trade.type + "\",";
   json += "\"volume\":" + DoubleToString(trade.volume, 2) + ",";
   json += "\"open_price\":" + DoubleToString(trade.open_price, 5) + ",";
   json += "\"close_price\":" + DoubleToString(trade.close_price, 5) + ",";
   json += "\"sl\":" + DoubleToString(trade.sl, 5) + ",";
   json += "\"tp\":" + DoubleToString(trade.tp, 5) + ",";
   json += "\"profit\":" + DoubleToString(trade.profit, 2) + ",";
   json += "\"open_time\":" + IntegerToString(trade.open_time) + ",";
   if(trade.close_time > 0)
      json += "\"close_time\":" + IntegerToString(trade.close_time) + ",";
   else
      json += "\"close_time\":null,";
   json += "\"status\":\"" + trade.status + "\",";
   json += "\"comment\":\"" + trade.comment + "\"";
   json += "}";
   return json;
}

//+------------------------------------------------------------------+
//| Substring extractor for simple JSON parsing without external libs|
//+------------------------------------------------------------------+
string ExtractJsonValue(string json, string key, string default_val = "")
{
   string search_key = "\"" + key + "\"";
   int start_pos = StringFind(json, search_key);
   if(start_pos < 0) return default_val;
   
   start_pos += StringLen(search_key);
   // Skip spaces and colons
   while(start_pos < StringLen(json) && 
        (StringSubstr(json, start_pos, 1) == " " || 
         StringSubstr(json, start_pos, 1) == ":"))
   {
      start_pos++;
   }
   
   if(start_pos >= StringLen(json)) return default_val;
   
   string first_char = StringSubstr(json, start_pos, 1);
   if(first_char == "\"")
   {
      // String value, extract until closing quote
      start_pos++;
      int end_pos = StringFind(json, "\"", start_pos);
      if(end_pos < 0) return default_val;
      return StringSubstr(json, start_pos, end_pos - start_pos);
   }
   else
   {
      // Numeric or boolean value, extract until comma, brace or space
      int end_pos = start_pos;
      while(end_pos < StringLen(json))
      {
         string ch = StringSubstr(json, end_pos, 1);
         if(ch == "," || ch == "}" || ch == "]" || ch == "\r" || ch == "\n" || ch == " ")
            break;
         end_pos++;
      }
      return StringSubstr(json, start_pos, end_pos - start_pos);
   }
}

//+------------------------------------------------------------------+
//| Class handling API Gateway WebRequests                           |
//+------------------------------------------------------------------+
class CApiClient
{
public:
   // Synchronizes state with backend and returns true if successful
   bool Sync(double balance, double equity, double margin, double free_margin, double margin_level,
             double floating_profit, double daily_profit, double weekly_profit, double monthly_profit, double win_rate,
             const SMT5TradeReport &trades[], int trades_count, string &out_response)
   {
      // 1. Build JSON Payload
      string trades_json = "";
      for(int i = 0; i < trades_count; i++)
      {
         trades_json += TradeToJson(trades[i]);
         if(i < trades_count - 1)
            trades_json += ",";
      }
      
      string body = "{";
      body += "\"balance\":" + DoubleToString(balance, 2) + ",";
      body += "\"equity\":" + DoubleToString(equity, 2) + ",";
      body += "\"margin\":" + DoubleToString(margin, 2) + ",";
      body += "\"free_margin\":" + DoubleToString(free_margin, 2) + ",";
      body += "\"margin_level\":" + DoubleToString(margin_level, 2) + ",";
      body += "\"floating_profit\":" + DoubleToString(floating_profit, 2) + ",";
      body += "\"daily_profit\":" + DoubleToString(daily_profit, 2) + ",";
      body += "\"weekly_profit\":" + DoubleToString(weekly_profit, 2) + ",";
      body += "\"monthly_profit\":" + DoubleToString(monthly_profit, 2) + ",";
      body += "\"win_rate\":" + DoubleToString(win_rate, 2) + ",";
      body += "\"trades\":[" + trades_json + "]";
      body += "}";
      
      // 2. Prepare HTTP headers
      string url = GlConfigState.api_url + "/mt5/sync";
      string headers = "Content-Type: application/json\r\n" + 
                       "X-MT5-Token: " + GlConfigState.api_token + "\r\n";
      
      char post_data[];
      char result_data[];
      string response_headers = "";
      
      StringToCharArray(body, post_data, 0, WHOLE_ARRAY, CP_UTF8);
      
      // 3. Perform WebRequest
      ResetLastError();
      int res = WebRequest("POST", url, headers, 5000, post_data, result_data, response_headers);
      
      if(res == -1)
      {
         Print("API Request failed. Error code: ", GetLastError());
         return false;
      }
      
      if(res != 200)
      {
         string err_body = CharArrayToString(result_data, 0, WHOLE_ARRAY, CP_UTF8);
         Print("API Sync returned HTTP code: ", res, " Response: ", err_body);
         return false;
      }
      
      out_response = CharArrayToString(result_data, 0, WHOLE_ARRAY, CP_UTF8);
      return true;
   }
};
