import { configureStore } from "@reduxjs/toolkit";

// Auth
import authReducer from "./auth-slice";

// Admin
import adminProductsReducer from "./admin/product-slice";
import adminOrderReducer from "./admin/order-slice";

// Shop
import shopProductsReducer from "./shop/products-slice";
import shopCartReducer from "./shop/cart-slice";
import shopAddressReducer from "./shop/address-slice";
import searchReducer from "./shop/search-slice";
import wishlistReducer from "./shop/wishlist-slice";
import shopOrderReducer from "./shop/order-slice";

// Clear reducer
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