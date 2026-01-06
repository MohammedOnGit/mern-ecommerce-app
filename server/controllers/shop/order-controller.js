const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const paystack = require('../../helpers/paystack');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); 

const createOrder = async (req, res) => {
  console.log("🛒 CREATE ORDER REQUEST RECEIVED");
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  console.log(`[${requestId}] 🛒 Starting order creation`, {
    userId: req.body.userId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    const {
      userId,
      cartItems,
      addressInfo,
      totalAmount,
      customerEmail,
      subtotal = 0,
      shippingFee = 0,
      tax = 0,
      notes = ''
    } = req.body;

    console.log(`[${requestId}] Received data:`, {
      userId,
      cartItemsCount: cartItems?.length,
      totalAmount,
      customerEmail,
      hasAddress: !!addressInfo
    });

    // Basic validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required and must be an array"
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required"
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required"
      });
    }

    // Validate each cart item
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      if (!item.productId || !item.title || !item.price || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cart item ${i + 1} is missing required fields: productId, title, price, or quantity`
        });
      }
    }

    // Calculate totals for verification - USE PRECISE CALCULATION
    let calculatedSubtotal = 0;
    const processedCartItems = cartItems.map(item => {
      const price = parseFloat(Number(item.price).toFixed(2));
      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = parseFloat((price * quantity).toFixed(2));
      calculatedSubtotal = parseFloat((calculatedSubtotal + itemTotal).toFixed(2));
      
      return {
        productId: item.productId,
        title: item.title,
        image: item.image || '',
        price: price,
        quantity: quantity,
        productTotal: itemTotal
      };
    });
    
    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));
    const calculatedShippingFee = parseFloat(Number(shippingFee).toFixed(2));
    const calculatedTax = parseFloat(Number(tax).toFixed(2));
    const calculatedTotal = parseFloat((calculatedSubtotal + calculatedShippingFee + calculatedTax).toFixed(2));
    
    const frontendTotal = parseFloat(Number(totalAmount).toFixed(2));
    const frontendSubtotal = parseFloat(Number(subtotal).toFixed(2)) || calculatedSubtotal;
    
    console.log(`[${requestId}] 💰 Total Calculation:`, {
      backend: {
        subtotal: calculatedSubtotal,
        shipping: calculatedShippingFee,
        tax: calculatedTax,
        total: calculatedTotal
      },
      frontend: {
        subtotal: frontendSubtotal,
        shipping: calculatedShippingFee,
        tax: calculatedTax,
        total: frontendTotal
      },
      cartItems: processedCartItems.map(item => ({
        price: item.price,
        quantity: item.quantity,
        total: item.productTotal
      }))
    });

    // FIXED: Use larger tolerance - 1 GHC or 5%
    const amountTolerance = Math.max(1.00, calculatedTotal * 0.05); // 5% or 1 GHC, whichever is larger
    
    if (Math.abs(calculatedTotal - frontendTotal) > amountTolerance) {
      console.warn(`[${requestId}] Amount mismatch`, {
        calculated: calculatedTotal,
        provided: frontendTotal,
        difference: Math.abs(calculatedTotal - frontendTotal),
        tolerance: amountTolerance
      });
      
      return res.status(400).json({
        success: false,
        message: 'Order total does not match calculated amount',
        calculatedTotal: calculatedTotal,
        providedTotal: frontendTotal,
        difference: Math.abs(calculatedTotal - frontendTotal),
        tolerance: amountTolerance,
        requestId
      });
    }

    // Use frontend's totals since they're within tolerance
    const finalTotal = frontendTotal;
    const finalSubtotal = frontendSubtotal;
    
    console.log(`[${requestId}] ✅ Totals accepted. Using:`, {
      total: finalTotal,
      subtotal: finalSubtotal,
      shipping: calculatedShippingFee,
      tax: calculatedTax
    });

    // Create order
    const newOrder = new Order({
      userId,
      cartItems: processedCartItems,
      addressInfo: addressInfo || {},
      orderStatus: 'pending',
      paymentMethod: 'paystack',
      paymentStatus: 'pending',
      subtotal: finalSubtotal,
      shippingFee: calculatedShippingFee,
      tax: calculatedTax,
      totalAmount: finalTotal,
      customerEmail,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      orderDate: new Date(),
      orderUpdateDate: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log(`[${requestId}] ✅ Order saved:`, savedOrder._id);

    // Generate unique reference
    const transactionReference = `ORDER_${savedOrder._id}_${Date.now()}`;
    
    // Prepare Paystack payload with improved callback URL
    const paystackData = {
      email: customerEmail,
      amount: Math.round(savedOrder.totalAmount * 100), // Convert to kobo
      reference: transactionReference,
      metadata: {
        orderId: savedOrder._id.toString(),
        userId: userId,
        itemsCount: cartItems.length,
        customerEmail: customerEmail
      },
      callback_url: `${process.env.BACKEND_BASE_URL || 'http://localhost:5000'}/api/shop/orders/verify-payment`
    };

    console.log(`[${requestId}] 🔗 Initializing Paystack payment`, {
      email: customerEmail,
      amount: savedOrder.totalAmount,
      reference: transactionReference,
      callback_url: paystackData.callback_url
    });

    // Initialize Paystack transaction
    const paystackResponse = await paystack.initializeTransaction(paystackData);

    if (!paystackResponse.status) {
      console.error(`[${requestId}] ❌ Paystack initialization failed:`, paystackResponse.message);
      
      // Update order with failure
      savedOrder.paymentStatus = 'failed';
      savedOrder.orderUpdateDate = new Date();
      await savedOrder.save();

      return res.status(500).json({
        success: false,
        message: 'Failed to initialize payment gateway',
        error: paystackResponse.message,
        requestId
      });
    }

    // Update order with payment reference
    savedOrder.paymentId = transactionReference;
    savedOrder.orderUpdateDate = new Date();
    await savedOrder.save();

    const responseTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Payment initialized in ${responseTime}ms`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder._id,
      authorization_url: paystackResponse.data.authorization_url,
      data: {
        orderId: savedOrder._id,
        orderNumber: transactionReference,
        totalAmount: savedOrder.totalAmount,
        payment: {
          authorization_url: paystackResponse.data.authorization_url,
          reference: transactionReference
        }
      },
      requestId
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Create Order Error (${responseTime}ms):`, {
      message: error.message,
      stack: error.stack,
      body: req.body
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Order validation failed',
        errors: Object.values(error.errors).map(err => err.message),
        requestId
      });
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate order detected',
        requestId
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      requestId,
      responseTime: `${responseTime}ms`
    });
  }
};

const verifyPayment = async (req, res) => {
  console.log('🔍 Verifying payment for reference:', req.query.reference);
  
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  try {
    const reference = req.query.reference || req.query.trxref;
    
    if (!reference) {
      console.warn(`[${requestId}] No reference provided in callback`);
      return res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/payment-failed?error=no_reference`);
    }

    // Verify transaction with Paystack
    const verification = await paystack.verifyTransaction(reference);
    
    if (!verification.status || verification.data.status !== 'success') {
      console.error(`[${requestId}] Paystack verification failed:`, verification.message);
      return res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/payment-failed?error=verification_failed`);
    }

    const order = await Order.findOne({ paymentId: reference });
    if (!order) {
      console.error(`[${requestId}] Order not found for reference:`, reference);
      return res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/payment-failed?error=order_not_found`);
    }

    const amountPaid = verification.data.amount / 100;
    if (amountPaid !== order.totalAmount) {
      console.error(`[${requestId}] Amount mismatch for order ${order._id}. Paid: ${amountPaid}, Expected: ${order.totalAmount}`);
      order.paymentStatus = 'failed';
      order.orderUpdateDate = new Date();
      await order.save();
      return res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/payment-failed?error=amount_mismatch`);
    }

    if (order.paymentStatus === 'completed') {
      console.log(`[${requestId}] ℹ️ Order ${order._id} already completed.`);
      return res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/order-confirmation/${order._id}`);
    }

    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.payerId = verification.data.customer.email;
    order.orderUpdateDate = new Date();
    order.transactionDetails = {
      gateway: 'paystack',
      chargeId: verification.data.id,
      channel: verification.data.channel,
      ipAddress: verification.data.ip_address,
      paidAt: verification.data.paid_at
    };
    
    await order.save();
    console.log(`[${requestId}] ✅ Order ${order._id} confirmed via callback verification.`);

    // Clear user's cart
    try {
      const cart = await Cart.findOne({ userId: order.userId });
      if (cart) {
        cart.items = [];
        cart.lastUpdated = new Date();
        await cart.save();
        console.log(`[${requestId}] 🛒 Cart cleared for user: ${order.userId}`);
      } else {
        console.log(`[${requestId}] ℹ️ No cart found for user: ${order.userId}`);
      }
    } catch (cartError) {
      console.error(`[${requestId}] ❌ Error clearing cart:`, cartError);
    }

    // CRITICAL FIX: Regenerate authentication tokens and set cookies
    try {
      // Generate new tokens
      const accessToken = jwt.sign(
        { id: order.userId, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '60m' }
      );
      
      const refreshToken = jwt.sign(
        { id: order.userId, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set cookies with proper SameSite settings for cross-origin redirects
      const isProduction = process.env.NODE_ENV === 'production';
      
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000,
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
      });
      
      console.log(`[${requestId}] 🔑 Authentication cookies set for user: ${order.userId}`);
    } catch (tokenError) {
      console.error(`[${requestId}] ❌ Token generation error:`, tokenError);
    }

    const responseTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Verification completed in ${responseTime}ms`);

    // Generate a short-lived token to pass in URL for frontend to capture
    const urlToken = jwt.sign(
      { id: order.userId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    
    // Redirect with token in URL for frontend to capture and save to localStorage
    const redirectUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/order-confirmation/${order._id}?token=${urlToken}&payment_success=true`;
    
    console.log(`[${requestId}] 🔀 Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Verify Payment Error (${responseTime}ms):`, error);
    
    res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/payment-failed?error=server_error`);
  }
};

const getOrderDetails = async (req, res) => {
  console.log('📋 Fetching order details:', req.params.orderId);
  
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        userId: order.userId,
        cartItems: order.cartItems,
        addressInfo: order.addressInfo,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        orderDate: order.orderDate,
        paymentId: order.paymentId,
        transactionDetails: order.transactionDetails
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Get Order Error (${responseTime}ms):`, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get order details'
    });
  }
};

const getAllOrdersByUserId = async (req, res) => {
  console.log('📋 Fetching all orders for user:', req.params.userId);
  
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Convert userId to string if needed
    const userIdStr = userId.toString();
    console.log(`[${requestId}] Searching orders for user ID string: ${userIdStr}`);

    const orders = await Order.find({ userId: userIdStr })
      .sort({ orderDate: -1 })
      .select('-__v');

    console.log(`[${requestId}] Found ${orders.length} orders for user: ${userIdStr}`);

    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        _id: order._id,
        userId: order.userId,
        orderNumber: order.paymentId || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        cartItems: order.cartItems,
        addressInfo: order.addressInfo,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        tax: order.tax,
        totalAmount: order.totalAmount,
        orderDate: order.orderDate,
        orderUpdateDate: order.orderUpdateDate,
        paymentId: order.paymentId,
        transactionDetails: order.transactionDetails,
        customerEmail: order.customerEmail
      }))
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Get All Orders Error (${responseTime}ms):`, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { 
  createOrder, 
  verifyPayment,
  getOrderDetails,
  getAllOrdersByUserId 
};