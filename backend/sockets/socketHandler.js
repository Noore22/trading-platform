const jwt = require('jsonwebtoken');
const config = require('../config/binance');
const users = require('../data/users');
const tradeEngine = require('../services/tradeEngine');
const binanceService = require('../services/binanceService');

let io = null;

function init(socketIoInstance) {
  io = socketIoInstance;
  tradeEngine.setSocketIo(io);
  
  // Connect to Binance feeds
  binanceService.connectWebSocket(io);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Immediately push initial data to this specific client
    const accounts = require('../data/accounts');
    const activeAccount = accounts.find(a => a.is_active) || accounts[0];
    if (activeAccount) {
      tradeEngine.syncAccount(activeAccount.id);
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = {
  init
};
