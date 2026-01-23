import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  getProductReviews, 
  addProductReview,
  checkCanReview,
  setPurchaseStatus,
  clearError,
  addReviewLocally,
  resetPurchaseStatus
} from '@/store/shop/review-slice';

export function useProductReviews(productId) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const shopReviews = useSelector((state) => state.shopReviews);
  
  const hasCheckedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const reviews = shopReviews?.reviews || [];
  const isLoading = shopReviews?.isLoading || false;
  const isSubmitting = shopReviews?.isSubmitting || false;
  const isCheckingPurchase = shopReviews?.isCheckingPurchase || false;
  const purchaseStatus = shopReviews?.purchaseStatus;
  const purchaseStatusMessage = shopReviews?.purchaseStatusMessage || '';
  const error = shopReviews?.error;
  const currentProductId = shopReviews?.currentProductId;

  // Load reviews when productId changes
  useEffect(() => {
    if (!productId) return;
    
    hasCheckedRef.current = false;
    dispatch(getProductReviews(productId));
    
    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log('Loading reviews for product:', productId);
    }
  }, [dispatch, productId]);

  // Check review eligibility when user or productId changes
  useEffect(() => {
    if (!productId || hasCheckedRef.current || !isMountedRef.current) return;
    
    hasCheckedRef.current = true;
    
    if (user?.id) {
      // User is logged in, check if they can review
      dispatch(checkCanReview(productId))
        .unwrap()
        .then(result => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Can review check result:', result);
          }
        })
        .catch(err => {
          console.error('Can review check failed:', err);
          toast.error('Failed to check review eligibility');
        });
    } else {
      // User is not logged in
      dispatch(setPurchaseStatus({ 
        status: 'not-logged-in',
        message: 'Please login to submit a review'
      }));
    }
  }, [dispatch, productId, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Optional: Clear reviews when component unmounts
      // dispatch(clearReviews());
    };
  }, []);

  // Submit a new review
  const submitReview = useCallback(async (reviewData) => {
    if (!user?.id) {
      toast.error("Please login to submit a review");
      return { success: false, error: 'Please login to submit a review' };
    }
    
    if (!productId) {
      toast.error("Product not found");
      return { success: false, error: 'Product ID is missing' };
    }
    
    if (!reviewData.reviewMessage?.trim()) {
      toast.error("Review message is required");
      return { success: false, error: 'Review message is required' };
    }
    
    if (!reviewData.reviewValue || reviewData.reviewValue < 1 || reviewData.reviewValue > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return { success: false, error: 'Please select a valid rating' };
    }
    
    // Validate minimum length
    if (reviewData.reviewMessage.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return { success: false, error: 'Review must be at least 10 characters' };
    }
    
    // Prepare review payload
    const reviewPayload = {
      ...reviewData,
      productId,
      userId: user.id,
      userName: user.name || user.userName || user.email?.split('@')[0] || 'User',
      reviewMessage: reviewData.reviewMessage.trim()
    };

    // Show loading toast
    const toastId = toast.loading("Submitting your review...");
    
    // Add optimistic review for immediate UI feedback
    dispatch(addReviewLocally(reviewPayload));

    try {
      const result = await dispatch(addProductReview(reviewPayload)).unwrap();
      
      toast.dismiss(toastId);
      toast.success("Review submitted successfully!");
      
      // Refresh reviews to get the real data from server
      dispatch(getProductReviews(productId));
      
      return { success: true, data: result };
    } catch (error) {
      toast.dismiss(toastId);
      
      let errorMessage = 'Failed to submit review';
      let toastMessage = 'Failed to submit review';
      
      if (error?.includes('already reviewed')) {
        errorMessage = 'You have already reviewed this product';
        toastMessage = 'You have already reviewed this product';
      } else if (error?.includes('purchased')) {
        errorMessage = 'You can only review products you have purchased';
        toastMessage = 'You can only review purchased products';
      } else if (error?.includes('login') || error?.includes('Authentication') || error?.includes('Unauthorized')) {
        errorMessage = 'Session expired. Please login again.';
        toastMessage = 'Session expired. Please login again.';
      } else if (error?.includes('rating')) {
        errorMessage = 'Please select a valid rating';
        toastMessage = 'Please select a valid rating';
      }
      
      toast.error(toastMessage);
      
      // Refresh reviews to remove optimistic review and get current state
      dispatch(getProductReviews(productId));
      
      return { success: false, error: errorMessage };
    }
  }, [dispatch, productId, user]);

  // Refresh reviews
  const refreshReviews = useCallback(() => {
    if (!productId) {
      toast.error("No product selected");
      return;
    }
    
    hasCheckedRef.current = false;
    dispatch(getProductReviews(productId));
    
    if (user?.id) {
      dispatch(checkCanReview(productId));
    } else {
      dispatch(setPurchaseStatus({ 
        status: 'not-logged-in',
        message: 'Please login to submit a review'
      }));
    }
    
    toast.success("Reviews refreshed");
  }, [dispatch, productId, user?.id]);

  // Check if user has already reviewed
  const hasUserReviewed = useCallback(() => {
    if (!user?.id) return false;
    return reviews.some(review => review.userId === user.id);
  }, [reviews, user]);

  // Get user's review if exists
  const getUserReview = useCallback(() => {
    if (!user?.id) return null;
    return reviews.find(review => review.userId === user.id);
  }, [reviews, user]);

  // Determine if user can review
  const canReview = useCallback(() => {
    if (!user?.id) return false;
    if (hasUserReviewed()) return false;
    return purchaseStatus === 'eligible';
  }, [user, hasUserReviewed, purchaseStatus]);

  // Get readable purchase status
  const getPurchaseStatusText = useCallback(() => {
    switch (purchaseStatus) {
      case 'eligible':
        return { 
          text: 'You can review this product',
          type: 'success'
        };
      case 'not-purchased':
        return { 
          text: 'You can only review purchased products',
          type: 'warning'
        };
      case 'already-reviewed':
        return { 
          text: 'You have already reviewed this product',
          type: 'info'
        };
      case 'not-logged-in':
        return { 
          text: 'Please login to submit a review',
          type: 'info'
        };
      case 'error':
        return { 
          text: 'Error checking eligibility',
          type: 'error'
        };
      default:
        return { 
          text: 'Checking eligibility...',
          type: 'info'
        };
    }
  }, [purchaseStatus]);

  return {
    // Data
    reviews,
    reviewCount: reviews.length,
    currentProductId,
    
    // User info
    userId: user?.id,
    isLoggedIn: !!user?.id,
    
    // Status
    isLoading,
    isSubmitting,
    isCheckingPurchase,
    purchaseStatus,
    purchaseStatusMessage,
    error,
    
    // Helper functions
    hasUserReviewed: hasUserReviewed(),
    canReview: canReview(),
    getUserReview,
    getPurchaseStatusText, // ✅ FIXED: Removed parentheses
    
    // Actions
    submitReview,
    refreshReviews,
    clearError: () => dispatch(clearError()),
    resetPurchaseStatus: () => dispatch(resetPurchaseStatus()),
    
    // Debug info (development only)
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        productId,
        purchaseStatus,
        purchaseStatusMessage,
        userHasId: !!user?.id,
        hasChecked: hasCheckedRef.current,
        reviewCount: reviews.length
      }
    })
  };
}