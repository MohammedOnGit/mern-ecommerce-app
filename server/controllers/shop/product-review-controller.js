const Order = require('../../models/Order');
const ProductReview = require('../../models/Review'); // FIXED: Changed from 'Review' to 'ProductReview'
const Product = require('../../models/Product');

const addProductReview = async (req, res) => {
  try {
    // Get userId from authenticated user (from authMiddleware)
    const userId = req.user?.id;
    
    // Get other data from request body
    const { productId, reviewMessage, reviewValue } = req.body;
    const userName = req.user?.userName || req.body.userName; // Prefer authenticated user's name

    // Validation
    if (!productId || !reviewMessage || !reviewValue) {
      return res.status(400).json({ 
        success: false,
        message: 'Product ID, review message and rating are required.'
      });
    }

    // Ensure user is authenticated
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required to submit a review.'
      });
    }

    // Validate rating range
    if (reviewValue < 1 || reviewValue > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    // Validate review message length
    if (reviewMessage.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Review message must be at least 10 characters.'
      });
    }

    // Check if user has purchased the product (confirmed/delivered/completed)
    const hasPurchased = await Order.findOne({
      userId,
      "cartItems.productId": productId,
      orderStatus: { $in: ["confirmed", "delivered", "completed"] }
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only review products you have purchased.'
      });
    }

    // Check for existing review
    const existingReview = await ProductReview.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this product.'
      });
    }

    // Create new review
    const newReview = new ProductReview({
      productId,
      userId,
      userName,
      reviewMessage: reviewMessage.trim(),
      reviewValue,
      createdAt: new Date()
    });

    await newReview.save();

    // Update product rating using the model method (more efficient)
    const product = await Product.findById(productId);
    if (product) {
      // Use the updateRating method we defined in product model
      await product.updateRating();
    }

    res.status(201).json({ 
      success: true,
      message: 'Review added successfully.',
      data: newReview
    });
  } catch (error) {
    console.error('Review addition error:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: error.message
      });
    }
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this product.'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while adding review.'
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate productId
    if (!productId || productId.length !== 24) { // MongoDB ObjectId is 24 chars
      return res.status(400).json({ 
        success: false,
        message: 'Invalid product ID.'
      });
    }
    
    const reviews = await ProductReview.find({ productId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json({ 
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching reviews.'
    });
  }
};

const checkCanReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    // Validate productId
    if (!productId || productId.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid product ID.'
      });
    }

    if (!userId) {
      return res.status(200).json({ 
        success: true,
        canReview: false,
        reason: 'not-logged-in',
        message: 'Please login to submit a review.'
      });
    }

    const hasPurchased = await Order.findOne({
      userId,
      "cartItems.productId": productId,
      orderStatus: { $in: ["confirmed", "delivered", "completed"] }
    });

    if (!hasPurchased) {
      return res.status(200).json({ 
        success: true,
        canReview: false,
        reason: 'not-purchased',
        message: 'You can only review products you have purchased.'
      });
    }

    const existingReview = await ProductReview.findOne({ productId, userId });
    if (existingReview) {
      return res.status(200).json({ 
        success: true,
        canReview: false,
        reason: 'already-reviewed',
        message: 'You have already reviewed this product.'
      });
    }

    res.status(200).json({ 
      success: true,
      canReview: true,
      reason: 'eligible',
      message: 'You can review this product.'
    });
  } catch (error) {
    console.error('Check can review error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while checking review eligibility.'
    });
  }
};

module.exports = { addProductReview, getProductReviews, checkCanReview };