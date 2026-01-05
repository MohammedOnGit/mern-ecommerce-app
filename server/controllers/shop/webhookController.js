// controllers/shop/webhookController.js 
const crypto = require('crypto');
const Order = require('../../models/Order');
const Cart = require('../../models/Cart');

const handlePaystackWebhook = async (req, res) => {
  const webhookId = crypto.randomBytes(8).toString('hex');
  console.log(`[WEBHOOK-${webhookId}] 🪝 Webhook received`);
  
  try {
    const event = req.body;
    console.log(`[WEBHOOK-${webhookId}] Event: ${event.event}`);
    
    if (event.event === 'charge.success') {
      const transactionData = event.data;
      
      const order = await Order.findOne({ paymentId: transactionData.reference });
      
      if (!order) {
        console.error(`[WEBHOOK-${webhookId}] Order not found for reference: ${transactionData.reference}`);
        return res.sendStatus(404);
      }
      
      const amountPaid = transactionData.amount / 100;
      if (amountPaid !== order.totalAmount) {
        console.error(`[WEBHOOK-${webhookId}] Amount mismatch for order ${order._id}. Paid: ${amountPaid}, Expected: ${order.totalAmount}`);
        order.paymentStatus = 'failed';
        await order.save();
        return res.sendStatus(400);
      }
      
      if (order.paymentStatus !== 'completed') {
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.payerId = transactionData.customer.email;
        order.orderUpdateDate = new Date();
        order.transactionDetails = {
          gateway: 'paystack',
          chargeId: transactionData.id,
          channel: transactionData.channel,
          ipAddress: transactionData.ip_address,
          paidAt: transactionData.paid_at,
          via: 'webhook'
        };
        
        await order.save();
        console.log(`[WEBHOOK-${webhookId}] ✅ Order ${order._id} confirmed via webhook.`);
        
        try {
          const cart = await Cart.findOne({ userId: order.userId });
          if (cart) {
            cart.items = [];
            cart.lastUpdated = new Date();
            await cart.save();
            console.log(`[WEBHOOK-${webhookId}] 🛒 Cart cleared for user: ${order.userId}`);
          }
        } catch (cartError) {
          console.error(`[WEBHOOK-${webhookId}] ❌ Error clearing cart:`, cartError);
        }
      }
      
      res.sendStatus(200);
    } else if (event.event === 'charge.failed') {
      console.log(`[WEBHOOK-${webhookId}] ❌ Payment failed for reference: ${event.data.reference}`);
      
      const order = await Order.findOne({ paymentId: event.data.reference });
      if (order) {
        order.paymentStatus = 'failed';
        order.orderUpdateDate = new Date();
        await order.save();
        console.log(`[WEBHOOK-${webhookId}] Updated order ${order._id} to failed status`);
      }
      
      res.sendStatus(200);
    } else {
      console.log(`[WEBHOOK-${webhookId}] ℹ️ Received unhandled event: ${event.event}`);
      res.sendStatus(200);
    }
  } catch (error) {
    console.error(`[WEBHOOK-${webhookId}] ❌ Webhook processing error:`, error);
    res.sendStatus(500);
  }
};

module.exports = { handlePaystackWebhook };