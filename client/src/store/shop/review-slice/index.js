import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios-interceptor';

const initialState = {
  reviews: [],
  currentProductId: null,
  isLoading: false,
  isSubmitting: false,
  isCheckingPurchase: false,
  error: null,
  purchaseStatus: null,
  purchaseStatusMessage: '', // Added for better UX
};

export const checkCanReview = createAsyncThunk(
  'shopReviews/checkCanReview',
  async (productId, { rejectWithValue }) => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await axiosInstance.get(`/shop/reviews/can-review/${productId}`);
      
      // Match the response structure from your backend controller
      return {
        canReview: response.data.canReview || false,
        productId,
        reason: response.data.reason || 'unknown',
        message: response.data.message || ''
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check review eligibility'
      );
    }
  }
);

export const getProductReviews = createAsyncThunk(
  'shopReviews/getProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await axiosInstance.get(`/shop/reviews/${productId}`);
      return { 
        reviews: response.data.data || [], 
        productId,
        count: response.data.count || 0
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reviews'
      );
    }
  }
);

export const addProductReview = createAsyncThunk(
  'shopReviews/addProductReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      // FIXED: Removed duplicate /api prefix
      const response = await axiosInstance.post('/shop/reviews', reviewData);
      return response.data.data;
    } catch (error) {
      // Enhanced error handling
      let errorMessage = 'Failed to submit review';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const reviewSlice = createSlice({
  name: 'shopReviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.currentProductId = null;
      state.error = null;
      state.purchaseStatus = null;
      state.purchaseStatusMessage = '';
      state.isCheckingPurchase = false;
      state.isLoading = false;
      state.isSubmitting = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPurchaseStatus: (state, action) => {
      state.purchaseStatus = action.payload.status;
      state.purchaseStatusMessage = action.payload.message || '';
      state.isCheckingPurchase = false;
    },
    addReviewLocally: (state, action) => {
      const optimisticReview = {
        ...action.payload,
        _id: `optimistic-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userName: action.payload.userName || 'You'
      };
      state.reviews = [optimisticReview, ...state.reviews];
      state.purchaseStatus = 'already-reviewed';
      state.purchaseStatusMessage = 'You have already reviewed this product.';
    },
    resetPurchaseStatus: (state) => {
      state.purchaseStatus = null;
      state.purchaseStatusMessage = '';
      state.isCheckingPurchase = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // checkCanReview
      .addCase(checkCanReview.pending, (state) => {
        state.isCheckingPurchase = true;
        state.error = null;
        state.purchaseStatusMessage = 'Checking purchase status...';
      })
      .addCase(checkCanReview.fulfilled, (state, action) => {
        state.isCheckingPurchase = false;
        state.purchaseStatus = action.payload.reason;
        state.purchaseStatusMessage = action.payload.message;
        
        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Review eligibility check:', {
            productId: action.payload.productId,
            canReview: action.payload.canReview,
            reason: action.payload.reason,
            message: action.payload.message
          });
        }
      })
      .addCase(checkCanReview.rejected, (state, action) => {
        state.isCheckingPurchase = false;
        state.error = action.payload;
        state.purchaseStatus = 'error';
        state.purchaseStatusMessage = action.payload || 'Error checking eligibility';
      })

      // getProductReviews
      .addCase(getProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews || [];
        state.currentProductId = action.payload.productId;
        
        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Reviews loaded:', {
            productId: action.payload.productId,
            count: action.payload.reviews.length
          });
        }
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.reviews = [];
        state.currentProductId = null;
      })

      // addProductReview
      .addCase(addProductReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const newReview = action.payload;
        
        // Remove optimistic review if exists, add real review
        state.reviews = [
          newReview,
          ...state.reviews.filter(r => !r._id?.startsWith('optimistic-'))
        ];
        
        state.purchaseStatus = 'already-reviewed';
        state.purchaseStatusMessage = 'Thank you for your review!';
        
        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Review submitted:', newReview);
        }
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
        
        // Remove optimistic review on failure
        state.reviews = state.reviews.filter(r => !r._id?.startsWith('optimistic-'));
        
        // Update purchase status based on error
        if (action.payload?.includes('already reviewed')) {
          state.purchaseStatus = 'already-reviewed';
          state.purchaseStatusMessage = 'You have already reviewed this product.';
        } else if (action.payload?.includes('purchased')) {
          state.purchaseStatus = 'not-purchased';
          state.purchaseStatusMessage = 'You can only review purchased products.';
        } else if (action.payload?.includes('login') || action.payload?.includes('Authentication')) {
          state.purchaseStatus = 'not-logged-in';
          state.purchaseStatusMessage = 'Please login to submit a review.';
        }
      });
  },
});

export const { 
  clearReviews, 
  clearError,
  setPurchaseStatus,
  addReviewLocally,
  resetPurchaseStatus
} = reviewSlice.actions;

export default reviewSlice.reducer;