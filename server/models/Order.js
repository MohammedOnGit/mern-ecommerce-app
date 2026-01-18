// server/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
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
    max: 1000
  },
  productTotal: {
    type: Number,
    min: 0
  },
  // Stock information at time of order
  stockInfo: {
    availableAtCheckout: {
      type: Number,
      default: 0
    },
    allowBackorders: {
      type: Boolean,
      default: false
    },
    isBackorder: {
      type: Boolean,
      default: false
    },
    isLowStock: {
      type: Boolean,
      default: false
    }
  }
}, { _id: false });

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
    index: true,
    trim: true
  },

  cartItems: [orderItemSchema],

  addressInfo: addressSchema,

  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
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
    sparse: true,
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

  // Stock Management Fields
  stockStatus: {
    type: String,
    enum: ['pending', 'stock_reserved', 'has_backorders', 'stock_deducted', 'partial_stock_deducted', 'stock_released', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  stockReservedAt: {
    type: Date
  },
  
  stockDeductedAt: {
    type: Date
  },
  
  reservationResults: [{
    productId: String,
    reserved: Number,
    _id: false
  }],
  
  deductionResults: [{
    productId: String,
    title: String,
    deducted: Number,
    newTotalStock: Number,
    newAvailableStock: Number,
    _id: false
  }],
  
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 500
  },

  ipAddress: {
    type: String,
    trim: true
  },

  userAgent: {
    type: String,
    trim: true
  },

  orderDate: {
    type: Date,
    default: Date.now,
    index: -1
  },
  
  orderUpdateDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function () {
  return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for checking if order has backorders
orderSchema.virtual('hasBackorders').get(function () {
  return this.cartItems?.some(item => 
    item.stockInfo?.isBackorder || 
    (item.stockInfo?.allowBackorders && item.stockInfo?.availableAtCheckout < item.quantity)
  );
});

// Pre-save middleware
orderSchema.pre('save', function (next) {
  // Update orderUpdateDate on any change
  this.orderUpdateDate = new Date();
  
  // Calculate product totals if missing
  if (this.isModified('cartItems')) {
    this.cartItems.forEach(item => {
      if (!item.productTotal) {
        item.productTotal = item.price * item.quantity;
      }
      
      // Ensure stockInfo exists
      if (!item.stockInfo) {
        item.stockInfo = {
          availableAtCheckout: 0,
          allowBackorders: false,
          isBackorder: false,
          isLowStock: false
        };
      }
    });
    
    // Recalculate subtotal
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.productTotal || 0), 0);
  }
  
  // Auto-update stock status based on order status
  if (this.isModified('orderStatus')) {
    if (this.orderStatus === 'cancelled' && this.stockStatus === 'stock_reserved') {
      this.stockStatus = 'stock_released';
    } else if (this.orderStatus === 'confirmed' && this.stockStatus === 'stock_reserved') {
      this.stockStatus = 'stock_deducted';
      this.stockDeductedAt = new Date();
    }
  }
  
  next();
});

// Static method to cancel order and release stock
orderSchema.statics.cancelOrderAndReleaseStock = async function(orderId, reason = 'Customer cancellation') {
  const order = await this.findById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.orderStatus === 'cancelled') {
    return order; // Already cancelled
  }
  
  // Release reserved stock if any
  if (order.stockStatus === 'stock_reserved') {
    const Product = require('./Product');
    
    for (const item of order.cartItems) {
      try {
        await Product.releaseStock(item.productId, item.quantity);
      } catch (releaseError) {
        console.error(`Failed to release stock for product ${item.productId}:`, releaseError);
      }
    }
    
    order.stockStatus = 'stock_released';
  }
  
  order.orderStatus = 'cancelled';
  order.paymentStatus = 'refunded';
  order.cancellationReason = reason;
  order.orderUpdateDate = new Date();
  
  return await order.save();
};

// Compound indexes
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ orderStatus: 1, stockStatus: 1 });
orderSchema.index({ paymentStatus: 1, orderDate: -1 });
orderSchema.index({ stockStatus: 1, orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);