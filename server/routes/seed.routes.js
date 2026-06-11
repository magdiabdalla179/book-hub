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

const categories = [
  { name: 'Fiction', description: 'Novels, stories, and literary works', icon: '📖' },
  { name: 'Non-Fiction', description: 'Informative and factual works', icon: '📚' },
  { name: 'Science & Technology', description: 'Computers, programming, and scientific topics', icon: '🔬' },
  { name: 'History', description: 'Historical accounts and analyses', icon: '📜' },
  { name: 'Business & Economics', description: 'Finance, management, and entrepreneurship', icon: '💼' },
  { name: 'Self-Development', description: 'Personal growth, motivation, and psychology', icon: '🌱' },
  { name: 'Children & Teens', description: 'Books for young readers', icon: '🧒' },
  { name: 'Romance', description: 'Love stories and romantic fiction', icon: '💕' },
  { name: 'Thriller & Mystery', description: 'Suspense, crime, and detective stories', icon: '🔍' },
  { name: 'Fantasy & Sci-Fi', description: 'Imaginative worlds and futuristic tales', icon: '🌌' },
];

const users = [
  { name: 'Admin User', email: 'admin@bookhub.rw', password: 'Admin@123', role: 'admin', phone: '+250788100001', emailVerified: true },
  { name: 'Jean Pierre', email: 'jean@example.com', password: 'User@1234', role: 'customer', phone: '+250788100002', emailVerified: true },
  { name: 'Alice Mugisha', email: 'alice@example.com', password: 'User@1234', role: 'customer', phone: '+250788100003', emailVerified: true },
  { name: 'Bob Habimana', email: 'bob@example.com', password: 'User@1234', role: 'customer', phone: '+250788100004', emailVerified: true },
  { name: 'Claire Uwimana', email: 'claire@example.com', password: 'User@1234', role: 'customer', phone: '+250788100005', emailVerified: true },
];

const products = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', description: 'A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, exploring decadence, idealism, social upheaval, and excess during the Jazz Age.', price: 15000, format: 'both', physicalBook: { stock: 50, weight: 0.5, shippingCost: 2000 }, ebook: { fileUrl: null, fileSize: '2.1 MB', previewPages: 10 }, language: 'English', pages: 180, publisher: 'Scribner', publishedYear: 1925, tags: ['classic', 'american', 'jazz-age'], featured: true, bestSeller: true, ratingsAverage: 4.4, ratingsCount: 1245, salesCount: 3400 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, exploring racial injustice and the loss of innocence.', price: 16500, discountPrice: 13500, format: 'both', physicalBook: { stock: 40, weight: 0.55, shippingCost: 2000 }, ebook: { fileUrl: null, fileSize: '1.8 MB', previewPages: 15 }, language: 'English', pages: 281, publisher: 'Harper Perennial', publishedYear: 1960, tags: ['classic', 'american', 'racial-justice'], featured: true, bestSeller: true, ratingsAverage: 4.6, ratingsCount: 2100, salesCount: 5000 },
  { title: '1984', author: 'George Orwell', isbn: '9780451524935', description: 'A dystopian novel set in a totalitarian society ruled by Big Brother, exploring surveillance, propaganda, and the erosion of truth.', price: 14000, format: 'both', physicalBook: { stock: 60, weight: 0.45, shippingCost: 2000 }, ebook: { fileUrl: null, fileSize: '1.5 MB', previewPages: 12 }, language: 'English', pages: 328, publisher: 'Signet', publishedYear: 1949, tags: ['dystopian', 'classic', 'science-fiction'], featured: true, bestSeller: true, ratingsAverage: 4.5, ratingsCount: 1890, salesCount: 4200 },
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', description: 'A handbook of agile software craftsmanship, providing principles and practices for writing clean, maintainable code.', price: 45000, discountPrice: 38000, format: 'both', physicalBook: { stock: 30, weight: 0.8, shippingCost: 2500 }, ebook: { fileUrl: null, fileSize: '5.2 MB', previewPages: 20 }, language: 'English', pages: 464, publisher: 'Prentice Hall', publishedYear: 2008, tags: ['programming', 'software-engineering', 'agile'], featured: true, ratingsAverage: 4.3, ratingsCount: 980, salesCount: 2800 },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt, David Thomas', isbn: '9780135957059', description: 'Timeless lessons in software development covering personal responsibility, career development, and architectural techniques.', price: 42000, format: 'physical', physicalBook: { stock: 25, weight: 0.6, shippingCost: 2000 }, language: 'English', pages: 352, publisher: 'Addison-Wesley', publishedYear: 2019, tags: ['programming', 'software-engineering', 'career'], featured: true, newArrival: true, ratingsAverage: 4.5, ratingsCount: 720, salesCount: 1900 },
  { title: "Ikinyarwanda Cy'umwana", author: 'Rwandan Authors Collective', isbn: '9789997700101', description: "A vibrant children's book introducing young readers to the Kinyarwanda language through colorful stories and illustrations.", price: 8000, format: 'physical', physicalBook: { stock: 100, weight: 0.2, shippingCost: 1500 }, language: 'kinyarwanda', pages: 48, publisher: 'Rwanda Publishing House', publishedYear: 2022, tags: ['children', 'kinyarwanda', 'education'], newArrival: true, ratingsAverage: 4.8, ratingsCount: 45, salesCount: 320 },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', description: 'A magical story about following your dreams and listening to your heart, following a young Andalusian shepherd on his journey to find treasure.', price: 16000, discountPrice: 12000, format: 'both', physicalBook: { stock: 80, weight: 0.35, shippingCost: 2000 }, ebook: { fileUrl: null, fileSize: '1.2 MB', previewPages: 8 }, language: 'English', pages: 197, publisher: 'HarperOne', publishedYear: 1988, tags: ['inspirational', 'philosophy', 'adventure'], featured: true, bestSeller: true, ratingsAverage: 4.7, ratingsCount: 3200, salesCount: 8000 },
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '9780062316110', description: "A groundbreaking narrative of humanity's creation and evolution that explores how we conquered the world and shaped our societies.", price: 32000, format: 'both', physicalBook: { stock: 45, weight: 0.7, shippingCost: 2000 }, ebook: { fileUrl: null, fileSize: '4.8 MB', previewPages: 18 }, language: 'English', pages: 443, publisher: 'Harper', publishedYear: 2015, tags: ['history', 'anthropology', 'science'], featured: true, bestSeller: true, ratingsAverage: 4.6, ratingsCount: 2800, salesCount: 6000 },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', isbn: '9781585424337', description: 'The landmark bestseller that reveals the secrets of success based on the principles of personal achievement and financial independence.', price: 18000, format: 'physical', physicalBook: { stock: 70, weight: 0.4, shippingCost: 2000 }, language: 'English', pages: 233, publisher: 'TarcherPerigee', publishedYear: 1937, tags: ['self-help', 'success', 'wealth'], featured: true, ratingsAverage: 4.3, ratingsCount: 1500, salesCount: 4500 },
  { title: 'The Art of War', author: 'Sun Tzu', isbn: '9781590302255', description: 'An ancient Chinese military treatise that has become a classic of strategy and leadership, applied in business, sports, and life.', price: 9500, format: 'both', physicalBook: { stock: 90, weight: 0.25, shippingCost: 1500 }, ebook: { fileUrl: null, fileSize: '0.8 MB', previewPages: 5 }, language: 'English', pages: 112, publisher: 'Shambhala', publishedYear: -500, tags: ['strategy', 'philosophy', 'leadership'], ratingsAverage: 4.2, ratingsCount: 2100, salesCount: 7000 },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', description: 'An easy and proven way to build good habits and break bad ones, through small changes that lead to remarkable results.', price: 22000, discountPrice: 18500, format: 'both', physicalBook: { stock: 65, weight: 0.5, shippingCost: 2000 }, ebook: { fileUrl: null, fileSize: '2.5 MB', previewPages: 14 }, language: 'English', pages: 320, publisher: 'Avery', publishedYear: 2018, tags: ['self-help', 'habits', 'productivity'], featured: true, bestSeller: true, newArrival: true, ratingsAverage: 4.8, ratingsCount: 4500, salesCount: 12000 },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307454546', description: 'A gripping thriller that follows journalist Mikael Blomkvist and hacker Lisbeth Salander as they investigate a decades-old disappearance.', price: 17000, format: 'both', physicalBook: { stock: 35, weight: 0.9, shippingCost: 2500 }, ebook: { fileUrl: null, fileSize: '3.1 MB', previewPages: 16 }, language: 'English', pages: 672, publisher: 'Vintage', publishedYear: 2005, tags: ['thriller', 'mystery', 'crime'], featured: true, ratingsAverage: 4.2, ratingsCount: 1800, salesCount: 3500 },
  { title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', isbn: '9781408855652', description: "The first book in the Harry Potter series, following the young wizard's discovery of his magical heritage and his first year at Hogwarts.", price: 19000, format: 'both', physicalBook: { stock: 100, weight: 0.6, shippingCost: 2000 }, ebook: { fileUrl: null, fileSize: '2.8 MB', previewPages: 12 }, language: 'English', pages: 352, publisher: 'Bloomsbury', publishedYear: 1997, tags: ['fantasy', 'magic', 'adventure', 'children'], featured: true, bestSeller: true, ratingsAverage: 4.9, ratingsCount: 5500, salesCount: 15000 },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', description: 'Set on the desert planet Arrakis, this epic science fiction tale explores politics, religion, ecology, and human emotion.', price: 20000, format: 'both', physicalBook: { stock: 40, weight: 1.0, shippingCost: 2500 }, ebook: { fileUrl: null, fileSize: '4.2 MB', previewPages: 22 }, language: 'English', pages: 688, publisher: 'Ace', publishedYear: 1965, tags: ['science-fiction', 'fantasy', 'epic'], featured: true, ratingsAverage: 4.5, ratingsCount: 2200, salesCount: 4800 },
  { title: 'The Lean Startup', author: 'Eric Ries', isbn: '9780307887894', description: 'A methodology for developing businesses and products that aims to shorten product development cycles and rapidly discover if a proposed business model is viable.', price: 28000, discountPrice: 23500, format: 'physical', physicalBook: { stock: 20, weight: 0.55, shippingCost: 2000 }, language: 'English', pages: 336, publisher: 'Crown Business', publishedYear: 2011, tags: ['business', 'startup', 'entrepreneurship'], featured: true, ratingsAverage: 4.1, ratingsCount: 890, salesCount: 2200 },
];

const reviewTexts = [
  'Absolutely loved this book! Could not put it down.',
  'A masterpiece that everyone should read at least once.',
  'Well written and thought-provoking. Highly recommended.',
  'Great read, though I found some parts a bit slow.',
  'Changed my perspective on many things. Truly eye-opening.',
  'Decent book but not as good as I expected given the hype.',
  'Perfect gift for any book lover. Beautiful prose.',
  'The characters are so well developed, felt like I knew them.',
  'A bit overrated but still a solid read.',
  'Excellent condition and fast delivery. Will buy again.',
];

const provinces = ['Kigali City', 'Eastern Province', 'Northern Province', 'Western Province', 'Southern Province'];
const cities = ['Kigali', 'Kibungo', 'Byumba', 'Kibuye', 'Butare', 'Rusizi', 'Musanze', 'Nyagatare'];
const paymentMethods = ['mtn_momo', 'airtel_money', 'cod'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

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
      const catName = i < 3 ? 'Fiction' :
        i >= 3 && i < 5 ? 'Science & Technology' :
        i === 5 ? 'Children & Teens' :
        i === 6 ? 'Fiction' :
        i === 7 ? 'History' :
        i === 8 ? 'Self-Development' :
        i === 9 ? 'Non-Fiction' :
        i === 10 ? 'Self-Development' :
        i === 11 ? 'Thriller & Mystery' :
        i === 12 ? 'Fantasy & Sci-Fi' :
        i === 13 ? 'Fantasy & Sci-Fi' :
        i === 14 ? 'Business & Economics' : 'Fiction';
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
    const adminUser = allUsers.find(u => u.role === 'admin');
    const customerUsers = allUsers.filter(u => u.role === 'customer');

    const usedPairs = new Set();
    const existingReviews = await Review.findAll();
    for (const r of existingReviews) {
      usedPairs.add(`${r.userId}:${r.productId}`);
    }
    const reviewData = [];
    for (let i = 0; i < allProducts.length; i++) {
      const numReviews = randomInt(0, 3);
      const shuffled = [...customerUsers].sort(() => Math.random() - 0.5);
      let added = 0;
      for (let j = 0; j < shuffled.length && added < numReviews; j++) {
        const key = `${shuffled[j].id}:${allProducts[i].id}`;
        if (usedPairs.has(key)) continue;
        usedPairs.add(key);
        reviewData.push({
          userId: shuffled[j].id,
          productId: allProducts[i].id,
          rating: randomInt(3, 5),
          title: reviewTexts[j % reviewTexts.length].slice(0, 50),
          comment: reviewTexts[(i + j) % reviewTexts.length],
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
    if (existingOrders === 0) {
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
