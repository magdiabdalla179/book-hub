const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  aiProvider: {
    type: String,
    enum: ['openai', 'gemini', 'mock'],
    default: 'gemini',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    messages: [messageSchema],
    context: {
      type: String,
      enum: ['general', 'support', 'recommendations', 'summary'],
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

chatHistorySchema.index({ user: 1, createdAt: -1 });
chatHistorySchema.index({ sessionId: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
