const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String, // Consider changing to mongoose.Schema.Types.ObjectId if you have Product model
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  image: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 1000 // reasonable upper limit - adjust as needed
  },
  productTotal: {
    type: Number,
    min: 0
  }
}, { _id: false }); // No need for subdocument _id


const addressSchema = new mongoose.Schema({
  addressId: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  digitalAddress: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: false });


const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,           // ← Main index for user orders lookup
    trim: true
  },

  cartItems: [orderItemSchema],

  addressInfo: addressSchema,

  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'],
    default: 'pending',
    index: true             // Useful for admin dashboards / status filtering
  },

  paymentMethod: {
    type: String,
    enum: ['paypal', 'paystack', 'cod', 'card'],
    default: 'paystack'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
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
    required: true,
    trim: true,
    lowercase: true
  },

  paymentId: {
    type: String,
    sparse: true,          // Allows null values + creates index
    index: true
  },

  payerId: {
    type: String,
    sparse: true
  },

  transactionDetails: {
    gateway: String,
    chargeId: String,
    channel: String,
    ipAddress: String,
    paidAt: Date
  },

  orderDate: {
    type: Date,
    default: Date.now,
    index: -1               // Most recent orders first
  }
}, {
  timestamps: true,         // automatically adds createdAt & updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Optional: Virtual for total items count
orderSchema.virtual('totalItems').get(function () {
  return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
});

// Optional: Pre-save middleware to ensure productTotal is calculated
orderSchema.pre('save', function (next) {
  if (this.isModified('cartItems')) {
    this.cartItems.forEach(item => {
      if (!item.productTotal) {
        item.productTotal = item.price * item.quantity;
      }
    });
    
    // Optional: recalculate subtotal if needed
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.productTotal || 0), 0);
  }
  next();
});

// Compound index examples (uncomment if needed)
// orderSchema.index({ userId: 1, orderDate: -1 });     // very common query pattern
// orderSchema.index({ orderStatus: 1, orderDate: -1 }); // admin status views

module.exports = mongoose.model('Order', orderSchema);