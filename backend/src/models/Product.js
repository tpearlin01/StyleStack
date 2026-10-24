const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
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
    stockQuantity: {
      type: Number,
      default: 10,
      min: [0, 'Stock quantity cannot be negative'],
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
  },
  {
    timestamps: true,
  }
);

// Keep title and name in sync
productSchema.pre('save', function (next) {
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (this.stockQuantity !== undefined && this.stock === undefined) {
    this.stock = this.stockQuantity;
  } else if (this.stock !== undefined && (this.stockQuantity === undefined || this.stockQuantity === 10)) {
    this.stockQuantity = this.stock;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
