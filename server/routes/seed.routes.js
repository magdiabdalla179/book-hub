const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const {
  categories, users, products, bookReviews,
  provinces, cities, paymentMethods,
  randomItem, randomInt, getCategoryName,
} = require('../data/seed-data');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const force = req.query.force === 'true';

    if (force) {
      await sequelize.sync({ force: true });
    }

    await sequelize.sync({ alter: true });

    const catMap = {};
    for (const c of categories) {
      const [cat] = await Category.findOrCreate({
        where: { slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') },
        defaults: { ...c },
      });
      catMap[cat.name] = cat.id;
    }

    const createdUsers = [];
    for (const u of users) {
      const [user, created] = await User.findOrCreate({
        where: { email: u.email },
        defaults: u,
      });
      if (created) createdUsers.push(user);
      else createdUsers.push(user);
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const catName = getCategoryName(i);
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await Product.findOrCreate({
        where: { slug },
        defaults: {
          ...p,
          categoryId: catMap[catName],
          slug,
          coverImage: `https://picsum.photos/seed/${slug}/400/600`,
        },
      });
    }

    const allProducts = await Product.findAll();
    const allUsers = await User.findAll();
    const customerUsers = allUsers.filter(u => u.role === 'customer');

    const usedPairs = new Set();
    const existingReviews = await Review.findAll();
    for (const r of existingReviews) {
      usedPairs.add(`${r.userId}:${r.productId}`);
    }
    const reviewData = [];
    for (let i = 0; i < allProducts.length; i++) {
      const productReviews = bookReviews[i] || [];
      const numReviews = Math.min(productReviews.length, customerUsers.length);
      const shuffled = [...customerUsers].sort(() => Math.random() - 0.5);
      let added = 0;
      for (let j = 0; j < shuffled.length && added < numReviews; j++) {
        const key = `${shuffled[j].id}:${allProducts[i].id}`;
        if (usedPairs.has(key)) continue;
        usedPairs.add(key);
        reviewData.push({
          userId: shuffled[j].id,
          productId: allProducts[i].id,
          rating: productReviews[j].rating,
          title: productReviews[j].title,
          comment: productReviews[j].comment,
          isVerifiedPurchase: Math.random() > 0.3,
          helpful: randomInt(0, 12),
        });
        added++;
      }
    }
    if (reviewData.length > 0) {
      await Review.bulkCreate(reviewData, { ignoreDuplicates: true });
    }

    const existingOrders = await Order.count();
    if (existingOrders === 0 || req.query.forceOrders === 'true') {
      if (req.query.forceOrders === 'true') {
        await Order.destroy({ where: {}, truncate: { cascade: true } });
        await Wishlist.destroy({ where: {} });
        await Review.destroy({ where: {} });
      }
      const orderStatuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'pending'];
      for (let i = 0; i < 12; i++) {
        const user = randomItem(customerUsers);
        const numItems = randomInt(1, 3);
        const items = [];
        let subtotal = 0;
        for (let j = 0; j < numItems; j++) {
          const product = randomItem(allProducts);
          const qty = randomInt(1, 2);
          const price = parseFloat(product.discountPrice || product.price);
          items.push({
            product: product.id,
            title: product.title,
            author: product.author,
            coverImage: product.coverImage,
            format: randomItem(['physical', 'ebook']),
            price,
            quantity: qty,
            subtotal: price * qty,
          });
          subtotal += price * qty;
        }
        const shippingCost = subtotal > 50000 ? 0 : randomInt(2000, 5000);
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shippingCost + tax;
        const d = new Date();
        d.setDate(d.getDate() - randomInt(1, 60));
        const status = orderStatuses[i % orderStatuses.length];
        const orderData = {
          userId: user.id,
          items,
          shippingAddress: {
            fullName: user.name,
            address: `${randomInt(10, 999)} KG ${randomInt(100, 999)} St`,
            city: randomItem(cities),
            province: randomItem(provinces),
            country: 'Rwanda',
            phone: user.phone,
          },
          subtotal,
          shippingCost,
          tax,
          total,
          paymentStatus: status === 'delivered' || status === 'shipped' ? 'paid' : 'pending',
          orderStatus: status,
          paymentMethod: randomItem(paymentMethods),
          createdAt: d,
        };
        if (status === 'delivered') {
          const sd = new Date(d); sd.setDate(sd.getDate() - 3);
          const dd = new Date(d); dd.setDate(dd.getDate() - 1);
          orderData.shippedAt = sd;
          orderData.deliveredAt = dd;
          orderData.ebooksDelivered = true;
        } else if (status === 'shipped') {
          const sd = new Date(d); sd.setDate(sd.getDate() - 1);
          orderData.shippedAt = sd;
        }
        await Order.create(orderData, { hooks: false });
      }
    }

    const existingWishlist = await Wishlist.count();
    if (existingWishlist === 0) {
      const wishlistData = [];
      for (const user of customerUsers) {
        const numProducts = randomInt(2, 5);
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        for (let k = 0; k < numProducts; k++) {
          wishlistData.push({
            userId: user.id,
            productId: shuffled[k].id,
            addedAt: new Date(Date.now() - randomInt(1, 30) * 86400000),
          });
        }
      }
      if (wishlistData.length > 0) {
        await Wishlist.bulkCreate(wishlistData);
      }
    }

    const catCount = await Category.count();
    const userCount = await User.count();
    const productCount = await Product.count();
    const reviewCount = await Review.count();
    const orderCount = await Order.count();
    const wishCount = await Wishlist.count();

    res.json({
      success: true,
      message: force ? 'Database reset and seeded successfully' : 'Seed data upserted successfully',
      counts: {
        categories: catCount,
        users: userCount,
        products: productCount,
        reviews: reviewCount,
        orders: orderCount,
        wishlist: wishCount,
      },
      testAccounts: {
        admin: { email: 'admin@bookhub.rw', password: 'Admin@123' },
        customers: ['jean@example.com', 'alice@example.com', 'bob@example.com', 'claire@example.com'],
        customerPassword: 'User@1234',
      },
    });
  } catch (error) {
    console.error('Seed Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
