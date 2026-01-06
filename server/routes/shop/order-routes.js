const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  verifyPayment,
  getOrderDetails,
  getAllOrdersByUserId 
} = require('../../controllers/shop/order-controller');

const { handlePaystackWebhook } = require('../../controllers/shop/webhookController');

// Create new order and initialize Paystack payment
router.post('/create', createOrder);

// Verify Paystack payment after user returns from redirect
router.get('/verify-payment', verifyPayment);

// Get order details by order ID
router.get('/details/:orderId', getOrderDetails);

// Get all orders by user ID
router.get('/list/:userId', getAllOrdersByUserId); // ADDED: This route was missing

// Paystack Webhook - MUST use express.raw for signature verification
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), handlePaystackWebhook);

module.exports = router;