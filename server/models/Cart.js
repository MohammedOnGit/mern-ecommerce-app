// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,
//           default: 1,
//         },
//       },
//     ],
//     lastUpdated: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Add index for better query performance
// cartSchema.index({ userId: 1 });

// const Cart = mongoose.model("Cart", cartSchema);
// module.exports = Cart;

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
    max: 100               // ← reasonable protection
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
    index: true             // ← kept + only one index
  },
  items: [cartItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true          // gives createdAt + updatedAt
});

// Auto-update lastUpdated when items change
cartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.lastUpdated = new Date();
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema);