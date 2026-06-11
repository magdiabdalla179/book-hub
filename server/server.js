require('dotenv').config();
const app = require('./app');
const { connectDB, sequelize } = require('./config/database');
const { initializeAI } = require('./config/ai');
const { User, Product, Category, Order, Review, Payment, Wishlist, ChatHistory } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });

    initializeAI();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 BookHub API running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health\n`);
    });

    const shutdown = (signal) => {
      console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Rejection:', reason);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
