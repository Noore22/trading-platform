const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

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

// Health check
app.get('/health', (req, res) => {
  const binanceService = require('./services/binanceService');
  res.json({
    backend: "online",
    database: "online",
    binance: binanceService.isConnected() ? "online" : "offline"
  });
});

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

const port = process.env.PORT || 8000;
server.listen(port, '0.0.0.0', () => {
  console.log(`NodeJS backend server listening on port ${port}`);
});
