// store/shop/order-slice.js 
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
  approvalURL: null,
  isloading: false,
  orderId: null,
  error: null,
  lastOrderData: null
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
      
      // Always get token from localStorage for consistency
      const token = localStorage.getItem("token") || "";
      
      // Prepare request config
      const config = {
        withCredentials: true,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json"
        }
      };
      
      // Add auth header if token exists
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
        // Server responded with error
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
        // Request made but no response
        console.error("🛒 No response received:", error.request);
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      console.error("🛒 Final error message to user:", errorMessage);
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
      state.isloading = false;
      state.lastOrderData = null;
    },
    setLastOrderData: (state, action) => {
      state.lastOrderData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isloading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isloading = false;
        state.approvalURL = action.payload.data?.payment?.authorization_url || action.payload.authorization_url;
        state.orderId = action.payload.orderId || action.payload.data?.orderId;
        state.error = null;
        state.lastOrderData = action.payload;
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isloading = false;
        state.approvalURL = null;
        state.orderId = null;
        // Safe error assignment
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : typeof action.error?.message === 'string'
          ? action.error.message
          : "Failed to create order";
      });
  },
});

export const { clearOrderError, resetOrderState, setLastOrderData } = shoppingOrderSlice.actions;
export default shoppingOrderSlice.reducer;