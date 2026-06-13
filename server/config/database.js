const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL Connected: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'postgres' : 'postgres'}`);
  } catch (error) {
    console.error(`❌ PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }
};

sequelize.addHook('afterFind', (result) => {
  if (!result) return;
  const models = Array.isArray(result) ? result : [result];
  for (const model of models) {
    if (!model || !model.dataValues) continue;
    const dv = model.dataValues;
    // Add _id alias for MongoDB-compatible frontend
    if (dv.id) dv._id = dv.id;
    // DECIMAL fields come back as strings from pg — cast to number
    for (const key of ['total', 'subtotal', 'shippingCost', 'tax', 'price', 'discountPrice']) {
      if (typeof dv[key] === 'string') dv[key] = parseFloat(dv[key]);
    }
    // Fix null orderNumber from seed (hooks:false bypassed beforeCreate)
    if (dv.orderNumber === null) {
      const ts = Date.now().toString(36).toUpperCase();
      const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
      dv.orderNumber = `BH-${ts}-${rnd}`;
    }
    // Items are plain JSONB — add _id to each
    if (Array.isArray(dv.items)) {
      dv.items.forEach((item) => {
        if (!item._id) item._id = item.product;
        if (typeof item.subtotal === 'string') item.subtotal = parseFloat(item.subtotal);
        if (typeof item.price === 'string') item.price = parseFloat(item.price);
      });
    }
  }
});

module.exports = { sequelize, connectDB };
