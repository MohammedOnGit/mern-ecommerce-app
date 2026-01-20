const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

/* Helper: map cart items with stock info */
const mapCartItems = (items = []) =>
  items.map((item) => {
    const p = item.productId || {};
    const image = p.image || (Array.isArray(p.images) ? p.images[0] : null);

    return {
      productId: p._id || null,
      image,
      title: p.title || "Product not found",
      price: p.price ?? null,
      salePrice: p.salePrice ?? null,
      quantity: item.quantity,
      // Stock information
      totalStock: p.totalStock || 0,
      reservedStock: p.reservedStock || 0,
      availableStock: p.availableStock || 0,
      isLowStock: (p.totalStock || 0) - (p.reservedStock || 0) <= (p.lowStockThreshold || 5),
      isOutOfStock: (p.totalStock || 0) <= 0,
      allowBackorders: p.allowBackorders || false,
      isActive: p.isActive !== false,
      // Reservation tracking
      stockReserved: item.stockReserved !== false,
      reservationId: item.reservationId || null
    };
  });

/* ------------------ ADD TO CART (ENHANCED) ------------------ */
const addToCart = async (req, res) => {
  let stockReserved = false;
  let reservationTransaction = null;
  
  try {
    const { userId, productId, quantity = 1 } = req.body;
    const qty = Number(quantity) || 1;

    if (!userId || !productId)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    if (qty <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be greater than 0" });

    // STEP 1: CHECK STOCK AVAILABILITY
    const stockCheck = await Product.checkStockAvailability(productId, qty);
    
    if (!stockCheck.available && !stockCheck.allowBackorders) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${stockCheck.availableStock} available.`,
        availableStock: stockCheck.availableStock,
        isLowStock: stockCheck.isLowStock,
        productId: productId
      });
    }

    // STEP 2: RESERVE STOCK (for non-backorder items with available stock)
    if (!stockCheck.allowBackorders && stockCheck.availableStock >= qty) {
      try {
        await Product.reserveStock(productId, qty);
        stockReserved = true;
        reservationTransaction = {
          productId,
          quantity: qty,
          reservedAt: new Date()
        };
        
        console.log(`✅ Stock reserved for cart: ${productId}, Qty: ${qty}`);
      } catch (reserveError) {
        console.error('❌ Stock reservation failed:', reserveError);
        return res.status(400).json({
          success: false,
          message: 'Failed to reserve stock. Please try again.',
          error: reserveError.message,
          productId: productId
        });
      }
    }

    // STEP 3: ADD TO CART
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    // Generate unique reservation ID for tracking
    const reservationId = `RES_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (index > -1) {
      // Update existing item
      cart.items[index].quantity += qty;
      cart.items[index].stockReserved = stockReserved;
      cart.items[index].reservationId = reservationId;
      cart.items[index].lastReservedAt = new Date();
    } else {
      // Add new item
      cart.items.push({
        productId, 
        quantity: qty,
        stockReserved: stockReserved,
        reservationId: reservationId,
        lastReservedAt: new Date()
      });
    }

    await cart.save();
    
    // Populate product details
    await cart.populate({
      path: "items.productId",
      select: "images image title price salePrice totalStock reservedStock availableStock lowStockThreshold allowBackorders isActive"
    });

    const cartResponse = mapCartItems(cart.items);

    return res.status(200).json({
      success: true,
      message: stockCheck.allowBackorders && stockCheck.availableStock < qty 
        ? "Item added to cart (backorder)" 
        : "Item added to cart",
      data: { 
        ...cart._doc, 
        items: cartResponse 
      },
      stockInfo: {
        availableStock: stockCheck.availableStock,
        isLowStock: stockCheck.isLowStock,
        allowBackorders: stockCheck.allowBackorders,
        isBackorder: stockCheck.allowBackorders && stockCheck.availableStock < qty,
        productId: productId,
        stockReserved: stockReserved,
        reservationId: reservationId
      }
    });
    
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    
    // STEP 4: ROLLBACK STOCK RESERVATION IF CART SAVE FAILED
    if (stockReserved && reservationTransaction) {
      try {
        console.log(`🔄 Rolling back stock reservation for ${reservationTransaction.productId}`);
        await Product.releaseStock(reservationTransaction.productId, reservationTransaction.quantity);
      } catch (rollbackError) {
        console.error('❌ Failed to rollback stock reservation:', rollbackError);
      }
    }
    
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Failed to add item to cart", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        productId: req.body.productId
      });
  }
};

/* ------------------ FETCH CART ITEMS (ENHANCED) ------------------ */
const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "images image title price salePrice totalStock reservedStock availableStock lowStockThreshold allowBackorders isActive category brand"
    });

    if (!cart)
      return res.status(200).json({
        success: true,
        data: { userId, items: [] },
      });

    // Validate and clean up cart items
    const validItems = cart.items.filter((item) => {
      if (!item.productId) return false;
      
      const product = item.productId;
      
      // Check if product is active
      if (product.isActive === false) {
        console.log(`Removing inactive product from cart: ${product._id}`);
        return false;
      }
      
      return true;
    });
    
    // If items were removed, save the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const cartResponse = mapCartItems(validItems);
    
    // Check current stock for all items
    const stockChecks = await Promise.all(
      validItems.map(async (item) => {
        try {
          const stockCheck = await Product.checkStockAvailability(
            item.productId._id.toString(),
            item.quantity
          );
          
          // If stock is no longer available and item was reserved, update cart
          if (item.stockReserved && !stockCheck.available && !stockCheck.allowBackorders) {
            console.log(`⚠️ Previously reserved item now out of stock: ${item.productId._id}`);
            item.stockReserved = false;
          }
          
          return {
            productId: item.productId._id.toString(),
            available: stockCheck.available,
            availableStock: stockCheck.availableStock,
            allowBackorders: stockCheck.allowBackorders,
            isLowStock: stockCheck.isLowStock,
            isActive: stockCheck.isActive
          };
        } catch (error) {
          return {
            productId: item.productId._id.toString(),
            available: false,
            reason: 'Stock check failed'
          };
        }
      })
    );

    // Save any updates to stockReserved status
    if (cart.isModified('items')) {
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      data: { ...cart._doc, items: cartResponse },
      stockSummary: {
        totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
        itemsWithStockIssues: stockChecks.filter(check => !check.available && !check.allowBackorders).length,
        backorderItems: stockChecks.filter(check => check.allowBackorders && check.availableStock < 1).length,
        lowStockItems: stockChecks.filter(check => check.isLowStock).length,
        reservedItems: validItems.filter(item => item.stockReserved).length
      },
      stockChecks
    });
  } catch (error) {
    console.error('❌ Fetch cart items error:', error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Failed to fetch cart items", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
  }
};

/* ------------------ UPDATE CART ITEM QUANTITY (ENHANCED) ------------------ */
const updateCartItemQty = async (req, res) => {
  let stockChanged = false;
  let reservedAmount = 0;
  let releasedAmount = 0;
  
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity === undefined)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    const newQty = Number(quantity);
    if (Number.isNaN(newQty) || newQty < 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "totalStock reservedStock availableStock allowBackorders isActive"
    });
    
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const index = cart.items.findIndex(
      (item) => item.productId._id.toString() === productId
    );

    if (index === -1)
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });

    const currentItem = cart.items[index];
    const product = currentItem.productId;
    const quantityChange = newQty - currentItem.quantity;

    // Handle quantity changes
    if (quantityChange > 0) {
      // Increasing quantity - check and reserve additional stock
      const stockCheck = await Product.checkStockAvailability(productId, quantityChange);
      
      if (!stockCheck.available && !stockCheck.allowBackorders) {
        return res.status(400).json({
          success: false,
          message: `Cannot increase quantity. Only ${stockCheck.availableStock} additional available.`,
          availableStock: stockCheck.availableStock,
          maxAllowed: currentItem.quantity + stockCheck.availableStock,
          currentQuantity: currentItem.quantity,
          productId: productId
        });
      }

      // Reserve additional stock if available (non-backorder items)
      if (!stockCheck.allowBackorders && stockCheck.availableStock >= quantityChange) {
        try {
          await Product.reserveStock(productId, quantityChange);
          stockChanged = true;
          reservedAmount = quantityChange;
          
          // Update item reservation status
          currentItem.stockReserved = true;
          currentItem.reservationId = currentItem.reservationId || `RES_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          currentItem.lastReservedAt = new Date();
          
          console.log(`✅ Additional stock reserved: ${productId}, Qty: ${quantityChange}`);
        } catch (reserveError) {
          return res.status(400).json({
            success: false,
            message: 'Failed to reserve additional stock.',
            error: reserveError.message,
            productId: productId
          });
        }
      }
    } else if (quantityChange < 0 && currentItem.stockReserved) {
      // Decreasing quantity - release excess reserved stock
      const releaseAmount = Math.abs(quantityChange);
      try {
        await Product.releaseStock(productId, releaseAmount);
        stockChanged = true;
        releasedAmount = releaseAmount;
        
        console.log(`🔄 Released excess stock: ${productId}, Qty: ${releaseAmount}`);
      } catch (releaseError) {
        console.error('❌ Failed to release stock:', releaseError);
        // Continue anyway, don't fail the update
      }
    }

    // Update or remove item
    if (newQty === 0) {
      // Remove item - release all reserved stock
      if (currentItem.stockReserved) {
        try {
          await Product.releaseStock(productId, currentItem.quantity);
          console.log(`🔄 Released all stock on removal: ${productId}, Qty: ${currentItem.quantity}`);
        } catch (releaseError) {
          console.error('❌ Failed to release stock on removal:', releaseError);
        }
      }
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = newQty;
    }

    await cart.save();
    await cart.populate({
      path: "items.productId",
      select: "images image title price salePrice totalStock reservedStock availableStock lowStockThreshold allowBackorders isActive"
    });

    const cartResponse = mapCartItems(cart.items);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: { ...cart._doc, items: cartResponse },
      stockChange: {
        reserved: reservedAmount,
        released: releasedAmount,
        productId: productId,
        newStockReserved: cart.items[index]?.stockReserved || false
      }
    });
    
  } catch (error) {
    console.error('❌ Update cart quantity error:', error);
    
    // Rollback stock changes if cart update failed
    if (stockChanged) {
      try {
        if (reservedAmount > 0) {
          await Product.releaseStock(productId, reservedAmount);
          console.log(`🔄 Rolled back reserved stock: ${productId}, Qty: ${reservedAmount}`);
        }
        // Note: We don't rollback releases - that would be incorrect
      } catch (rollbackError) {
        console.error('❌ Failed to rollback stock changes:', rollbackError);
      }
    }
    
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Failed to update cart", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        productId: req.body.productId
      });
  }
};

/* ------------------ DELETE CART ITEM (ENHANCED) ------------------ */
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId)
      return res
        .status(400)
        .json({ success: false, message: "Invalid data" });

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "images image title price salePrice totalStock reservedStock availableStock lowStockThreshold allowBackorders isActive"
    });

    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const index = cart.items.findIndex(
      (item) => item.productId?._id.toString() === productId
    );

    if (index === -1)
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });

    const itemToRemove = cart.items[index];
    
    // Release reserved stock for this item
    if (itemToRemove.stockReserved && itemToRemove.productId && !itemToRemove.productId.allowBackorders) {
      try {
        await Product.releaseStock(productId, itemToRemove.quantity);
        console.log(`🔄 Released stock on delete: ${productId}, Qty: ${itemToRemove.quantity}`);
      } catch (releaseError) {
        console.error('❌ Failed to release stock on delete:', releaseError);
        // Continue with deletion even if release fails
      }
    }

    cart.items.splice(index, 1);
    await cart.save();
    
    await cart.populate({
      path: "items.productId",
      select: "images image title price salePrice totalStock reservedStock availableStock lowStockThreshold allowBackorders isActive"
    });

    const cartResponse = mapCartItems(cart.items);

    return res.status(200).json({
      success: true,
      message: "Cart item removed",
      data: { ...cart._doc, items: cartResponse },
      stockReleased: itemToRemove.quantity,
      productId: productId,
      wasReserved: itemToRemove.stockReserved || false
    });
  } catch (error) {
    console.error('❌ Delete cart item error:', error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Failed to remove item from cart", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        productId: req.params.productId
      });
  }
};

/* ------------------ CLEAR CART (ENHANCED) ------------------ */
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "allowBackorders"
    });

    if (!cart || cart.items.length === 0)
      return res.status(200).json({
        success: true,
        message: "Cart is already empty"
      });

    // Release all reserved stock
    const releasePromises = cart.items.map(async (item) => {
      if (item.stockReserved && item.productId && !item.productId.allowBackorders) {
        try {
          await Product.releaseStock(item.productId._id.toString(), item.quantity);
          return { 
            productId: item.productId._id.toString(), 
            released: item.quantity,
            wasReserved: true 
          };
        } catch (releaseError) {
          console.error(`❌ Failed to release stock for product ${item.productId._id}:`, releaseError);
          return { 
            productId: item.productId._id.toString(), 
            released: 0, 
            error: releaseError.message,
            wasReserved: true 
          };
        }
      }
      return { 
        productId: item.productId?._id.toString(), 
        released: 0,
        wasReserved: item.stockReserved || false 
      };
    });

    const releaseResults = await Promise.all(releasePromises);
    const totalReleased = releaseResults.reduce((sum, result) => sum + (result?.released || 0), 0);

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { userId, items: [] },
      stockReleased: {
        total: totalReleased,
        reservedItemsCleared: releaseResults.filter(r => r?.wasReserved).length,
        details: releaseResults.filter(r => r !== null)
      }
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Failed to clear cart", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
  }
};

module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
  clearCart
};