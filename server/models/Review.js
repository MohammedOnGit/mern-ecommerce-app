const mongoose = require('mongoose');

const ProductReviewSchema = new mongoose.Schema({
  productId: String,
  userId: String,
  userName: String,
  reviewMessage: String,
  reviewValue: {
    type: Number,
    min: 1,
    max: 5
  }
}, { timestamps: true });

module.exports = mongoose.model('ProductReview', ProductReviewSchema);