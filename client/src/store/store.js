import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsReducer from "./admin/product-slice";
import adminOrderReducer from "./admin/order-slice";
import shopProductsReducer from "./shop/products-slice";
import shopCartReducer from "./shop/cart-slice";
import shopAddressReducer from "./shop/address-slice";
import searchReducer from "./shop/search-slice";
import wishlistReducer from "./shop/wishlist-slice";
import shopOrderReducer from "./shop/order-slice";
import shopReviewReducer from "./shop/review-slice"; // ✅ ADDED
import clearReducer from "./clear-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsReducer,
    adminOrder: adminOrderReducer,
    shopProducts: shopProductsReducer,
    shopCart: shopCartReducer,
    shopAddress: shopAddressReducer,
    search: searchReducer,
    wishlist: wishlistReducer,
    shopOrder: shopOrderReducer,
    shopReviews: shopReviewReducer, // ✅ ADDED
    clear: clearReducer,
  },
});

export default store;