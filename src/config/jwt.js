const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    throw new Error('Token d'accès invalide ou expiré');
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    throw new Error('Token de rafraîchissement invalide ou expiré');
  }
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
