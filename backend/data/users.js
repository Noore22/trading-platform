const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: 2,
    username: 'trader',
    passwordHash: bcrypt.hashSync('admin123', 10),
    email: 'trader@tradingplatform.local',
    role: 'trader'
  },
  {
    id: 3,
    username: 'viewer',
    passwordHash: bcrypt.hashSync('admin123', 10),
    email: 'viewer@tradingplatform.local',
    role: 'viewer'
  }
];

module.exports = users;
