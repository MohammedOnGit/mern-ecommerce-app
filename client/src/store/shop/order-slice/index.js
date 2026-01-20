import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  error: null,
  orderDetails: null,
  orders: [],
  orderCount: 0
};

export const createNewOrder = createAsyncThunk(
  "shopOrder/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      console.log("🛒 Redux: Creating order with data:", {
        userId: orderData.userId,
        totalAmount: orderData.totalAmount,
        itemsCount: orderData.cartItems?.length,
        email: orderData.customerEmail
      });
      
      const token = localStorage.getItem("token") || "";
      
      const config = {
        withCredentials: true,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json"
        }
      };
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/shop/orders/create`,
        orderData,
        config
      );
      
      console.log("🛒 Redux: Order creation response:", response.data);
      
      if (response.data?.success) {
        return response.data;
      } else {
        const errorMsg = response.data?.message || "Failed to create order";
        console.error("🛒 Server returned non-success:", response.data);
        return rejectWithValue(errorMsg);
      }
    } catch (error) {
      console.error("🛒 Redux: Order creation error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      let errorMessage = "Failed to create order";
      
      if (error.response) {
        const serverError = error.response.data;
        const status = error.response.status;
        
        console.error("🛒 Server error response:", serverError);
        
        if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (serverError?.errors && Array.isArray(serverError.errors)) {
          errorMessage = serverError.errors.join(", ");
        } else if (status === 400) {
          if (serverError?.calculatedTotal && serverError?.providedTotal) {
            errorMessage = `Order total mismatch. Calculated: GHC ${serverError.calculatedTotal}, Provided: GHC ${serverError.providedTotal}`;
          } else {
            errorMessage = "Validation error. Please check your order details.";
          }
        } else if (status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (status === 403) {
          errorMessage = "Access denied. You don't have permission.";
        } else if (status === 404) {
          errorMessage = "Order endpoint not found.";
        } else if (status === 409) {
          errorMessage = "Duplicate order detected.";
        } else if (status === 429) {
          errorMessage = "Too many requests. Please wait a moment.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = `Error ${status}: ${serverError?.error || "Unknown server error"}`;
        }
      } else if (error.request) {
        console.error("🛒 No response received:", error.request);
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error("🛒 Final error message to user:", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "shopOrder/getAllOrdersByUserId", // CHANGED: Different name from createNewOrder
  async (userId, { rejectWithValue }) => {
    try {
      console.log("🛒 Redux: Fetching orders for user ID:", userId);
      
      // Validate userId is a string
      if (!userId || typeof userId !== 'string') {
        console.error("Invalid user ID:", userId);
        return rejectWithValue("Invalid user ID format");
      }
      
      const token = localStorage.getItem("token") || "";
      
      const config = {
        withCredentials: true,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json"
        }
      };
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log("🛒 Making request to:", `${API_BASE_URL}/shop/orders/list/${userId}`);
      
      const response = await axios.get(
        `${API_BASE_URL}/shop/orders/list/${userId}`,
        config
      );
      
      console.log("🛒 Redux: Orders response:", response.data);
      
      if (response.data?.success) {
        return response.data;
      } else {
        const errorMsg = response.data?.message || "Failed to fetch orders";
        console.error("🛒 Server returned non-success:", response.data);
        return rejectWithValue(errorMsg);
      }
    } catch (error) {
      console.error("🛒 Redux: Fetch orders error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = "Failed to fetch orders";
      
      if (error.response) {
        const serverError = error.response.data;
        const status = error.response.status;
        
        if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (status === 404) {
          errorMessage = "No orders found for this user";
        } else if (status === 401) {
          errorMessage = "Please log in to view your orders";
        } else if (status === 403) {
          errorMessage = "Access denied";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  "shopOrder/getOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      console.log("🛒 Redux: Getting order details for:", orderId);
      
      const token = localStorage.getItem("token") || "";
      
      const config = {
        withCredentials: true,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json"
        }
      };
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/shop/orders/details/${orderId}`,
        config
      );
      
      console.log("🛒 Redux: Order details response:", response.data);
      
      if (response.data?.success) {
        return response.data;
      } else {
        const errorMsg = response.data?.message || "Failed to get order details";
        console.error("🛒 Server returned non-success:", response.data);
        return rejectWithValue(errorMsg);
      }
    } catch (error) {
      console.error("🛒 Redux: Get order details error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = "Failed to get order details";
      
      if (error.response) {
        const serverError = error.response.data;
        const status = error.response.status;
        
        if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (status === 404) {
          errorMessage = "Order not found";
        } else if (status === 401) {
          errorMessage = "Please log in to view order details";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const shoppingOrderSlice = createSlice({
  name: "shopOrder",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderState: (state) => {
      state.approvalURL = null;
      state.orderId = null;
      state.error = null;
      state.isLoading = false;
      state.orderDetails = null;
      state.orders = [];
      state.orderCount = 0;
    },
    setLastOrderData: (state, action) => {
      state.orderDetails = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.orderCount = 0;
      state.orderDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = action.payload.data?.payment?.authorization_url || action.payload.authorization_url;
        state.orderId = action.payload.orderId || action.payload.data?.orderId;
        state.error = null;
        state.orderDetails = action.payload;
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
        state.error = action.payload || "Failed to create order";
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload;
        state.orders = action.payload.orders || [];
        state.orderCount = action.payload.count || 0;
        state.error = null;
      })
      .addCase(getAllOrdersByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.orders = [];
        state.orderCount = 0;
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload;
        state.error = null;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, resetOrderState, setLastOrderData, clearOrders } = shoppingOrderSlice.actions;
export default shoppingOrderSlice.reducer;