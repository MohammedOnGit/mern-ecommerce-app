const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  // ADDED: Stock reservation tracking
  stockReserved: {
    type: Boolean,
    default: false
  },
  reservationId: {
    type: String,
    sparse: true
  },
  lastReservedAt: {
    type: Date
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  items: [cartItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-update lastUpdated when items change
cartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.lastUpdated = new Date();
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema);