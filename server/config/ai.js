const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let openaiClient = null;
let geminiClient = null;

/**
 * Initialize AI clients based on environment configuration
 */
const initializeAI = () => {
  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'openai' || provider === 'both') {
    if (process.env.OPENAI_API_KEY) {
      openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('✅ OpenAI client initialized');
    } else {
      console.warn('⚠️  OPENAI_API_KEY not set. OpenAI features disabled.');
    }
  }

  if (provider === 'gemini' || provider === 'both') {
    if (process.env.GEMINI_API_KEY) {
      geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Google Gemini client initialized');
    } else {
      console.warn('⚠️  GEMINI_API_KEY not set. Gemini features disabled.');
    }
  }
};

/**
 * Get active AI client - prefers Gemini, falls back to OpenAI
 * @returns {{ type: string, client: any }}
 */
const getAIClient = () => {
  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'openai' && openaiClient) {
    return { type: 'openai', client: openaiClient };
  }
  if (provider === 'gemini' && geminiClient) {
    return { type: 'gemini', client: geminiClient };
  }
  if (provider === 'both') {
    if (geminiClient) return { type: 'gemini', client: geminiClient };
    if (openaiClient) return { type: 'openai', client: openaiClient };
  }

  return null;
};

module.exports = { initializeAI, getAIClient, openaiClient: () => openaiClient, geminiClient: () => geminiClient };
