import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState = {
  isLoading: false,
  isUpdating: false,
  error: null,
  orderDetails: null,
  orders: [],
  pagination: {
    page: 1,
    limit: 20,
    totalOrders: 0,
    totalPages: 0
  }
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "adminOrder/getAllOrdersForAdmin", 
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("app_token");
      
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
      
      // Build query params
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page);
      if (params?.limit) queryParams.append("limit", params.limit);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      
      const url = `${API_BASE_URL}/admin/orders/get${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await axios.get(url, config);
      
      if (response.data?.success) {
        return response.data;
      } else {
        const errorMsg = response.data?.message || "Failed to fetch orders";
        return rejectWithValue(errorMsg);
      }
    } catch (error) {
      let errorMessage = "Failed to fetch orders";
      
      if (error.response) {
        const serverError = error.response.data;
        const status = error.response.status;
        
        if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (status === 404) {
          errorMessage = "No orders found";
        } else if (status === 401) {
          errorMessage = "Please log in to view orders";
        } else if (status === 403) {
          errorMessage = "Access denied - Admin only";
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

export const getOrderDetailsForAdmin = createAsyncThunk(
  "adminOrder/getOrderDetailsForAdmin",
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("app_token");
      
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
        `${API_BASE_URL}/admin/orders/details/${orderId}`,
        config
      );
      
      if (response.data?.success) {
        return response.data;
      } else {
        const errorMsg = response.data?.message || "Failed to get order details";
        return rejectWithValue(errorMsg);
      }
    } catch (error) {
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
        } else if (status === 403) {
          errorMessage = "Access denied - Admin only";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "adminOrder/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue, dispatch }) => {
    try {
      console.log("🔄 Redux: Updating order status - Order ID:", orderId, "Status:", status);
      
      if (!orderId) {
        return rejectWithValue("Order ID is required");
      }
      
      if (!status) {
        return rejectWithValue("Status is required");
      }
      
      const token = localStorage.getItem("app_token");
      
      const config = {
        withCredentials: true,
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        }
      };
      
      console.log("🔄 Making PUT request to:", `${API_BASE_URL}/admin/orders/update/${orderId}`);
      
      const response = await axios.put(
        `${API_BASE_URL}/admin/orders/update/${orderId}`,
        { status },
        config
      );
      
      console.log("🔄 Update response:", response.data);
      
      if (response.data?.success) {
        // Refresh the orders list after successful update
        dispatch(getAllOrdersForAdmin({}));
        return {
          ...response.data,
          orderId: orderId,
          status: status
        };
      } else {
        const errorMsg = response.data?.message || "Failed to update order status";
        return rejectWithValue(errorMsg);
      }
    } catch (error) {
      console.error("🔄 Redux: Update error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      let errorMessage = "Failed to update order status";
      
      if (error.response) {
        const serverError = error.response.data;
        const status = error.response.status;
        
        if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (status === 404) {
          errorMessage = "Order not found";
        } else if (status === 401) {
          errorMessage = "Please log in to update order status";
        } else if (status === 403) {
          errorMessage = "Access denied - Admin only";
        } else if (status === 400) {
          errorMessage = serverError?.message || "Invalid status";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {
    clearAdminOrderError: (state) => {
      state.error = null;
    },
    clearAdminOrderDetails: (state) => {
      state.orderDetails = null;
    },
    resetAdminOrders: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders || [];
        state.pagination = {
          page: action.payload.pagination?.page || 1,
          limit: action.payload.pagination?.limit || 20,
          totalOrders: action.payload.pagination?.totalOrders || 0,
          totalPages: action.payload.pagination?.totalPages || 0
        };
      })
      .addCase(getAllOrdersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.orders = [];
      })
      
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.order;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.orderDetails = null;
      })
      
      .addCase(updateOrderStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.isUpdating = false;
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectAdminOrders = (state) => state.adminOrder.orders;
export const selectAdminOrderDetails = (state) => state.adminOrder.orderDetails;
export const selectAdminOrderLoading = (state) => state.adminOrder.isLoading;
export const selectAdminOrderUpdating = (state) => state.adminOrder.isUpdating;
export const selectAdminOrderError = (state) => state.adminOrder.error;
export const selectAdminOrderPagination = (state) => state.adminOrder.pagination;

export const { clearAdminOrderError, clearAdminOrderDetails, resetAdminOrders } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;