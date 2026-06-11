const { asyncHandler } = require('../middleware/errorHandler');
const aiService = require('../services/ai.service');
const Product = require('../models/Product');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
const chat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  const sid = sessionId || uuidv4();

  // Get previous messages from this session
  let history = [];
  if (sessionId) {
    const prevSession = await aiService.getChatHistory(req.user._id, sessionId);
    if (prevSession) {
      history = prevSession.messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }
  }

  const { response, provider } = await aiService.generateResponse(message.trim(), history);

  // Save to DB (async, non-blocking)
  aiService.saveChatMessage({
    userId: req.user._id,
    sessionId: sid,
    userMessage: message,
    aiResponse: response,
    provider,
  }).catch(console.error);

  // Update user search history
  User.findByIdAndUpdate(req.user._id, {
    $push: {
      searchHistory: {
        $each: [{ query: message.substring(0, 100) }],
        $slice: -20,
      },
    },
  }).catch(() => {});

  res.json({
    success: true,
    sessionId: sid,
    message: response,
    provider,
  });
});

// @desc    Get AI book summary
// @route   POST /api/ai/book-summary/:productId
// @access  Public
const getBookSummary = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select('+aiSummary');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Book not found.' });
  }

  // Return cached summary if available
  if (product.aiSummary) {
    return res.json({ success: true, summary: product.aiSummary, cached: true });
  }

  // Generate new summary
  const summary = await aiService.generateBookSummary({
    title: product.title,
    author: product.author,
    description: product.description,
  });

  // Cache the summary
  await Product.findByIdAndUpdate(product._id, { aiSummary: summary });

  res.json({ success: true, summary, cached: false });
});

// @desc    Get AI book recommendations
// @route   POST /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('purchaseHistory', 'title author')
    .populate('favoriteCategories', 'name');

  const purchaseHistory = user.purchaseHistory.map((p) => `${p.title} by ${p.author}`);
  const favoriteCategories = user.favoriteCategories.map((c) => c.name);
  const searchHistory = user.searchHistory.map((s) => s.query);

  const { recommendations, message } = await aiService.generateRecommendations({
    purchaseHistory,
    favoriteCategories,
    searchHistory,
  });

  // Try to match recommendations with actual products in the database
  const enrichedRecs = await Promise.all(
    recommendations.map(async (rec) => {
      const dbProduct = await Product.findOne({
        $text: { $search: rec.title },
        isActive: true,
      }).select('title author coverImage price ratingsAverage format');

      return { ...rec, product: dbProduct || null };
    })
  );

  res.json({
    success: true,
    message,
    recommendations: enrichedRecs,
  });
});

// @desc    Get user chat sessions
// @route   GET /api/ai/chat/sessions
// @access  Private
const getChatSessions = asyncHandler(async (req, res) => {
  const ChatHistory = require('../models/ChatHistory');
  const sessions = await ChatHistory.find({ user: req.user._id, isActive: true })
    .sort('-updatedAt')
    .limit(20)
    .select('sessionId title updatedAt messages');

  res.json({
    success: true,
    sessions: sessions.map((s) => ({
      sessionId: s.sessionId,
      title: s.title,
      lastMessage: s.messages[s.messages.length - 1]?.content?.substring(0, 80),
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
    })),
  });
});

// @desc    Get specific chat session
// @route   GET /api/ai/chat/sessions/:sessionId
// @access  Private
const getChatSession = asyncHandler(async (req, res) => {
  const ChatHistory = require('../models/ChatHistory');
  const session = await ChatHistory.findOne({
    user: req.user._id,
    sessionId: req.params.sessionId,
  });

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  res.json({ success: true, session });
});

module.exports = { chat, getBookSummary, getRecommendations, getChatSessions, getChatSession };
