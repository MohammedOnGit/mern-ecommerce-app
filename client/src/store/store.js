import { configureStore } from "@reduxjs/toolkit";

// Auth
import authReducer from "./auth-slice";

// Admin
import adminProductsReducer from "./admin/product-slice";

// Shop
import shopProductsReducer from "./shop/products-slice";
import shopCartReducer from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import searchReducer from "./shop/search-slice";
import wishlistReducer from "./shop/wishlist-slice";
import shopOrderReducer from "./shop/order-slice"; // FIXED: Changed from shoppingOrderSlice

// Clear reducer
import clearReducer from "./clear-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsReducer,
    shopProducts: shopProductsReducer,
    shopCart: shopCartReducer,
    shopAddress: shopAddressSlice,
    search: searchReducer,
    wishlist: wishlistReducer,
    shopOrder: shopOrderReducer, // FIXED: Changed key name
    clear: clearReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['shopOrder/createNewOrder/fulfilled'],
        ignoredPaths: ['shopOrder.approvalURL'],
      },
    }),
});

export default store;