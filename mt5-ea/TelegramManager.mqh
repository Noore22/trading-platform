//+------------------------------------------------------------------+
//|                                              TelegramManager.mqh |
//|                                  Copyright 2026, Trading Platform|
//|                                             https://localhost    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trading Platform"
#property link      "https://localhost"
#property strict

class CTelegramManager
{
private:
   string m_bot_token;
   string m_chat_id;

public:
   void Init(string bot_token, string chat_id)
   {
      m_bot_token = bot_token;
      m_chat_id = chat_id;
   }

   // Send a text message directly from the MT5 EA terminal
   bool SendMessage(string message)
   {
      if(m_bot_token == "" || m_chat_id == "")
         return false; // Not configured

      string url = "https://api.telegram.org/bot" + m_bot_token + "/sendMessage";
      string headers = "Content-Type: application/x-www-form-urlencoded\r\n";
      
      // Url encode message and chat ID
      string body = "chat_id=" + m_chat_id + "&text=" + UrlEncode(message) + "&parse_mode=HTML";
      
      char post_data[];
      char result_data[];
      string response_headers = "";
      
      StringToCharArray(body, post_data, 0, WHOLE_ARRAY, CP_UTF8);
      
      ResetLastError();
      // Call standard WebRequest to telegram API
      int res = WebRequest("POST", url, headers, 5000, post_data, result_data, response_headers);
      
      if(res != 200)
      {
         Print("Telegram direct alert failed. Code: ", res);
         return false;
      }
      
      return true;
   }

private:
   // Basic URL encode implementation for safe transmission in HTTP request bodies
   string UrlEncode(string text)
   {
      string encoded = "";
      int len = StringLen(text);
      for(int i = 0; i < len; i++)
      {
         ushort char_code = StringGetCharacter(text, i);
         if((char_code >= 'A' && char_code <= 'Z') ||
            (char_code >= 'a' && char_code <= 'z') ||
            (char_code >= '0' && char_code <= '9') ||
            char_code == '-' || char_code == '_' || char_code == '.' || char_code == '~')
         {
            encoded += CharToString(char_code);
         }
         else if(char_code == ' ')
         {
            encoded += "+";
         }
         else
         {
            encoded += StringFormat("%%%02X", char_code);
         }
      }
      return encoded;
   }
};
