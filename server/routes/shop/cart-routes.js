const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

/**
 * ADD ITEM TO CART
 * Body: { userId, productId, quantity }
 */
router.post("/add", addToCart);

/**
 * FETCH USER CART ITEMS
 * Params: userId
 */
router.get("/get/:userId", fetchCartItems);

/**
 * UPDATE CART ITEM QUANTITY
 * Body: { userId, productId, quantity }
 */
router.put("/update", updateCartItemQty);

/**
 * DELETE A CART ITEM
 * Params: userId, productId
 */
router.delete("/:userId/:productId", deleteCartItem);

module.exports = router;
