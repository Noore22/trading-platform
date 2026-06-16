const jwt = require('jsonwebtoken');
const config = require('../config/binance');
const users = require('../data/users');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = users.find(u => u.id === decoded.sub);
    if (!user) {
      return res.status(401).json({ detail: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Token verification failed' });
  }
};
