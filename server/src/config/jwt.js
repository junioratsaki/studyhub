const jwt = require('jsonwebtoken');
require('dotenv').config();

// Utilise des clés RSA pour RS256 (format PEM)
const ACCESS_PRIVATE_KEY = process.env.JWT_ACCESS_PRIVATE_KEY;
const ACCESS_PUBLIC_KEY = process.env.JWT_ACCESS_PUBLIC_KEY;
const REFRESH_PRIVATE_KEY = process.env.JWT_REFRESH_PRIVATE_KEY;
const REFRESH_PUBLIC_KEY = process.env.JWT_REFRESH_PUBLIC_KEY;

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '15m' });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_PUBLIC_KEY, { algorithms: ['RS256'] });
  } catch (error) {
    throw new Error("Token d'accès invalide ou expiré");
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_PUBLIC_KEY, { algorithms: ['RS256'] });
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
