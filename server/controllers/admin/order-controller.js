const crypto = require('crypto');
const Order = require('../../models/Order');

const getAllOrderOfAllUsers = async (req, res) => {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');

  try {
    // 🔐 Admin protection
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin only'
      });
    }

    // 📄 Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 🎯 Filtering options
    const filter = {};
    if (req.query.status) {
      // Map "shipped" to "shipping" for database query
      const status = req.query.status === 'shipped' ? 'shipping' : req.query.status;
      filter.orderStatus = status;
    }
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.search) {
      filter.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { customerEmail: { $regex: req.query.search, $options: 'i' } },
        { 'addressInfo.fullName': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Order.countDocuments(filter)
    ]);

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      requestId,
      responseTime: `${responseTime}ms`,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      },
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
        customerEmail: order.customerEmail,
        customerName: order.addressInfo?.fullName || 'N/A'
      }))
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Failed to fetch orders`, error);

    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  console.log('📋 Fetching order details:', req.params.orderId);
  
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  try {
    const { orderId } = req.params;
    
    // 🔐 Admin protection
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin only'
      });
    }
    
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
        customerEmail: order.customerEmail,
        customerName: order.addressInfo?.fullName || 'N/A'
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

// const updateOrderStatus = async (req, res) => {
//   console.log('🔄 Update Order Status:', req.params.orderId, req.body);
  
//   const startTime = Date.now();
//   const requestId = crypto.randomBytes(8).toString('hex');
  
//   try {
//     const { orderId } = req.params;
//     let { status } = req.body;
    
//     console.log('🔄 Update request params:', {
//       params: req.params,
//       body: req.body,
//       orderId: orderId
//     });
    
//     // 🔐 Admin protection
//     if (!req.user || req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied - Admin only'
//       });
//     }
    
//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Status is required'
//       });
//     }
    
//     // Normalize status: map "shipped" to "shipping" for consistency
//     if (status === 'shipped') {
//       status = 'shipping';
//     }
    
//     // Valid statuses (using consistent naming)
//     const validStatuses = ['pending', 'processing', 'confirmed', 'shipping', 'delivered', 'cancelled'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
//       });
//     }
    
//     const order = await Order.findById(orderId);
    
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     // Update order
//     order.orderStatus = status;
//     order.orderUpdateDate = new Date();
    
//     await order.save();
    
//     const responseTime = Date.now() - startTime;
    
//     res.status(200).json({
//       success: true,
//       message: `Order status updated to ${status}`,
//       requestId,
//       responseTime: `${responseTime}ms`,
//       order: {
//         id: order._id,
//         orderStatus: order.orderStatus,
//         orderUpdateDate: order.orderUpdateDate
//       }
//     });
    
//   } catch (error) {
//     const responseTime = Date.now() - startTime;
//     console.error(`[${requestId}] ❌ Update Order Status Error (${responseTime}ms):`, error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update order status',
//       requestId,
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// Update the updateOrderStatus function in your admin order controller
const updateOrderStatus = async (req, res) => {
  console.log('🔄 Update Order Status:', req.params.orderId, req.body);
  
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  try {
    const { orderId } = req.params;
    let { status, reason } = req.body;
    
    console.log('🔄 Update request params:', {
      params: req.params,
      body: req.body,
      orderId: orderId
    });
    
    // 🔐 Admin protection
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin only'
      });
    }
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Normalize status: map "shipped" to "shipping" for consistency
    if (status === 'shipped') {
      status = 'shipping';
    }
    
    // Valid statuses
    const validStatuses = ['pending', 'processing', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Prevent invalid status transitions
    if (order.orderStatus === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a cancelled order'
      });
    }
    
    if (order.orderStatus === 'delivered' && status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a delivered order'
      });
    }
    
    const previousStatus = order.orderStatus;
    const previousStockStatus = order.stockStatus;
    
    // Handle stock based on status change
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      // Cancel order and release stock
      await Order.cancelOrderAndReleaseStock(orderId, reason || 'Admin cancellation');
      
      const responseTime = Date.now() - startTime;
      
      return res.status(200).json({
        success: true,
        message: `Order cancelled and stock released`,
        requestId,
        responseTime: `${responseTime}ms`,
        order: {
          id: order._id,
          orderStatus: 'cancelled',
          stockStatus: 'stock_released',
          orderUpdateDate: new Date()
        }
      });
      
    } else if (status === 'confirmed' && previousStatus === 'pending') {
      // Deduct stock when order is confirmed
      const deductionResults = [];
      const deductionErrors = [];
      
      for (const item of order.cartItems) {
        const itemStockInfo = item.stockInfo || {};
        if (!itemStockInfo.allowBackorders || itemStockInfo.availableAtCheckout >= item.quantity) {
          try {
            const deductedProduct = await Product.deductStock(item.productId, item.quantity);
            deductionResults.push({
              productId: item.productId,
              title: item.title,
              deducted: item.quantity,
              newTotalStock: deductedProduct.totalStock,
              newAvailableStock: deductedProduct.availableStock
            });
          } catch (deductError) {
            deductionErrors.push({
              productId: item.productId,
              title: item.title,
              error: deductError.message
            });
          }
        }
      }
      
      // Update order
      order.orderStatus = status;
      order.stockStatus = deductionErrors.length > 0 ? 'partial_stock_deducted' : 'stock_deducted';
      order.stockDeductedAt = new Date();
      order.deductionResults = deductionResults;
      order.orderUpdateDate = new Date();
      
      await order.save();
      
      const responseTime = Date.now() - startTime;
      
      return res.status(200).json({
        success: true,
        message: `Order confirmed and stock deducted`,
        requestId,
        responseTime: `${responseTime}ms`,
        stockDeduction: {
          success: deductionResults.length,
          failed: deductionErrors.length,
          results: deductionResults,
          errors: deductionErrors.length > 0 ? deductionErrors : undefined
        },
        order: {
          id: order._id,
          orderStatus: order.orderStatus,
          stockStatus: order.stockStatus,
          orderUpdateDate: order.orderUpdateDate
        }
      });
      
    } else if (status === 'delivered' && previousStockStatus !== 'stock_deducted' && previousStockStatus !== 'partial_stock_deducted') {
      // If marking as delivered but stock wasn't deducted yet
      return res.status(400).json({
        success: false,
        message: 'Cannot deliver order without deducting stock first. Confirm order first.',
        requestId
      });
      
    } else {
      // Regular status update
      order.orderStatus = status;
      order.orderUpdateDate = new Date();
      
      await order.save();
    }
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      requestId,
      responseTime: `${responseTime}ms`,
      order: {
        id: order._id,
        orderStatus: order.orderStatus,
        orderUpdateDate: order.orderUpdateDate
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Update Order Status Error (${responseTime}ms):`, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { 
  getAllOrderOfAllUsers, 
  getOrderDetailsForAdmin,
  updateOrderStatus,
};