// const Cart = require("../../models/Cart");
// const Product = require("../../models/Product");

// /* Helper: map cart items */
// const mapCartItems = (items = []) =>
//   items.map((item) => {
//     const p = item.productId || {};
//     const image = p.image || (Array.isArray(p.images) ? p.images[0] : null);

//     return {
//       productId: p._id || null,
//       image,
//       title: p.title || "Product not found",
//       price: p.price ?? null,
//       salePrice: p.salePrice ?? null,
//       quantity: item.quantity,
//     };
//   });

// /* ------------------ ADD TO CART ------------------ */
// const addToCart = async (req, res) => {
//   try {
//     const { userId, productId, quantity = 1 } = req.body;
//     const qty = Number(quantity) || 1;

//     if (!userId || !productId)
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields required" });

//     const product = await Product.findById(productId);
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     let cart = await Cart.findOne({ userId });
//     if (!cart) cart = new Cart({ userId, items: [] });

//     const index = cart.items.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (index > -1) cart.items[index].quantity += qty;
//     else cart.items.push({ productId, quantity: qty });

//     await cart.save();
//     await cart.populate({
//       path: "items.productId",
//       select: "images image title price salePrice",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Cart updated",
//       data: { ...cart._doc, items: mapCartItems(cart.items) },
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// /* ------------------ FETCH CART ITEMS ------------------ */
// const fetchCartItems = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId)
//       return res
//         .status(400)
//         .json({ success: false, message: "User ID required" });

//     const cart = await Cart.findOne({ userId }).populate({
//       path: "items.productId",
//       select: "images image title price salePrice",
//     });

//     if (!cart)
//       return res.status(200).json({
//         success: true,
//         data: { userId, items: [] },
//       });

//     const validItems = cart.items.filter((item) => item.productId);
//     if (validItems.length < cart.items.length) {
//       cart.items = validItems;
//       await cart.save();
//     }

//     return res.status(200).json({
//       success: true,
//       data: { ...cart._doc, items: mapCartItems(cart.items) },
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// /* ------------------ UPDATE CART ITEM QUANTITY ------------------ */
// const updateCartItemQty = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;

//     if (!userId || !productId || quantity === undefined)
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields required" });

//     const qty = Number(quantity);
//     if (Number.isNaN(qty) || qty < 0)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid quantity" });

//     const cart = await Cart.findOne({ userId });
//     if (!cart)
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart not found" });

//     const index = cart.items.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (index === -1)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not in cart" });

//     if (qty === 0) cart.items.splice(index, 1);
//     else cart.items[index].quantity = qty;

//     await cart.save();
//     await cart.populate({
//       path: "items.productId",
//       select: "images image title price salePrice",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Cart updated",
//       data: { ...cart._doc, items: mapCartItems(cart.items) },
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// /* ------------------ DELETE CART ITEM ------------------ */
// const deleteCartItem = async (req, res) => {
//   try {
//     const { userId, productId } = req.params;

//     if (!userId || !productId)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid data" });

//     const cart = await Cart.findOne({ userId }).populate({
//       path: "items.productId",
//       select: "images image title price salePrice",
//     });

//     if (!cart)
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart not found" });

//     const beforeCount = cart.items.length;

//     cart.items = cart.items.filter(
//       (item) => item.productId?._id.toString() !== productId
//     );

//     if (cart.items.length === beforeCount)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not in cart" });

//     await cart.save();
//     await cart.populate({
//       path: "items.productId",
//       select: "images image title price salePrice",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Cart item removed",
//       data: { ...cart._doc, items: mapCartItems(cart.items) },
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// module.exports = {
//   addToCart,
//   fetchCartItems,
//   updateCartItemQty,
//   deleteCartItem,
// };


const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

/* Helper: map cart items */
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
      totalStock: p.totalStock || 0,
      reservedStock: p.reservedStock || 0,
      availableStock: p.availableStock || 0,
      isLowStock: (p.totalStock || 0) - (p.reservedStock || 0) <= (p.lowStockThreshold || 5),
      isOutOfStock: (p.totalStock || 0) <= 0,
      allowBackorders: p.allowBackorders || false,
      isActive: p.isActive !== false
    };
  });

/* ------------------ ADD TO CART ------------------ */
const addToCart = async (req, res) => {
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

    // Check stock availability
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

    // For backorder items, we still allow adding to cart but with a warning
    if (stockCheck.allowBackorders && stockCheck.availableStock < qty) {
      console.log(`⚠️ Backorder item added to cart: ${productId}, Requested: ${qty}, Available: ${stockCheck.availableStock}`);
    }

    // Reserve stock if available (for non-backorder items with stock)
    if (!stockCheck.allowBackorders && stockCheck.availableStock >= qty) {
      try {
        await Product.reserveStock(productId, qty);
      } catch (reserveError) {
        console.error('Stock reservation failed:', reserveError);
        return res.status(400).json({
          success: false,
          message: 'Failed to reserve stock. Please try again.',
          error: reserveError.message,
          productId: productId
        });
      }
    }

    // Add to cart
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index > -1) {
      cart.items[index].quantity += qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();
    await cart.populate({
      path: "items.productId",
      select: "images image title price salePrice totalStock reservedStock availableStock lowStockThreshold allowBackorders isActive"
    });

    const cartResponse = mapCartItems(cart.items);
    const addedItem = cartResponse.find(item => item.productId === productId);

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
        productId: productId
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    
    // If we reserved stock but failed to add to cart, release it
    if (error.message.includes('reserve')) {
      try {
        const { productId, quantity = 1 } = req.body;
        await Product.releaseStock(productId, Number(quantity) || 1);
      } catch (releaseError) {
        console.error('Failed to release stock after cart error:', releaseError);
      }
    }
    
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Server Error", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        productId: req.body.productId
      });
  }
};

/* ------------------ FETCH CART ITEMS ------------------ */
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
      const availableStock = product.totalStock - product.reservedStock;
      const maxAllowed = product.allowBackorders ? item.quantity : Math.min(item.quantity, availableStock);
      
      // Update quantity if it exceeds available stock (for non-backorder items)
      if (!product.allowBackorders && item.quantity > availableStock) {
        item.quantity = Math.max(0, availableStock);
      }
      
      return product.isActive !== false && item.quantity > 0;
    });
    
    // If items were cleaned up, save the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const cartResponse = mapCartItems(validItems);
    
    // Check stock for all items
    const stockChecks = await Promise.all(
      validItems.map(async (item) => {
        try {
          const stockCheck = await Product.checkStockAvailability(
            item.productId._id.toString(),
            item.quantity
          );
          return {
            productId: item.productId._id.toString(),
            ...stockCheck
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

    return res.status(200).json({
      success: true,
      data: { ...cart._doc, items: cartResponse },
      stockSummary: {
        totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
        itemsWithStockIssues: stockChecks.filter(check => !check.available && !check.allowBackorders).length,
        backorderItems: stockChecks.filter(check => check.allowBackorders && check.availableStock < check.requestedQuantity).length,
        lowStockItems: stockChecks.filter(check => check.isLowStock).length
      },
      stockChecks
    });
  } catch (error) {
    console.error('Fetch cart items error:', error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Server Error", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
  }
};

/* ------------------ UPDATE CART ITEM QUANTITY ------------------ */
const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity === undefined)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 0)
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
    const quantityChange = qty - currentItem.quantity;

    // Check stock if increasing quantity
    if (quantityChange > 0) {
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

      // Reserve additional stock if available
      if (!stockCheck.allowBackorders && stockCheck.availableStock >= quantityChange) {
        try {
          await Product.reserveStock(productId, quantityChange);
        } catch (reserveError) {
          return res.status(400).json({
            success: false,
            message: 'Failed to reserve additional stock.',
            error: reserveError.message,
            productId: productId
          });
        }
      }
    }
    
    // Release stock if decreasing quantity
    if (quantityChange < 0 && !product.allowBackorders) {
      const releaseAmount = Math.abs(quantityChange);
      try {
        await Product.releaseStock(productId, releaseAmount);
      } catch (releaseError) {
        console.error('Failed to release stock:', releaseError);
        // Continue anyway, don't fail the update
      }
    }

    if (qty === 0) {
      // Release all reserved stock for this item
      if (!product.allowBackorders) {
        try {
          await Product.releaseStock(productId, currentItem.quantity);
        } catch (releaseError) {
          console.error('Failed to release stock on removal:', releaseError);
        }
      }
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = qty;
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
        reserved: quantityChange > 0 ? quantityChange : 0,
        released: quantityChange < 0 ? Math.abs(quantityChange) : 0,
        productId: productId
      }
    });
  } catch (error) {
    console.error('Update cart quantity error:', error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Server Error", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        productId: req.body.productId
      });
  }
};

/* ------------------ DELETE CART ITEM ------------------ */
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
    if (itemToRemove.productId && !itemToRemove.productId.allowBackorders) {
      try {
        await Product.releaseStock(productId, itemToRemove.quantity);
      } catch (releaseError) {
        console.error('Failed to release stock on delete:', releaseError);
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
      productId: productId
    });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Server Error", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        productId: req.params.productId
      });
  }
};

/* ------------------ CLEAR CART ------------------ */
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
      if (item.productId && !item.productId.allowBackorders) {
        try {
          await Product.releaseStock(item.productId._id.toString(), item.quantity);
          return { productId: item.productId._id.toString(), released: item.quantity };
        } catch (releaseError) {
          console.error(`Failed to release stock for product ${item.productId._id}:`, releaseError);
          return { productId: item.productId._id.toString(), released: 0, error: releaseError.message };
        }
      }
      return null;
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
        details: releaseResults.filter(r => r !== null)
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Server Error", 
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
