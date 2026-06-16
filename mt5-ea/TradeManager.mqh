//+------------------------------------------------------------------+
//|                                                 TradeManager.mqh |
//|                                  Copyright 2026, Trading Platform|
//|                                             https://localhost    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trading Platform"
#property link      "https://localhost"
#property strict

#include <Trade\Trade.mqh>
#include <Trade\PositionInfo.mqh>

class CTradeManager
{
private:
   CTrade         m_trade;
   CPositionInfo  m_position;

public:
   CTradeManager()
   {
      m_trade.SetDeviationInPoints(30);
      m_trade.SetTypeFilling(ORDER_FILLING_FOK);
   }

   // 1. Open Position (Buy/Sell)
   bool OpenPosition(string symbol, string direction, double volume, double sl = 0.0, double tp = 0.0, string comment = "")
   {
      symbol = StringToUpper(symbol);
      double price = 0.0;
      
      // Select appropriate execution price
      if(direction == "buy" || direction == "BUY")
      {
         price = SymbolInfoDouble(symbol, SYMBOL_ASK);
         if(price <= 0) return false;
         
         double ask_sl = (sl > 0) ? sl : 0.0;
         double ask_tp = (tp > 0) ? tp : 0.0;
         
         Print("Executing BUY on ", symbol, " Volume: ", volume, " Ask: ", price, " SL: ", ask_sl, " TP: ", ask_tp);
         return m_trade.Buy(volume, symbol, price, ask_sl, ask_tp, comment);
      }
      else if(direction == "sell" || direction == "SELL")
      {
         price = SymbolInfoDouble(symbol, SYMBOL_BID);
         if(price <= 0) return false;
         
         double bid_sl = (sl > 0) ? sl : 0.0;
         double bid_tp = (tp > 0) ? tp : 0.0;
         
         Print("Executing SELL on ", symbol, " Volume: ", volume, " Bid: ", price, " SL: ", bid_sl, " TP: ", bid_tp);
         return m_trade.Sell(volume, symbol, price, bid_sl, bid_tp, comment);
      }
      
      Print("Invalid direction: ", direction);
      return false;
   }

   // 2. Close Position by ticket
   bool ClosePosition(long ticket)
   {
      if(m_position.SelectByTicket(ticket))
      {
         Print("Closing position ticket: ", ticket);
         return m_trade.PositionClose(ticket);
      }
      Print("Position ticket ", ticket, " not found to close");
      return false;
   }

   // 3. Close All positions
   bool CloseAllPositions()
   {
      bool success = true;
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0)
         {
            if(!m_trade.PositionClose(ticket))
            {
               success = false;
               Print("Failed to close position: ", ticket);
            }
         }
      }
      Print("CloseAll positions executed. Status: ", success ? "Success" : "Errors");
      return success;
   }

   // 4. Close buy positions only
   bool CloseBuyPositions()
   {
      bool success = true;
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0 && PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY)
         {
            if(!m_trade.PositionClose(ticket))
               success = false;
         }
      }
      return success;
   }

   // 5. Close sell positions only
   bool CloseSellPositions()
   {
      bool success = true;
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0 && PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_SELL)
         {
            if(!m_trade.PositionClose(ticket))
               success = false;
         }
      }
      return success;
   }

   // 6. Modify Stop Loss and Take Profit
   bool ModifySLTP(long ticket, double sl, double tp)
   {
      if(m_position.SelectByTicket(ticket))
      {
         Print("Modifying ticket ", ticket, " SL: ", sl, " TP: ", tp);
         return m_trade.PositionModify(ticket, sl, tp);
      }
      Print("Modify ticket ", ticket, " not found");
      return false;
   }

   // 7. Partial Close
   bool PartialClose(long ticket, double volume)
   {
      if(m_position.SelectByTicket(ticket))
      {
         double current_volume = m_position.Volume();
         if(volume >= current_volume)
         {
            // Close completely if volume is equal or greater
            return m_trade.PositionClose(ticket);
         }
         
         Print("Partial Close ticket ", ticket, " Close Volume: ", volume, " (Total: ", current_volume, ")");
         return m_trade.PositionClosePartial(ticket, volume);
      }
      Print("Partial close ticket ", ticket, " not found");
      return false;
   }
   
   // 8. Trailing Stop Logic (applied to all active positions)
   void TrailingStop(double points)
   {
      if(points <= 0) return;
      
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0 && m_position.SelectByTicket(ticket))
         {
            string symbol = m_position.Symbol();
            double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
            double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
            double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
            double current_sl = m_position.StopLoss();
            double open_price = m_position.PriceOpen();
            
            if(m_position.PositionType() == POSITION_TYPE_BUY)
            {
               // Buy trailing stop: move SL up as price goes up
               if(bid - open_price > points * point)
               {
                  double new_sl = bid - points * point;
                  if(current_sl < new_sl - point)
                  {
                     m_trade.PositionModify(ticket, NormalizeDouble(new_sl, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)), m_position.TakeProfit());
                  }
               }
            }
            else if(m_position.PositionType() == POSITION_TYPE_SELL)
            {
               // Sell trailing stop: move SL down as price goes down
               if(open_price - ask > points * point)
               {
                  double new_sl = ask + points * point;
                  if(current_sl == 0 || current_sl > new_sl + point)
                  {
                     m_trade.PositionModify(ticket, NormalizeDouble(new_sl, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)), m_position.TakeProfit());
                  }
               }
            }
         }
      }
   }
};
