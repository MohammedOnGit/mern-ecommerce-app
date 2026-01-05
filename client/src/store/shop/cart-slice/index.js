

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  cartCount: 0,
  subtotal: 0,
  lastUpdated: null
};

export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (userId, { rejectWithValue }) => {
    try {
      // Get token from localStorage for backup
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_BASE_URL}/shop/cart/get/${userId}`,
        { 
          withCredentials: true,
          timeout: 10000,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || "Failed to fetch cart");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Auth error - don't clear cart, just return empty
        return { items: [], cartCount: 0, subtotal: 0 };
      }
      if (error.response?.status === 429) {
        return rejectWithValue("Rate limited. Please try again in a moment.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, productId, quantity = 1 }, { rejectWithValue, getState }) => {
    try {
      // Get token from localStorage for auth persistence
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/shop/cart/add`,
        { userId, productId, quantity },
        { 
          withCredentials: true,
          timeout: 8000,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Auth error - don't reject, use optimistic update
        const state = getState();
        const product = state.shopProducts?.products?.find(p => p._id === productId) || {};
        
        // Return optimistic data
        return {
          items: [...state.cart.items, {
            productId: productId,
            image: product.image || '',
            title: product.title || 'Product',
            price: product.price || 0,
            salePrice: product.salePrice,
            quantity: quantity,
            _id: `temp-${Date.now()}`
          }],
          cartCount: state.cart.cartCount + quantity,
          subtotal: state.cart.subtotal + (product.salePrice || product.price || 0) * quantity
        };
      }
      if (error.response?.status === 429) {
        return rejectWithValue("Rate limited. Please try again in a moment.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_BASE_URL}/shop/cart/update`,
        { userId, productId, quantity },
        { 
          withCredentials: true,
          timeout: 8000,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || "Failed to update cart");
      }
    } catch (error) {
      if (error.response?.status === 429) {
        return rejectWithValue("Rate limited. Please try again in a moment.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to update cart");
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  'cart/deleteItem',
  async ({ userId, productId }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${API_BASE_URL}/shop/cart/${userId}/${productId}`,
        { 
          withCredentials: true,
          timeout: 8000,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (response.data.success) {
        return { productId, ...response.data.data };
      } else {
        return rejectWithValue(response.data.message || "Failed to delete item");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Auth error - still remove item optimistically
        const state = getState();
        const item = state.cart.items.find(i => i.productId === productId);
        
        if (item) {
          return {
            productId,
            items: state.cart.items.filter(i => i.productId !== productId),
            cartCount: state.cart.cartCount - item.quantity,
            subtotal: state.cart.subtotal - (item.salePrice || item.price || 0) * item.quantity
          };
        }
      }
      if (error.response?.status === 429) {
        return rejectWithValue("Rate limited. Please try again in a moment.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to delete item");
    }
  }
);

export const updateCartFromWishlistMove = createAsyncThunk(
  'cart/updateFromWishlistMove',
  async (cartData, { rejectWithValue }) => {
    try {
      return cartData;
    } catch (error) {
      return rejectWithValue("Failed to update cart from wishlist move");
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      // Only clear cart data, preserve other state
      state.items = [];
      state.cartCount = 0;
      state.subtotal = 0;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
      // ⚠️ Auth data remains in localStorage and auth slice
    },
    updateCartCount: (state, action) => {
      state.cartCount = action.payload;
    },
    updateCartSubtotal: (state, action) => {
      state.subtotal = action.payload;
    },
    addOptimisticCartItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const exists = state.items.find(item => item.productId === product._id);
      
      if (exists) {
        exists.quantity += quantity;
      } else {
        state.items.push({
          productId: product._id,
          image: product.image,
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          quantity: quantity,
          _id: `optimistic-${Date.now()}`
        });
      }
      
      state.cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.subtotal = state.items.reduce((sum, item) => {
        const price = item.salePrice || item.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      state.lastUpdated = new Date().toISOString();
    },
    removeOptimisticCartItem: (state, action) => {
      const { productId } = action.payload;
      state.items = state.items.filter(item => item.productId !== productId);
      state.cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.subtotal = state.items.reduce((sum, item) => {
        const price = item.salePrice || item.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      state.lastUpdated = new Date().toISOString();
    },
    clearCartError: (state) => {
      state.error = null;
    },
    syncCartItems: (state, action) => {
      const { items, cartCount, subtotal } = action.payload;
      state.items = items || [];
      state.cartCount = cartCount || state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.subtotal = subtotal || state.items.reduce((sum, item) => {
        const price = item.salePrice || item.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    addCartItemDirectly: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.productId === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          productId: product._id,
          image: product.image || product.images?.[0],
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          quantity: quantity,
          addedAt: new Date().toISOString()
        });
      }
      
      state.cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.subtotal = state.items.reduce((sum, item) => {
        const price = item.salePrice || item.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      state.lastUpdated = new Date().toISOString();
    },
    restoreCartFromStorage: (state) => {
      // Try to restore cart from localStorage if auth is valid
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (token && user.id) {
          const savedCart = localStorage.getItem('cart_backup');
          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            state.items = parsed.items || [];
            state.cartCount = parsed.cartCount || 0;
            state.subtotal = parsed.subtotal || 0;
            state.lastUpdated = parsed.lastUpdated || new Date().toISOString();
            console.log('🛒 Cart restored from localStorage backup');
          }
        }
      } catch (error) {
        console.warn('Failed to restore cart from storage:', error);
      }
    },
    saveCartToStorage: (state) => {
      // Save cart to localStorage as backup
      try {
        const cartBackup = {
          items: state.items,
          cartCount: state.cartCount,
          subtotal: state.subtotal,
          lastUpdated: state.lastUpdated
        };
        localStorage.setItem('cart_backup', JSON.stringify(cartBackup));
      } catch (error) {
        console.warn('Failed to save cart to storage:', error);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.subtotal = state.items.reduce((sum, item) => {
          const price = item.salePrice || item.price || 0;
          return sum + (price * item.quantity);
        }, 0);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        
        // Save cart to localStorage after successful fetch
        try {
          const cartBackup = {
            items: state.items,
            cartCount: state.cartCount,
            subtotal: state.subtotal,
            lastUpdated: state.lastUpdated
          };
          localStorage.setItem('cart_backup', JSON.stringify(cartBackup));
        } catch (error) {
          console.warn('Failed to save cart backup:', error);
        }
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        // Don't clear cart on auth errors
        if (action.payload?.includes('401') || action.payload?.includes('auth')) {
          state.error = "Please log in to view your cart";
        } else {
          state.error = action.payload;
        }
      })
      
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || state.items;
        state.cartCount = action.payload.cartCount || state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.subtotal = action.payload.subtotal || state.items.reduce((sum, item) => {
          const price = item.salePrice || item.price || 0;
          return sum + (price * item.quantity);
        }, 0);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.subtotal = state.items.reduce((sum, item) => {
          const price = item.salePrice || item.price || 0;
          return sum + (price * item.quantity);
        }, 0);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both optimistic and actual responses
        if (action.payload.items) {
          state.items = action.payload.items;
          state.cartCount = action.payload.cartCount || 0;
          state.subtotal = action.payload.subtotal || 0;
        } else {
          state.items = state.items.filter(item => item.productId !== action.payload.productId);
          state.cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.subtotal = state.items.reduce((sum, item) => {
            const price = item.salePrice || item.price || 0;
            return sum + (price * item.quantity);
          }, 0);
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCartFromWishlistMove.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartFromWishlistMove.fulfilled, (state, action) => {
        state.isLoading = false;
        const { cartItems, cartSummary } = action.payload;
        
        if (cartItems) {
          state.items = cartItems;
        }
        
        if (cartSummary) {
          state.cartCount = cartSummary.totalItems || state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.subtotal = cartSummary.subtotal || state.items.reduce((sum, item) => {
            const price = item.salePrice || item.price || 0;
            return sum + (price * item.quantity);
          }, 0);
        } else {
          state.cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.subtotal = state.items.reduce((sum, item) => {
            const price = item.salePrice || item.price || 0;
            return sum + (price * item.quantity);
          }, 0);
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateCartFromWishlistMove.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Handle clearAllUserData action - ONLY clear cart data, not entire state
      .addCase('clear/clearAllUserData', (state) => {
        // Only reset cart-specific properties
        state.items = [];
        state.cartCount = 0;
        state.subtotal = 0;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
        // Keep isLoading state to prevent UI flickering
        // ⚠️ Auth data remains untouched
      })
      
      // Add auth status change listeners
      .addCase('auth/checkAuthStatus/fulfilled', (state, action) => {
        // When auth is restored, optionally restore cart
        if (action.payload.user?.id) {
          // Cart will be fetched automatically by components
          console.log('🛒 Auth restored, cart can be fetched');
        }
      })
      .addCase('auth/logoutUser/fulfilled', (state) => {
        // Only clear cart on explicit logout
        state.items = [];
        state.cartCount = 0;
        state.subtotal = 0;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      });
  }
});

export const { 
  clearCart, 
  updateCartCount, 
  updateCartSubtotal, 
  addOptimisticCartItem,
  removeOptimisticCartItem,
  clearCartError,
  syncCartItems,
  addCartItemDirectly,
  restoreCartFromStorage,  // NEW
  saveCartToStorage        // NEW
} = cartSlice.actions;

export default cartSlice.reducer;