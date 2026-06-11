const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/errorHandler');
const aiService = require('../services/ai.service');
const Product = require('../models/Product');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const { v4: uuidv4 } = require('uuid');

const chat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  const sid = sessionId || uuidv4();

  let history = [];
  if (sessionId) {
    const prevSession = await aiService.getChatHistory(req.user.id, sessionId);
    if (prevSession) {
      history = prevSession.messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }
  }

  const { response, provider } = await aiService.generateResponse(message.trim(), history);

  aiService.saveChatMessage({
    userId: req.user.id,
    sessionId: sid,
    userMessage: message,
    aiResponse: response,
    provider,
  }).catch(console.error);

  const user = await User.findByPk(req.user.id);
  const searchHistory = user.searchHistory || [];
  searchHistory.push({ query: message.substring(0, 100), searchedAt: new Date() });
  if (searchHistory.length > 20) searchHistory.splice(0, searchHistory.length - 20);
  await User.update({ searchHistory }, { where: { id: req.user.id } }).catch(() => {});

  res.json({
    success: true,
    sessionId: sid,
    message: response,
    provider,
  });
});

const getBookSummary = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.productId);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Book not found.' });
  }

  if (product.aiSummary) {
    return res.json({ success: true, summary: product.aiSummary, cached: true });
  }

  const summary = await aiService.generateBookSummary({
    title: product.title,
    author: product.author,
    description: product.description,
  });

  await Product.update({ aiSummary: summary }, { where: { id: product.id } });

  res.json({ success: true, summary, cached: false });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  const purchaseIds = user.purchaseHistory || [];
  const categoryIds = user.favoriteCategories || [];
  const searchHistory = user.searchHistory || [];

  const [purchasedProducts, favCategories] = await Promise.all([
    purchaseIds.length > 0
      ? Product.findAll({ where: { id: purchaseIds }, attributes: ['title', 'author'] })
      : Promise.resolve([]),
    categoryIds.length > 0
      ? require('../models/Category').findAll({ where: { id: categoryIds }, attributes: ['name'] })
      : Promise.resolve([]),
  ]);

  const purchaseHistory = purchasedProducts.map((p) => `${p.title} by ${p.author}`);
  const favoriteCategories = favCategories.map((c) => c.name);
  const searchTerms = searchHistory.map((s) => s.query);

  const { recommendations, message } = await aiService.generateRecommendations({
    purchaseHistory,
    favoriteCategories,
    searchHistory: searchTerms,
  });

  const enrichedRecs = await Promise.all(
    recommendations.map(async (rec) => {
      const dbProduct = await Product.findOne({
        where: {
          title: { [Op.iLike]: `%${rec.title}%` },
          isActive: true,
        },
        attributes: ['id', 'title', 'author', 'coverImage', 'price', 'ratingsAverage', 'format'],
      });

      return { ...rec, product: dbProduct || null };
    })
  );

  res.json({
    success: true,
    message,
    recommendations: enrichedRecs,
  });
});

const getChatSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatHistory.findAll({
    where: { userId: req.user.id, isActive: true },
    order: [['updatedAt', 'DESC']],
    limit: 20,
  });

  res.json({
    success: true,
    sessions: sessions.map((s) => ({
      sessionId: s.sessionId,
      title: s.title,
      lastMessage: (s.messages?.[s.messages.length - 1]?.content || '').substring(0, 80),
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
    })),
  });
});

const getChatSession = asyncHandler(async (req, res) => {
  const session = await ChatHistory.findOne({
    where: { userId: req.user.id, sessionId: req.params.sessionId },
  });

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }

  res.json({ success: true, session });
});

module.exports = { chat, getBookSummary, getRecommendations, getChatSessions, getChatSession };
