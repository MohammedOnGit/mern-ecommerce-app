const express = require("express");
const router = express.Router();
const Wishlist = require("../../models/WishList");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart"); 
// Import from your existing auth controller
const { authMiddleware } = require("../../controllers/auth/auth-controller");


router.get("/", authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: "items.product",
        select: "title description price salePrice image category brand totalStock createdAt"
      })
      .lean();

    if (!wishlist) {
      return res.json({
        success: true,
        data: {
          items: [],
          count: 0
        }
      });
    }

    // Filter out products that might have been deleted
    const validItems = wishlist.items.filter(item => item.product !== null);

    res.json({
      success: true,
      data: {
        items: validItems,
        count: validItems.length
      }
    });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching wishlist"
    });
  }
});

// @route   POST /api/shop/wishlist/add
// @desc    Add item to wishlist
// @access  Private
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        user: req.user.id,
        items: [{ product: productId }]
      });
    } else {
      // Check if product already in wishlist
      const existingItem = wishlist.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist"
        });
      }

      // Add to wishlist
      wishlist.items.unshift({ product: productId });
    }

    await wishlist.save();

    // Populate the added item
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: "items.product",
        match: { _id: productId },
        select: "title description price salePrice image category brand totalStock"
      })
      .lean();

    const addedItem = populatedWishlist.items.find(
      item => item.product && item.product._id.toString() === productId
    );

    res.json({
      success: true,
      data: addedItem,
      message: "Product added to wishlist"
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error adding to wishlist"
    });
  }
});

// @route   DELETE /api/shop/wishlist/remove/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    if (wishlist.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist"
      });
    }

    await wishlist.save();

    res.json({
      success: true,
      data: {
        productId,
        count: wishlist.items.length
      },
      message: "Product removed from wishlist"
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing from wishlist"
    });
  }
});

// @route   POST /api/shop/wishlist/move-selected-to-cart
// @desc    Move multiple items from wishlist to cart
// @access  Private
router.post("/move-selected-to-cart", authMiddleware, async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs array is required"
      });
    }

    // 1. Get user's wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }

    // 2. Get user's cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: []
      });
    }

    const movedItems = [];
    const failedItems = [];
    const inStockItems = [];

    // 3. Process each product
    for (const productId of productIds) {
      try {
        // Check if product exists and is in stock
        const product = await Product.findById(productId);
        if (!product) {
          failedItems.push({ productId, reason: "Product not found" });
          continue;
        }

        if (product.totalStock <= 0) {
          failedItems.push({ productId, reason: "Out of stock" });
          continue;
        }

        // Check if product is in wishlist
        const wishlistItemIndex = wishlist.items.findIndex(
          item => item.product.toString() === productId
        );

        if (wishlistItemIndex === -1) {
          failedItems.push({ productId, reason: "Not in wishlist" });
          continue;
        }

        // Add to cart
        const cartItemIndex = cart.items.findIndex(
          item => item.productId && item.productId.toString() === productId
        );

        if (cartItemIndex > -1) {
          // Update quantity if already in cart
          cart.items[cartItemIndex].quantity += 1;
        } else {
          // Add new item to cart
          cart.items.push({
            productId,
            quantity: 1
          });
        }

        // Remove from wishlist
        wishlist.items.splice(wishlistItemIndex, 1);
        
        movedItems.push(productId);
        inStockItems.push(productId);

      } catch (error) {
        console.error(`Error processing product ${productId}:`, error);
        failedItems.push({ productId, reason: "Processing error" });
      }
    }

    // 4. Save both cart and wishlist if there were any successful moves
    if (movedItems.length > 0) {
      await Promise.all([
        cart.save(),
        wishlist.save()
      ]);
    }

    // 5. Populate cart items for response
    await cart.populate({
      path: "items.productId",
      select: "title price salePrice image"
    });

    // Map cart items for consistent response
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
        };
      });

    res.json({
      success: true,
      message: movedItems.length > 0 
        ? `Successfully moved ${movedItems.length} items to cart` 
        : "No items were moved to cart",
      data: {
        movedItems,
        failedItems,
        inStockItems,
        cartItems: mapCartItems(cart.items),
        wishlistCount: wishlist.items.length
      }
    });

  } catch (error) {
    console.error("Move selected to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error moving items to cart"
    });
  }
});

// @route   POST /api/shop/wishlist/check
// @desc    Check if products are in wishlist
// @access  Private
router.post("/check", authMiddleware, async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: "Product IDs must be an array"
      });
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id }).lean();

    if (!wishlist) {
      return res.json({
        success: true,
        data: {
          inWishlist: [],
          count: 0
        }
      });
    }

    const inWishlist = productIds.filter(productId =>
      wishlist.items.some(item => item.product.toString() === productId)
    );

    res.json({
      success: true,
      data: {
        inWishlist,
        count: wishlist.items.length
      }
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking wishlist"
    });
  }
});


router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: "Wishlist cleared successfully"
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error clearing wishlist"
    });
  }
});



module.exports = router;