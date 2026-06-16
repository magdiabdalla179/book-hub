const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

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
  randomItem, randomInt, formatDate, getCategoryName,
} = require('../data/seed-data');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');

    console.log('Clearing existing data...');
    await sequelize.sync({ force: true });

    console.log('Seeding categories...');
    const createdCategories = await Category.bulkCreate(
      categories.map(c => ({
        ...c,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }))
    );
    console.log(`  ${createdCategories.length} categories created`);

    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c.id; });

    console.log('Seeding users...');
    const createdUsers = await User.bulkCreate(users, { individualHooks: true });
    console.log(`  ${createdUsers.length} users created`);

    const customerUsers = createdUsers.slice(1);

    console.log('Seeding products...');
    const productData = products.map((p, i) => {
      const catName = getCategoryName(i);
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { ...p, categoryId: catMap[catName], slug, coverImage: `https://picsum.photos/seed/${slug}/400/600` };
    });

    const createdProducts = await Product.bulkCreate(productData);
    console.log(`  ${createdProducts.length} products created`);

    console.log('Seeding reviews...');
    const reviewData = [];
    const usedPairs = new Set();
    for (let i = 0; i < createdProducts.length; i++) {
      const productReviews = bookReviews[i] || [];
      const numReviews = Math.min(productReviews.length, customerUsers.length);
      const shuffled = [...customerUsers].sort(() => Math.random() - 0.5);
      let added = 0;
      for (let j = 0; j < shuffled.length && added < numReviews; j++) {
        const key = `${shuffled[j].id}:${createdProducts[i].id}`;
        if (usedPairs.has(key)) continue;
        usedPairs.add(key);
        reviewData.push({
          userId: shuffled[j].id,
          productId: createdProducts[i].id,
          rating: productReviews[j].rating,
          title: productReviews[j].title,
          comment: productReviews[j].comment,
          isVerifiedPurchase: Math.random() > 0.3,
          helpful: randomInt(0, 12),
        });
        added++;
      }
    }
    const createdReviews = await Review.bulkCreate(reviewData);
    console.log(`  ${createdReviews.length} reviews created`);

    console.log('Seeding orders...');
    const orderDocs = [];
    const orderStatuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'pending'];

    for (let i = 0; i < 12; i++) {
      const user = randomItem(customerUsers);
      const numItems = randomInt(1, 3);
      const items = [];
      let subtotal = 0;
      for (let j = 0; j < numItems; j++) {
        const product = randomItem(createdProducts);
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
      const daysAgo = randomInt(1, 60);
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
        orderNumber: `BH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        subtotal,
        shippingCost,
        tax,
        total,
        paymentStatus: status === 'delivered' || status === 'shipped' ? 'paid' : 'pending',
        orderStatus: status,
        paymentMethod: randomItem(paymentMethods),
        createdAt: formatDate(daysAgo),
      };
      if (status === 'delivered') {
        orderData.shippedAt = formatDate(daysAgo - 3);
        orderData.deliveredAt = formatDate(daysAgo - 1);
        orderData.ebooksDelivered = true;
      } else if (status === 'shipped') {
        orderData.shippedAt = formatDate(daysAgo - 1);
      }

      const order = await Order.create(orderData, { hooks: false });
      orderDocs.push(order);
    }
    console.log(`  ${orderDocs.length} orders created`);

    console.log('Seeding wishlists...');
    const wishlistData = [];
    for (const user of customerUsers) {
      const numProducts = randomInt(2, 5);
      const shuffled = [...createdProducts].sort(() => Math.random() - 0.5);
      for (let k = 0; k < numProducts; k++) {
        wishlistData.push({
          userId: user.id,
          productId: shuffled[k].id,
          addedAt: formatDate(randomInt(1, 30)),
        });
      }
    }
    const createdWishlists = await Wishlist.bulkCreate(wishlistData);
    console.log(`  ${createdWishlists.length} wishlist items created`);

    console.log('\n--- Seed Summary ---');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Users: ${createdUsers.length} (${createdUsers[0].email} — admin)`);
    console.log(`Products: ${createdProducts.length}`);
    console.log(`Reviews: ${createdReviews.length}`);
    console.log(`Orders: ${orderDocs.length}`);
    console.log(`Wishlist items: ${createdWishlists.length}`);

    console.log('\n--- Test Accounts ---');
    console.log('Admin: admin@bookhub.rw / Admin@123');
    console.log('Users: jean@example.com, alice@example.com, bob@example.com, claire@example.com');
    console.log('All user passwords: User@1234');

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
