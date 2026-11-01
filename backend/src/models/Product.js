const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Product name is required'],
    },
    title: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: 'StyleStack',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    categoryName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
      default: 'unisex',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    stock: {
      type: Number,
      default: 10,
      min: [0, 'Stock cannot be negative'],
    },
    inStock: {
      type: Number,
      default: 10,
      min: [0, 'Stock cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      default: 10,
      min: [0, 'Stock quantity cannot be negative'],
    },
    badge: {
      type: String,
      default: 'New Arrival',
    },
    image: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewsCount: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep title/name, image/imageUrl, and stock fields synchronized
productSchema.pre('save', function () {
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (!this.categoryName && this.category) {
    this.categoryName = this.category;
  }
  if (!this.imageUrl && this.image) {
    this.imageUrl = this.image;
  }
  if (!this.image && this.imageUrl) {
    this.image = this.imageUrl;
  }

  const effectiveStock =
    this.stock !== undefined
      ? this.stock
      : this.stockQuantity !== undefined
      ? this.stockQuantity
      : this.inStock !== undefined
      ? this.inStock
      : 10;

  this.stock = effectiveStock;
  this.stockQuantity = effectiveStock;
  this.inStock = effectiveStock;

  if (!this.id) {
    this.id = `prod-${Date.now()}`;
  }
});

module.exports = mongoose.model('Product', productSchema);
