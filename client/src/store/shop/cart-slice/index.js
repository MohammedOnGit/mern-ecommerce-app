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

// Helper function to check stock before adding to cart
const checkProductStock = async (productId, requestedQuantity) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/shop/products/get/${productId}`
    );
    
    const product = response.data?.data || response.data;
    
    if (!product) {
      return { available: false, reason: "Product not found" };
    }
    
    // Check if product is active
    if (product.isActive === false) {
      return { available: false, reason: "Product is not available" };
    }
    
    // Check available stock (not total stock)
    const availableStock = product.availableStock || 
                          Math.max(0, (product.totalStock || 0) - (product.reservedStock || 0));
    
    // Check if allowBackorders is enabled
    if (product.allowBackorders) {
      return { 
        available: true, 
        availableStock,
        totalStock: product.totalStock || 0,
        reservedStock: product.reservedStock || 0,
        allowBackorders: true,
        product
      };
    }
    
    // INVENTORY CHECK: Can't add more than available stock
    if (availableStock < requestedQuantity) {
      return { 
        available: false, 
        reason: `Only ${availableStock} item(s) available in stock`,
        availableStock,
        totalStock: product.totalStock || 0
      };
    }
    
    return { 
      available: true, 
      availableStock,
      totalStock: product.totalStock || 0,
      reservedStock: product.reservedStock || 0,
      allowBackorders: product.allowBackorders || false,
      product
    };
    
  } catch (error) {
    console.error("Stock check error:", error);
    return { 
      available: false, 
      reason: "Failed to check stock availability" 
    };
  }
};

export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (userId, { rejectWithValue }) => {
    try {
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
        // Validate stock for each item in cart
        const validatedItems = [];
        for (const item of response.data.data?.items || []) {
          if (item.productId) {
            const stockCheck = await checkProductStock(item.productId, item.quantity);
            if (stockCheck.available) {
              validatedItems.push(item);
            } else {
              console.warn(`Item ${item.productId} removed from cart: ${stockCheck.reason}`);
            }
          }
        }
        
        return {
          ...response.data.data,
          items: validatedItems
        };
      } else {
        return rejectWithValue(response.data.message || "Failed to fetch cart");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        return { items: [], cartCount: 0, subtotal: 0 };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, productId, quantity = 1 }, { rejectWithValue, getState }) => {
    try {
      // STEP 1: CHECK STOCK BEFORE ADDING
      const stockCheck = await checkProductStock(productId, quantity);
      
      if (!stockCheck.available) {
        return rejectWithValue({
          message: stockCheck.reason,
          availableStock: stockCheck.availableStock,
          productId
        });
      }
      
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
        // If backend fails, check if it's a stock issue
        if (response.data.message?.includes('stock') || response.data.message?.includes('Stock')) {
          return rejectWithValue({
            message: response.data.message,
            productId
          });
        }
        return rejectWithValue(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Auth error - still check stock for optimistic update
        const state = getState();
        const product = state.shopProducts?.products?.find(p => p._id === productId) || {};
        
        // Check if we can add optimistically
        const availableStock = product.availableStock || product.totalStock || 0;
        const currentCartQty = state.cart.items.find(i => i.productId === productId)?.quantity || 0;
        
        if (availableStock < (currentCartQty + quantity)) {
          return rejectWithValue({
            message: `Only ${availableStock} item(s) available`,
            availableStock,
            productId
          });
        }
        
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
      
      if (error.response?.data?.message?.includes('stock')) {
        return rejectWithValue({
          message: error.response.data.message,
          productId
        });
      }
      
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ userId, productId, quantity }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Direct API call - let backend handle stock validation
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
        // IMPROVED ERROR HANDLING: Better parsing of backend errors
        const errorData = response.data;
        
        if (errorData.message?.includes('stock') || 
            errorData.message?.includes('Stock') ||
            errorData.message?.includes('available') ||
            errorData.message?.includes('Available')) {
          
          return rejectWithValue({
            message: errorData.message,
            availableStock: errorData.availableStock,
            maxAllowed: errorData.maxAllowed,
            currentQuantity: errorData.currentQuantity,
            productId,
            type: 'stock_error'
          });
        }
        
        return rejectWithValue({
          message: errorData.message || "Failed to update cart",
          productId,
          type: 'general_error'
        });
      }
    } catch (error) {
      // IMPROVED NETWORK ERROR HANDLING
      console.error('Update cart quantity network error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        return rejectWithValue({
          message: errorData.message || "Failed to update cart",
          availableStock: errorData.availableStock,
          maxAllowed: errorData.maxAllowed,
          productId,
          type: 'stock_error'
        });
      }
      
      return rejectWithValue({
        message: error.message || "Network error. Please check your connection.",
        productId,
        type: 'network_error'
      });
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
      return rejectWithValue(error.response?.data?.message || "Failed to delete item");
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.cartCount = 0;
      state.subtotal = 0;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    updateCartCount: (state, action) => {
      state.cartCount = action.payload;
    },
    updateCartSubtotal: (state, action) => {
      state.subtotal = action.payload;
    },
    clearCartError: (state) => {
      state.error = null;
    },
    // New action to handle stock validation errors
    setCartStockError: (state, action) => {
      state.error = action.payload;
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
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
      });
  }
});

export const { 
  clearCart, 
  updateCartCount, 
  updateCartSubtotal,
  clearCartError,
  setCartStockError
} = cartSlice.actions;

export default cartSlice.reducer;