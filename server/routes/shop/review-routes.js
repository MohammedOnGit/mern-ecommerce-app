const express = require('express');
const { 
  addProductReview, 
  getProductReviews, 
  checkCanReview 
} = require('../../controllers/shop/product-review-controller');

const { authMiddleware } = require('../../controllers/auth/auth-controller');

const router = express.Router();

// Log route initialization
console.log('🔧 Initializing review routes with auth middleware...');

// Protected routes (require authentication)
router.post('/', authMiddleware, addProductReview);
router.get('/can-review/:productId', authMiddleware, checkCanReview);

// Public route (no auth needed)
router.get('/:productId', getProductReviews);

// Optional: Test route to confirm auth middleware works (useful for debugging)
router.get('/test/auth-test', authMiddleware, (req, res) => {
  console.log('✅ Auth middleware test successful');
  res.status(200).json({ 
    success: true, 
    message: 'Auth middleware is working correctly!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;