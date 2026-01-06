// store/auth-slice.js - 
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { clearAllUserData } from "../clear-slice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Load initial state from localStorage
const loadAuthState = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    }
  } catch (error) {
    console.error("Failed to load auth state from localStorage:", error);
  }
  
  return {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };
};

const initialState = loadAuthState();

// Save auth state to localStorage
const saveAuthState = (token, user) => {
  try {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch (error) {
    console.error("Failed to save auth state:", error);
  }
};

// Clear auth state from localStorage
const clearAuthState = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Failed to clear auth state:", error);
  }
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        userData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        const { token, user } = response.data;
        saveAuthState(token, user);
        return { token, user };
      } else {
        return rejectWithValue(response.data.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        "Network error. Please check your connection."
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        const { token, user } = response.data;
        saveAuthState(token, user);
        return { token, user };
      } else {
        return rejectWithValue(response.data.message || "Registration failed");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        "Network error. Please check your connection."
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      clearAuthState();
      dispatch(clearAllUserData());
      return {};
    } catch (error) {
      clearAuthState();
      dispatch(clearAllUserData());
      return rejectWithValue("Logout failed");
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      
      if (!token || !userStr) {
        return rejectWithValue("No auth token found");
      }
      
      const user = JSON.parse(userStr);
      
      // Try to verify with backend but don't fail if it returns 401
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/check-auth`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500 // Don't throw for 401
        });
        
        if (response.status === 200 && response.data?.success) {
          return { token, user };
        }
        // If not 200, still use cached data
        console.warn("Auth check returned non-200, using cached data");
      } catch (verifyError) {
        console.warn("Token verification failed, using cached data");
      }
      
      // Return cached data for better UX
      return { token, user };
      
    } catch (error) {
      return rejectWithValue("Auth check failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    restoreAuthFromStorage: (state) => {
      const savedState = loadAuthState();
      state.token = savedState.token;
      state.user = savedState.user;
      state.isAuthenticated = savedState.isAuthenticated;
      state.error = null;
    },
    updateUserEmail: (state, action) => {
      if (state.user) {
        state.user.email = action.payload;
        saveAuthState(state.token, state.user);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  }
});

export const { clearAuthError, restoreAuthFromStorage, updateUserEmail } = authSlice.actions;
export default authSlice.reducer;