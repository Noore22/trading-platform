const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET Missing');
    process.exit(1);
}

const config = require('./config/binance');

// Import routes
const authRouter = require('./routes/auth');
const accountsRouter = require('./routes/accounts');
const tradesRouter = require('./routes/trades');
const settingsRouter = require('./routes/settings');
const targetsRouter = require('./routes/targets');
const logsRouter = require('./routes/logs');
const analyticsRouter = require('./routes/analytics');
const mt5Router = require('./routes/mt5');

const app = express();
const server = http.createServer(app);

// Socket.IO Server configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Configure CORS Express Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log HTTP requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Bind API routes
const apiPrefix = '/api/v1';
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/accounts`, accountsRouter);
app.use(`${apiPrefix}/trades`, tradesRouter);
app.use(`${apiPrefix}/settings`, settingsRouter);
app.use(`${apiPrefix}/targets`, targetsRouter);
app.use(`${apiPrefix}/logs`, logsRouter);
app.use(`${apiPrefix}/analytics`, analyticsRouter);
app.use(`${apiPrefix}/mt5`, mt5Router);

// Health check with system metrics
const os = require('os');
app.get(`${apiPrefix}/health`, (req, res) => {
  const marketDataService = require('./services/marketDataService');
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

  res.json({
    backend: "online",
    database: "online",
    binance: marketDataService.isConnected() ? "online" : "offline",
    cpu_load: os.loadavg()[0],
    memory_usage_percent: parseFloat(usedMemPercent.toFixed(2)),
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => res.redirect(`${apiPrefix}/health`));

app.get('/', (req, res) => {
  res.json({
    status: "online",
    service: "Binance Algo Trading Platform Backend",
    docs_url: "/docs"
  });
});

// Initialize Socket.IO Handler
const socketHandler = require('./sockets/socketHandler');
socketHandler.init(io);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: err.message
    });
});

const port = process.env.PORT || 8000;
const StorageManager = require('./services/StorageManager');

async function startServer() {
  console.log('[INFO] Preloading storage cache...');
  await StorageManager.read('accounts');
  await StorageManager.read('positions');
  await StorageManager.read('trades');
  await StorageManager.read('orders');
  await StorageManager.read('settings');
  await StorageManager.read('targets');
  await StorageManager.read('logs');
  await StorageManager.read('users');
  await StorageManager.read('strategies');
  await StorageManager.read('watchlist');

  server.listen(port, '0.0.0.0', () => {
    console.log(`NodeJS backend server listening on port ${port}`);
  });
}

startServer();
