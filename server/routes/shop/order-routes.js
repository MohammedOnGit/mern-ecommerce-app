const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  verifyPayment,
  getOrderDetails 
} = require('../../controllers/shop/order-controller');

const { handlePaystackWebhook } = require('../../controllers/shop/webhookController');

// Create new order and initialize Paystack payment
router.post('/create', createOrder);

// Verify Paystack payment after user returns from redirect
router.get('/verify-payment', verifyPayment);

// Get order details
router.get('/:orderId', getOrderDetails);

// Paystack Webhook - MUST use express.raw for signature verification
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), handlePaystackWebhook);

module.exports = router;