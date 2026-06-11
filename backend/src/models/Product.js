const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    format: {
      type: String,
      enum: ['physical', 'ebook', 'both'],
      required: [true, 'Format is required'],
    },
    physicalBook: {
      stock: { type: Number, default: 0, min: 0 },
      weight: { type: Number, default: null },
      shippingCost: { type: Number, default: null },
    },
    ebook: {
      fileUrl: { type: String, default: null },
      filePublicId: { type: String, select: false, default: null },
      fileSize: { type: String, default: null },
      previewPages: { type: Number, default: null },
    },
    coverImage: {
      type: String,
      default: null,
    },
    coverImagePublicId: {
      type: String,
      select: false,
    },
    language: {
      type: String,
      default: 'English',
    },
    pages: Number,
    publisher: String,
    publishedYear: Number,
    tags: [String],
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    aiSummary: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratingsAverage: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: 1 });

productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice !== null ? this.discountPrice : this.price;
});

productSchema.virtual('stock').get(function () {
  if (this.format === 'ebook') return Infinity;
  return this.physicalBook?.stock ?? 0;
});

productSchema.virtual('ebookFile').get(function () {
  return this.ebook?.fileUrl ?? null;
});

productSchema.virtual('ebookPublicId').get(function () {
  return this.ebook?.filePublicId ?? null;
});

module.exports = mongoose.model('Product', productSchema);
