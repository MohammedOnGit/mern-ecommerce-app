const express = require('express');
const router = express.Router();
const { 
  getAllOrderOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require('../../controllers/admin/order-controller');
const { authMiddleware } = require('../../controllers/auth/auth-controller');

// Admin middleware - check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied - Admin only'
    });
  }
};

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// Get all orders with pagination
router.get('/get', getAllOrderOfAllUsers);

// Get order details by ID - FIXED: use :orderId
router.get('/details/:orderId', getOrderDetailsForAdmin);

// Update order status - FIXED: use :orderId
router.put('/update/:orderId', updateOrderStatus);

module.exports = router;