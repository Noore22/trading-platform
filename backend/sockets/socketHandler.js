const jwt = require('jsonwebtoken');
const config = require('../config/marketData');
const users = require('../data/users');
const tradeEngine = require('../services/tradeEngine');
const marketDataService = require('../services/marketDataService');

let io = null;

function init(socketIoInstance) {
  io = socketIoInstance;
  tradeEngine.setSocketIo(io);
  
  // Connect to live multi-market feeds
  marketDataService.connectWebSocket(io);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    socket.subscriptions = [];

    // Immediately push initial data to this specific client
    const StorageManager = require('../services/StorageManager');
    const accounts = StorageManager.getCache('accounts');
    if (accounts) {
      const activeAccount = accounts.find(a => a.is_active) || accounts[0];
      if (activeAccount) {
        tradeEngine.syncAccount(activeAccount.id);
      }
    }

    socket.on('subscribe', (symbols) => {
      if (Array.isArray(symbols)) {
        socket.subscriptions = [...new Set([...socket.subscriptions, ...symbols])];
      }
    });

    socket.on('unsubscribe', (symbols) => {
      if (Array.isArray(symbols)) {
        socket.subscriptions = socket.subscriptions.filter(s => !symbols.includes(s));
      } else if (symbols === 'all') {
        socket.subscriptions = [];
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = {
  init
};
