const { getAIClient } = require('../config/ai');
const ChatHistory = require('../models/ChatHistory');
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

const SYSTEM_PROMPT = `You are BookBot, an AI assistant for BookHub — Rwanda's premier online bookstore. 

You help customers with:
- Book recommendations based on their interests and reading history
- Information about books, authors, and genres
- Order status, delivery, and return policies
- Account management help
- E-book download assistance

BookHub policies:
- Physical book delivery: 2-5 business days within Rwanda
- E-book delivery: Instant download after payment
- Returns: 7-day return policy for physical books in original condition
- Payment: MTN MoMo and Airtel Money accepted
- Customer support: support@bookhub.rw

Be friendly, helpful, and concise. When recommending books, include title and author.
If asked about specific order details, explain that you don't have access to order databases in chat, 
and direct them to their Order History page or support@bookhub.rw.`;

/**
 * Generate AI response using active provider
 * @param {string} message - User message
 * @param {Array} history - Previous messages [{role, content}]
 * @returns {Promise<{response: string, provider: string}>}
 */
const generateResponse = async (message, history = []) => {
  const ai = getAIClient();

  // Fallback mock response if no AI configured
  if (!ai) {
    return {
      response: generateMockResponse(message),
      provider: 'mock',
    };
  }

  if (ai.type === 'gemini') {
    const model = ai.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'What are you?' }] },
        { role: 'model', parts: [{ text: SYSTEM_PROMPT }] },
        ...formattedHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    return {
      response: result.response.text(),
      provider: 'gemini',
    };
  }

  if (ai.type === 'openai') {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message },
    ];

    const completion = await ai.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    return {
      response: completion.choices[0].message.content,
      provider: 'openai',
    };
  }
};

/**
 * Generate book summary using AI
 * @param {Object} book - Book object with title, author, description
 * @returns {Promise<string>}
 */
const generateBookSummary = async (book) => {
  const prompt = `Generate a compelling 150-200 word summary for the following book. 
Write it in an engaging way that would make readers want to buy it.

Title: ${book.title}
Author: ${book.author}
Description: ${book.description}

Summary:`;

  const ai = getAIClient();

  if (!ai) {
    return book.description.substring(0, 300) + '...';
  }

  if (ai.type === 'gemini') {
    const model = ai.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  if (ai.type === 'openai') {
    const completion = await ai.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });
    return completion.choices[0].message.content;
  }
};

/**
 * Generate personalized book recommendations
 * @param {Object} params
 * @param {Array} params.purchaseHistory - Array of book titles/categories
 * @param {Array} params.favoriteCategories - Category names
 * @param {string} params.searchHistory - Recent searches
 * @returns {Promise<{recommendations: Array, message: string}>}
 */
const generateRecommendations = async ({ purchaseHistory = [], favoriteCategories = [], searchHistory = [] }) => {
  const prompt = `Based on this reader's profile, recommend 5 specific books they would love.

Purchase History: ${purchaseHistory.join(', ') || 'No history yet'}
Favorite Categories: ${favoriteCategories.join(', ') || 'Not specified'}
Recent Searches: ${searchHistory.slice(0, 5).join(', ') || 'None'}

Return a JSON array with exactly 5 recommendations. Each item should have:
- title (string)
- author (string)  
- genre (string)
- reason (string, 1 sentence why they'd love it)

Respond with ONLY valid JSON array, no other text.`;

  const ai = getAIClient();

  if (!ai) {
    return getMockRecommendations(favoriteCategories);
  }

  try {
    let rawText = '';

    if (ai.type === 'gemini') {
      const model = ai.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      rawText = result.response.text();
    } else if (ai.type === 'openai') {
      const completion = await ai.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });
      rawText = completion.choices[0].message.content;
    }

    // Parse JSON (handle markdown code blocks)
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];

    return { recommendations, message: 'Here are your personalized picks!' };
  } catch (err) {
    console.error('AI recommendation parse error:', err);
    return getMockRecommendations(favoriteCategories);
  }
};

/**
 * Save chat session to database
 */
const saveChatMessage = async ({ userId, sessionId, userMessage, aiResponse, provider }) => {
  let session = await ChatHistory.findOne({ user: userId, sessionId });

  if (!session) {
    session = await ChatHistory.create({
      user: userId,
      sessionId,
      title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
      messages: [],
    });
  }

  session.messages.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: aiResponse, aiProvider: provider }
  );

  // Trim old messages (keep last 40)
  if (session.messages.length > 40) {
    session.messages = session.messages.slice(-40);
  }

  await session.save();
  return session;
};

/**
 * Get chat history for a session
 */
const getChatHistory = async (userId, sessionId) => {
  return ChatHistory.findOne({ user: userId, sessionId });
};

/**
 * Mock response generator (used when no AI keys configured)
 */
const generateMockResponse = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('recommend') || lower.includes('suggest')) {
    return `Great question! Here are some popular books on BookHub:

📚 **Fiction:**
- *The Alchemist* by Paulo Coelho
- *Atomic Habits* by James Clear

📚 **Technology:**
- *Clean Code* by Robert C. Martin
- *The Pragmatic Programmer* by David Thomas

What genre interests you most? I can make more specific recommendations!`;
  }

  if (lower.includes('delivery') || lower.includes('shipping')) {
    return `📦 **Delivery Information:**
- Physical books: **2-5 business days** within Rwanda
- Kigali: Usually **1-2 business days**
- E-books: **Instant download** after payment confirmation

Shipping cost: 2,000 RWF for physical books. Free for e-books!`;
  }

  if (lower.includes('return') || lower.includes('refund')) {
    return `🔄 **Return & Refund Policy:**
- Physical books: **7 days** from delivery in original condition
- E-books: Non-refundable (digital goods)
- Contact us: support@bookhub.rw

For faster service, include your order number in your email.`;
  }

  if (lower.includes('payment') || lower.includes('momo') || lower.includes('airtel')) {
    return `💳 **Payment Methods:**
- **MTN MoMo** (078x, 079x, 077x)
- **Airtel Money** (072x, 073x)

Steps:
1. Add books to cart
2. Go to checkout
3. Select your payment method
4. Enter your phone number
5. Confirm on your phone
6. Done! ✅`;
  }

  return `Hello! I'm **BookBot**, your BookHub assistant! 😊

I can help you with:
- 📚 Book recommendations
- 🚚 Delivery information
- 💳 Payment help
- 🔄 Returns & refunds

What can I help you with today?`;
};

/**
 * Mock recommendations fallback
 */
const getMockRecommendations = (categories = []) => ({
  recommendations: [
    { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', reason: 'A practical guide to building good habits and breaking bad ones.' },
    { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', reason: 'An inspiring journey of self-discovery loved by millions.' },
    { title: 'Clean Code', author: 'Robert C. Martin', genre: 'Technology', reason: 'Essential reading for writing maintainable, professional code.' },
    { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History', reason: 'A sweeping narrative of human civilization that changes perspective.' },
    { title: 'Think and Grow Rich', author: 'Napoleon Hill', genre: 'Business', reason: 'Timeless principles of success studied by millions worldwide.' },
  ],
  message: 'Here are some popular picks for you!',
});

module.exports = {
  generateResponse,
  generateBookSummary,
  generateRecommendations,
  saveChatMessage,
  getChatHistory,
};
