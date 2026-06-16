const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramAlert(message) {
  if (!token || !chatId) {
    // Silent return if Telegram bot is not configured
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });
    console.log('Telegram alert sent successfully.');
  } catch (err) {
    console.error('Failed to send Telegram alert:', err.message);
  }
}

module.exports = {
  sendTelegramAlert
};
