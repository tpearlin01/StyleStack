const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', function () {
  if (!this.firstName && this.name) {
    this.firstName = this.name.split(' ')[0];
  }
  if (!this.lastName && this.name) {
    this.lastName = this.name.split(' ').slice(1).join(' ') || '';
  }
  if (!this.id) {
    this.id = `usr-${Date.now()}`;
  }
});

module.exports = mongoose.model('User', userSchema);
