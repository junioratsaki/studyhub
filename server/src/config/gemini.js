const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
}

module.exports = {
  genAI,
  getModel,
};
