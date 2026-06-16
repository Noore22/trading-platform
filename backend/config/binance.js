require('dotenv').config();

module.exports = {
  apiKey: process.env.BINANCE_API_KEY,
  secretKey: process.env.BINANCE_SECRET_KEY,
  apiUrl: 'https://api.binance.com',
  wsUrl: 'wss://stream.binance.com:9443',
  jwtSecret: process.env.SECRET_KEY || 'd3b07384d113edec49eaa6238ad5ff00b798782fba79f225eb5cb181289196b0'
};
