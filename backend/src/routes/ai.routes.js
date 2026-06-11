const express = require('express');
const router = express.Router();
const { chat, getBookSummary, getRecommendations, getChatSessions, getChatSession } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/chat', protect, aiLimiter, chat);
router.get('/chat/sessions', protect, getChatSessions);
router.get('/chat/sessions/:sessionId', protect, getChatSession);
router.post('/book-summary/:productId', aiLimiter, getBookSummary);
router.post('/recommendations', protect, aiLimiter, getRecommendations);

module.exports = router;
