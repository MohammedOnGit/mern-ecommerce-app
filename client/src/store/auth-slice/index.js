import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { clearAllUserData } from "../clear-slice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==================== SECURE STORAGE UTILITIES ====================

class SecureStorage {
  constructor() {
    this.prefix = "app_";
  }

  setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(`${this.prefix}${key}`, stringValue);
      return true;
    } catch (error) {
      console.error(`Storage set error for ${key}:`, error);
      return false;
    }
  }

  getItem(key) {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      if (!item) return null;
      
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error(`Storage get error for ${key}:`, error);
      return null;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
      return true;
    } catch (error) {
      console.error(`Storage remove error for ${key}:`, error);
      return false;
    }
  }

  clear() {
    try {
      // Only remove our app's keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
}

const secureStorage = new SecureStorage();

// ==================== INITIAL STATE ====================

const getDefaultState = () => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isChecking: false,
  error: null,
  lastChecked: null,
  needsRefresh: false
});

const loadInitialState = () => {
  try {
    const token = secureStorage.getItem("token");
    const user = secureStorage.getItem("user");

    if (token && user && user.id && user.email && user.role) {
      // Basic validation
      if (typeof token !== 'string' || token.length < 10) {
        secureStorage.clear();
        return getDefaultState();
      }

      return {
        ...getDefaultState(),
        token,
        user,
        isAuthenticated: true,
        lastChecked: Date.now()
      };
    }
  } catch (error) {
    console.error("Failed to load auth state:", error);
    secureStorage.clear();
  }

  return getDefaultState();
};

const initialState = loadInitialState();

// ==================== ASYNC THUNKS ====================

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Client-Request-ID": `login_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
          },
          withCredentials: true,
          signal: controller.signal,
          timeout: 10000
        }
      );

      clearTimeout(timeoutId);

      if (response.data?.success) {
        const { token, user } = response.data;

        if (!token || !user) {
          throw new Error("Invalid server response");
        }

        // Store in secure storage
        secureStorage.setItem("token", token);
        secureStorage.setItem("user", user);
        secureStorage.setItem("auth_timestamp", Date.now());

        console.log(`✅ Login successful for ${user.email}`);

        return { token, user };
      } else {
        return rejectWithValue({
          message: response.data?.message || "Login failed",
          code: "LOGIN_FAILED",
          status: response.status
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);

      let errorMessage = "Network error. Please check your connection.";
      let errorCode = "NETWORK_ERROR";

      if (error.response) {
        const { status, data } = error.response;
        errorMessage = data?.message || `Server error (${status})`;
        errorCode = `HTTP_${status}`;

        if (status === 401 || status === 403) {
          errorMessage = "Invalid email or password";
          errorCode = "INVALID_CREDENTIALS";
        }
      } else if (error.request) {
        errorMessage = "No response from server";
        errorCode = "NO_RESPONSE";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout";
        errorCode = "TIMEOUT";
      } else if (error.name === 'AbortError') {
        errorMessage = "Request aborted";
        errorCode = "ABORTED";
      }

      console.error("Login error:", {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString()
      });

      return rejectWithValue({
        message: errorMessage,
        code: errorCode,
        originalError: import.meta.env.DEV ? error.message : undefined
      });
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Client-side validation
      if (!userData.email?.trim() || !userData.password?.trim() || !userData.userName?.trim()) {
        return rejectWithValue({
          message: "All fields are required",
          code: "VALIDATION_ERROR"
        });
      }

      if (userData.password.length < 6) {
        return rejectWithValue({
          message: "Password must be at least 6 characters",
          code: "WEAK_PASSWORD"
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return rejectWithValue({
          message: "Please enter a valid email address",
          code: "INVALID_EMAIL"
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Client-Request-ID": `register_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
          },
          withCredentials: true,
          signal: controller.signal,
          timeout: 10000
        }
      );

      clearTimeout(timeoutId);

      if (response.data?.success) {
        const { token, user } = response.data;

        if (!token || !user) {
          throw new Error("Invalid server response");
        }

        secureStorage.setItem("token", token);
        secureStorage.setItem("user", user);
        secureStorage.setItem("auth_timestamp", Date.now());

        console.log(`✅ Registration successful for ${user.email}`);

        return { token, user };
      } else {
        return rejectWithValue({
          message: response.data?.message || "Registration failed",
          code: "REGISTRATION_FAILED",
          status: response.status
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);

      let errorMessage = "Registration failed";
      let errorCode = "REGISTRATION_ERROR";

      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 409) {
          errorMessage = "Email already exists";
          errorCode = "EMAIL_EXISTS";
        } else {
          errorMessage = data?.message || `Server error (${status})`;
          errorCode = `HTTP_${status}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server";
        errorCode = "NO_RESPONSE";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Registration timeout";
        errorCode = "TIMEOUT";
      }

      console.error("Registration error:", {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString()
      });

      return rejectWithValue({
        message: errorMessage,
        code: errorCode,
        originalError: import.meta.env.DEV ? error.message : undefined
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const userEmail = secureStorage.getItem("user")?.email || "unknown";

      // Fire-and-forget logout API call
      const logoutPromise = axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
          signal: controller.signal,
          timeout: 5000
        }
      ).catch(err => {
        console.warn("Logout API warning:", err.message);
      });

      // Clear local state immediately
      secureStorage.clear();
      dispatch(clearAllUserData());

      // Wait for logout promise (max 2 seconds)
      await Promise.race([
        logoutPromise,
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      clearTimeout(timeoutId);

      console.log(`✅ Logout successful for ${userEmail}`);

      return {};
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Still clear local state even if API fails
      secureStorage.clear();
      dispatch(clearAllUserData());

      console.error("Logout error (state cleared):", error.message);

      return rejectWithValue({
        message: "Logged out (local session cleared)",
        code: "LOGOUT_COMPLETED"
      });
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (options = {}, { rejectWithValue }) => {
    const { silent = false, forceRefresh = false } = options;

    try {
      const token = secureStorage.getItem("token");
      const user = secureStorage.getItem("user");

      if (!token || !user) {
        if (!silent) console.log("ℹ️ No auth token found");
        return rejectWithValue({
          message: "No auth token found",
          code: "NO_TOKEN",
          silent: true
        });
      }

      // Check token age (client-side)
      const authTimestamp = secureStorage.getItem("auth_timestamp");
      const tokenAge = authTimestamp ? Date.now() - authTimestamp : Infinity;
      const isTokenOld = tokenAge > 55 * 60 * 1000; // 55 minutes

      // Return cached data if not forcing refresh and token is not too old
      if (!forceRefresh && !isTokenOld) {
        if (!silent) console.log("✅ Using cached auth data");
        return {
          token,
          user,
          fromCache: true,
          verified: false
        };
      }

      // Verify with backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/check-auth`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Client-Request-ID": `auth_check_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
          },
          withCredentials: true,
          signal: controller.signal,
          timeout: 5000,
          validateStatus: (status) => status < 500
        });

        clearTimeout(timeoutId);

        if (response.status === 200 && response.data?.success) {
          const updatedUser = response.data.user || user;
          
          secureStorage.setItem("user", updatedUser);
          secureStorage.setItem("auth_timestamp", Date.now());

          if (!silent) console.log("✅ Auth verified with backend");

          return {
            token,
            user: updatedUser,
            fromCache: false,
            verified: true
          };
        } else if (response.status === 401 || response.status === 403) {
          console.warn("Token invalid on server");
          
          // Mark as needs refresh but keep cached data
          return {
            token,
            user,
            fromCache: true,
            verified: false,
            needsRefresh: true
          };
        } else {
          console.warn(`Auth check returned ${response.status}`);
          return {
            token,
            user,
            fromCache: true,
            verified: false
          };
        }
      } catch (verifyError) {
        clearTimeout(timeoutId);

        if (verifyError.code === 'ECONNABORTED' || verifyError.name === 'AbortError') {
          console.warn("Auth check timeout");
        } else {
          console.warn("Auth check network error:", verifyError.message);
        }

        return {
          token,
          user,
          fromCache: true,
          verified: false
        };
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
      return rejectWithValue({
        message: "Auth check failed",
        code: "AUTH_CHECK_FAILED",
        silent: true
      });
    }
  }
);

// ==================== SLICE DEFINITION ====================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    restoreAuthFromStorage: (state) => {
      const savedState = loadInitialState();
      Object.assign(state, savedState);
      state.isLoading = false;
      state.isChecking = false;
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser;
        secureStorage.setItem("user", updatedUser);
      }
    },
    setAuthTokens: (state, action) => {
      const { token, user } = action.payload;
      if (token && user) {
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.error = null;
        secureStorage.setItem("token", token);
        secureStorage.setItem("user", user);
        secureStorage.setItem("auth_timestamp", Date.now());
      }
    },
    markForRefresh: (state) => {
      state.needsRefresh = true;
    },
    clearAuthState: (state) => {
      Object.assign(state, getDefaultState());
      secureStorage.clear();
    }
  },
  extraReducers: (builder) => {
    builder
      // loginUser
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
        state.lastChecked = Date.now();
        state.needsRefresh = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        state.lastChecked = Date.now();
      })
      
      // registerUser
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
        state.lastChecked = Date.now();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      
      // logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, getDefaultState());
      })
      .addCase(logoutUser.rejected, (state) => {
        Object.assign(state, getDefaultState());
      })
      
      // checkAuthStatus
      .addCase(checkAuthStatus.pending, (state) => {
        state.isChecking = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isChecking = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.lastChecked = Date.now();
        state.needsRefresh = action.payload.needsRefresh || false;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isChecking = false;
        
        if (action.payload?.code === "NO_TOKEN") {
          // No token = user not logged in (normal state)
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          state.error = null;
        } else if (!action.payload?.silent) {
          // Real error
          state.needsRefresh = true;
          state.error = action.payload;
        }
        
        state.lastChecked = Date.now();
      });
  }
});

// Selectors
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsChecking = (state) => state.auth.isChecking;
export const selectAuthError = (state) => state.auth.error;
export const selectNeedsRefresh = (state) => state.auth.needsRefresh;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAuthToken = (state) => state.auth.token;

export const {
  clearAuthError,
  restoreAuthFromStorage,
  updateUserProfile,
  setAuthTokens,
  markForRefresh,
  clearAuthState
} = authSlice.actions;

export default authSlice.reducer;