const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const StorageManager = require('../services/StorageManager');
const config = require('../config/binance');
const authMiddleware = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ detail: 'Username and password required' });
  }

  const users = await StorageManager.read('users');
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ detail: 'Incorrect username or password' });
  }

  if (!process.env.JWT_SECRET) {
      return res.status(500).json({
          success: false,
          message: "JWT_SECRET not configured"
      });
  }

  // Generate JWT Token
  const token = jwt.sign(
      {
          id: user.id,
          username: user.username,
          role: user.role
      },
      process.env.JWT_SECRET,
      {
          expiresIn: '24h'
      }
  );

  return res.json({
    access_token: token,
    token_type: 'bearer'
  });
});

router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;
