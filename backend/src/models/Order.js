const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    productId: {
      type: String,
      required: [true, 'Product ID is required for each item'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required for each item'],
    },
    size: {
      type: String,
      default: 'M',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price must be non-negative'],
    },
    price: {
      type: Number,
    },
    image: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    shippingAddress: {
      type: String,
      required: [true, 'Shipping address is required'],
      trim: true,
    },
    customer: {
      name: String,
      email: String,
      address: String,
      state: String,
      city: String,
      pincode: String,
      paymentMethod: String,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    gstAmount: {
      type: Number,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
    },
    status: {
      type: String,
      enum: {
        values: ['Placed', 'Dispatched', 'Delivered'],
        message: '{VALUE} is not a valid order status. Allowed: Placed, Dispatched, Delivered',
      },
      default: 'Placed',
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
    paymentStatus: {
      type: String,
      default: 'Pending',
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    orderConfirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    paymentConfirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep id/orderId, taxAmount/gstAmount, and total/totalAmount synchronized
orderSchema.pre('save', function () {
  if (!this.id && this.orderId) {
    this.id = this.orderId;
  }
  if (!this.orderId && this.id) {
    this.orderId = this.id;
  }
  if (this.gstAmount === undefined && this.taxAmount !== undefined) {
    this.gstAmount = this.taxAmount;
  }
  if (this.taxAmount === undefined && this.gstAmount !== undefined) {
    this.taxAmount = this.gstAmount;
  }
  if (this.total === undefined && this.totalAmount !== undefined) {
    this.total = this.totalAmount;
  }
  if (this.totalAmount === undefined && this.total !== undefined) {
    this.totalAmount = this.total;
  }
  if (!this.date) {
    this.date = new Date(this.createdAt || Date.now()).toISOString();
  }
});

module.exports = mongoose.model('Order', orderSchema);
