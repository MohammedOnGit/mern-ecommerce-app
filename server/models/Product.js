const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  salePrice: Number,
  image: String,
  category: String,
  brand: String,
  
  // ✅ UPDATED: Review rating fields (renamed from 'rating' and 'reviews')
  averageReview: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // ✅ KEPT: Enhanced stock management fields
  totalStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  availableStock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  
  allowBackorders: {
    type: Boolean,
    default: false
  },
  
  showOutOfStock: {
    type: Boolean,
    default: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ✅ UPDATED: Pre-save middleware to calculate availableStock
productSchema.pre('save', function(next) {
  // Calculate available stock
  this.availableStock = Math.max(0, this.totalStock - this.reservedStock);
  
  // Update inStock status
  this.inStock = this.availableStock > 0 || this.allowBackorders;
  
  next();
});

// ✅ KEPT: Method to check stock availability
productSchema.methods.checkStockAvailability = function(requestedQuantity = 1) {
  const availableStock = this.availableStock || Math.max(0, this.totalStock - this.reservedStock);
  const isLowStock = availableStock > 0 && availableStock <= this.lowStockThreshold;
  
  return {
    available: this.allowBackorders ? true : availableStock >= requestedQuantity,
    availableStock: availableStock,
    totalStock: this.totalStock,
    reservedStock: this.reservedStock,
    allowBackorders: this.allowBackorders,
    isLowStock: isLowStock,
    isActive: this.isActive,
    showOutOfStock: this.showOutOfStock,
    averageReview: this.averageReview,
    reviewCount: this.reviewCount
  };
};

// ✅ KEPT: Static method to check stock availability by product ID
productSchema.statics.checkStockAvailability = async function(productId, requestedQuantity = 1) {
  const product = await this.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (!product.isActive) {
    return {
      available: false,
      reason: 'Product is not active',
      productId: productId,
      isActive: false
    };
  }
  
  const availableStock = product.availableStock || Math.max(0, product.totalStock - product.reservedStock);
  const isLowStock = availableStock > 0 && availableStock <= product.lowStockThreshold;
  
  return {
    available: product.allowBackorders ? true : availableStock >= requestedQuantity,
    availableStock: availableStock,
    totalStock: product.totalStock,
    reservedStock: product.reservedStock,
    allowBackorders: product.allowBackorders,
    isLowStock: isLowStock,
    isActive: product.isActive,
    showOutOfStock: product.showOutOfStock,
    averageReview: product.averageReview,
    reviewCount: product.reviewCount,
    productId: productId,
    product: product
  };
};

// ✅ KEPT: Method to reserve stock (when added to cart)
productSchema.methods.reserveStock = async function(quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  const availableStock = Math.max(0, this.totalStock - this.reservedStock);
  
  if (!this.allowBackorders && availableStock < quantity) {
    throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
  }
  
  this.reservedStock += quantity;
  this.availableStock = Math.max(0, this.totalStock - this.reservedStock);
  
  await this.save();
  return this;
};

// ✅ KEPT: Static method to reserve stock by product ID
productSchema.statics.reserveStock = async function(productId, quantity) {
  const product = await this.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return await product.reserveStock(quantity);
};

// ✅ KEPT: Method to release stock (when removed from cart or order cancelled)
productSchema.methods.releaseStock = async function(quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  if (this.reservedStock < quantity) {
    console.warn(`Attempting to release more stock (${quantity}) than reserved (${this.reservedStock}). Releasing all.`);
    this.reservedStock = 0;
  } else {
    this.reservedStock -= quantity;
  }
  
  this.availableStock = Math.max(0, this.totalStock - this.reservedStock);
  
  await this.save();
  return this;
};

// ✅ KEPT: Static method to release stock by product ID
productSchema.statics.releaseStock = async function(productId, quantity) {
  const product = await this.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return await product.releaseStock(quantity);
};

// ✅ KEPT: Method to deduct stock (when order is confirmed)
productSchema.methods.deductStock = async function(quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  if (this.totalStock < quantity) {
    if (!this.allowBackorders) {
      throw new Error(`Insufficient total stock. Available: ${this.totalStock}, Requested: ${quantity}`);
    }
    // For backorders, we allow the deduction even if stock is 0
    console.log(`Processing backorder for product ${this._id}: Requested ${quantity}, Stock: ${this.totalStock}`);
  }
  
  // Reduce total stock
  this.totalStock = Math.max(0, this.totalStock - quantity);
  
  // Also reduce reserved stock if any
  const reservedToRelease = Math.min(this.reservedStock, quantity);
  if (reservedToRelease > 0) {
    this.reservedStock -= reservedToRelease;
  }
  
  this.availableStock = Math.max(0, this.totalStock - this.reservedStock);
  this.inStock = this.availableStock > 0 || this.allowBackorders;
  
  await this.save();
  return this;
};

// ✅ KEPT: Static method to deduct stock by product ID
productSchema.statics.deductStock = async function(productId, quantity) {
  const product = await this.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return await product.deductStock(quantity);
};

// ✅ NEW: Method to update average rating (used in review controller)
productSchema.methods.updateRating = async function() {
  // This method should be called after reviews are added/removed
  const ProductReview = require('./product-review-model');
  const reviews = await ProductReview.find({ productId: this._id.toString() });
  
  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    this.averageReview = 0;
    this.reviewCount = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.reviewValue, 0);
    this.averageReview = Number((totalRating / totalReviews).toFixed(1));

    this.reviewCount = totalReviews;
  }
  
  await this.save();
  return this;
};

// ✅ NEW: Static method to update rating by product ID
productSchema.statics.updateRating = async function(productId) {
  const product = await this.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return await product.updateRating();
};

// ✅ KEPT: Method to check if product can be added to cart (backward compatibility)
productSchema.methods.canAddToCart = function(quantity = 1) {
  const stockCheck = this.checkStockAvailability(quantity);
  return stockCheck.available;
};

// ✅ KEPT: Method to reduce stock (renamed from original, maintains backward compatibility)
productSchema.methods.reduceStock = async function(quantity) {
  return await this.deductStock(quantity);
};

// ✅ KEPT: Method to increase stock (restocking)
productSchema.methods.increaseStock = async function(quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  this.totalStock += quantity;
  this.availableStock = Math.max(0, this.totalStock - this.reservedStock);
  this.inStock = true;
  
  await this.save();
  return this;
};

// ✅ KEPT: Static method to increase stock by product ID
productSchema.statics.increaseStock = async function(productId, quantity) {
  const product = await this.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return await product.increaseStock(quantity);
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;