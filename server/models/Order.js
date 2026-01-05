// models/Order.js 
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  cartItems: [
    {
      productId: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      image: String,
      price: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      productTotal: {
        type: Number,
        min: 0
      }
    },
  ],
  addressInfo: {
    addressId: String,
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    digitalAddress: String,
    phone: String,
    notes: String,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'paystack', 'cod', 'card'],
    default: 'paystack'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    min: 0,
    default: 0
  },
  shippingFee: {
    type: Number,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    min: 0,
    default: 0
  },
  customerEmail: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  orderUpdateDate: {
    type: Date,
    default: Date.now
  },
  paymentId: String,
  payerId: String,
  transactionDetails: {
    gateway: String,
    chargeId: String,
    channel: String,
    ipAddress: String,
    paidAt: Date
  }
}, {
  timestamps: true
});

// Add indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ orderDate: -1 });

// Create model
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;