import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Heart, Plus, Minus, ShoppingBag, MessageSquare, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setProductDetails } from "@/store/shop/products-slice";
import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import StarRatingComponent from "@/components/common/star-rating";
import ReviewItem from "@/components/common/review-item";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useProductReviews } from "@/hooks/useProductReviews";
import { ScrollArea } from "@/components/ui/scroll-area";

function ProductDetailsDialog({ open, setOpen, productDetails, handleAddtoCart }) {
  const dispatch = useDispatch();
  const { vh } = useViewportHeight();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems = [], isLoading: wishlistLoading } = useSelector(
    (state) => state.wishlist || {}
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("details");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  // Use the updated hook with all new features
  const { 
    reviews: productReviews = [],
    isLoading: reviewsLoading = false,
    isSubmitting: isSubmittingReview = false,
    isCheckingPurchase = false,
    purchaseStatus,
    purchaseStatusMessage,
    error: reviewError,
    submitReview,
    refreshReviews,
    clearError,
    getPurchaseStatusText,
    canReview,
    hasUserReviewed,
    getUserReview,
    debug // Only available in development
  } = useProductReviews(productDetails?._id);

  // Prevent infinite loading state
  useEffect(() => {
    if (isCheckingPurchase && selectedTab === "reviews") {
      const timer = setTimeout(() => {
        console.warn('Purchase check timed out after 8 seconds');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isCheckingPurchase, selectedTab]);

  const isOnSale = productDetails?.salePrice > 0;
  const stock = productDetails?.availableStock ?? productDetails?.totalStock ?? 0;
  
  const isInWishlist = wishlistItems.some(
    (item) =>
      item.product?._id === productDetails?._id ||
      item.productId === productDetails?._id
  );

  const resetAndClose = useCallback(() => {
    setOpen(false);
    setQuantity(1);
    setSelectedTab("details");
    setReviewText("");
    setReviewRating(0);
    clearError?.();
    dispatch(setProductDetails());
  }, [dispatch, setOpen, clearError]);

  // Clear errors when dialog opens
  useEffect(() => {
    if (open) {
      clearError?.();
    }
  }, [open, clearError]);

  // Reset form when tab changes away from reviews
  useEffect(() => {
    if (selectedTab !== "reviews") {
      setReviewText("");
      setReviewRating(0);
    }
  }, [selectedTab]);

  // Auto-scroll to top when tab changes
  useEffect(() => {
    const el = document.querySelector(".tabs-scroll-container");
    if (el) el.scrollTop = 0;
  }, [selectedTab]);

  // Handle review submission
  const handleSubmitReview = useCallback(async () => {
    if (!user?.id) {
      toast.info("Please login to submit a review");
      return;
    }

    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    const toastId = toast.loading("Submitting your review...");

    const result = await submitReview({
      reviewMessage: reviewText.trim(),
      reviewValue: reviewRating
    });

    toast.dismiss(toastId);

    if (result?.success) {
      toast.success("Review submitted successfully!");
      setReviewText("");
      setReviewRating(0);
    } else {
      toast.error(result?.error || "Failed to submit review");
    }
  }, [reviewText, reviewRating, submitReview, user]);

  // Show review errors if any
  useEffect(() => {
    if (reviewError && selectedTab === "reviews") {
      toast.error(reviewError);
      clearError?.();
    }
  }, [reviewError, selectedTab, clearError]);

  // Don't render if no product details
  if (!open || !productDetails) return null;

  // Calculate prices
  const mainPrice = isOnSale ? productDetails.salePrice : productDetails.price;
  
  // Get review counts and ratings - use averageReview, not rating
  const reviewCount = productReviews.length || productDetails.reviewCount || 0;
  const averageRating = productDetails.averageReview || 0;

  // Get user's existing review if any
  const userReview = getUserReview?.();

  // Get status display info
  const statusInfo = getPurchaseStatusText?.();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent
        className="bg-background p-0 overflow-hidden max-w-[92%] sm:max-w-lg lg:max-w-4xl rounded-lg border shadow-lg"
        style={{
          height: `calc(var(--vh, 1vh) * 85)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
          {/* Left: Product Image */}
          <div className="relative h-[240px] sm:h-[300px] lg:h-full bg-muted/50 overflow-hidden">
            {isOnSale && (
              <Badge
                variant="destructive"
                className="absolute top-4 left-4 z-10"
              >
                Sale!
              </Badge>
            )}
            <img
              src={productDetails.image}
              alt={productDetails.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col px-4 sm:px-6 py-4 sm:py-5 overflow-hidden h-full">
            {/* Product Header */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase text-muted-foreground font-semibold">
                {productDetails.category}
              </h4>
              <DialogTitle className="text-lg sm:text-xl font-semibold leading-tight">
                {productDetails.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {productDetails.shortDescription}
              </p>
            </div>

            {/* Price and Rating */}
            <div className="flex justify-between items-center mt-3">
              <p className="text-xl sm:text-2xl font-semibold">
                ₵{mainPrice}
                {isOnSale && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">
                    ₵{productDetails.price}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <StarRatingComponent
                  rating={averageRating}
                  size="sm"
                  showLabel={true}
                />
                <span className="text-sm text-muted-foreground">
                  ({reviewCount})
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex justify-between items-center my-3">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 flex items-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                className="flex-1 h-9"
                disabled={wishlistLoading}
                onClick={() => {
                  if (!user?.id) {
                    toast.info("Please login to add to wishlist");
                    return;
                  }
                  const action = isInWishlist
                    ? removeFromWishlist(productDetails._id)
                    : addToWishlist(productDetails._id);
                  dispatch(action);
                  
                  if (isInWishlist) {
                    toast.success("Removed from wishlist");
                  } else {
                    toast.success("Added to wishlist");
                  }
                }}
              >
                <Heart
                  className={cn(
                    "mr-2 h-4 w-4",
                    isInWishlist && "fill-red-500 text-red-500"
                  )}
                />
                {isInWishlist ? "Wishlisted" : "Wishlist"}
              </Button>

              <Button
                className="flex-1 h-9"
                disabled={stock <= 0}
                onClick={() => {
                  handleAddtoCart({ ...productDetails, quantity });
                  resetAndClose();
                  toast.success("Added to cart!");
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            {/* Tabs Section */}
            <div className="flex-1 min-h-0 border-t pt-3">
              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="flex flex-col h-full"
              >
                <TabsList className="grid grid-cols-3 h-9 shrink-0">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews
                    {reviewCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {reviewCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 min-h-0 overflow-y-auto tabs-scroll-container p-2">
                  {/* Details Tab */}
                  <TabsContent value="details" className="mt-0">
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {productDetails.description || "No description available."}
                    </p>
                  </TabsContent>

                  {/* Specs Tab */}
                  <TabsContent value="specs" className="mt-0 space-y-2">
                    <p className="text-sm">
                      <strong className="font-medium">Brand:</strong>{" "}
                      <span className="text-muted-foreground">
                        {productDetails.brand || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <strong className="font-medium">SKU:</strong>{" "}
                      <span className="text-muted-foreground">
                        {productDetails.sku || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <strong className="font-medium">Stock:</strong>{" "}
                      <span className={cn(
                        "font-medium",
                        stock > 10 ? "text-green-600" : 
                        stock > 0 ? "text-amber-600" : 
                        "text-red-600"
                      )}>
                        {stock > 0 ? `${stock} available` : "Out of stock"}
                      </span>
                    </p>
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews" className="mt-0 flex flex-col gap-4">
                    {/* Review Form Section */}
                    <div className="space-y-3 border-b pb-4">
                      <h4 className="text-sm font-medium">Your Review</h4>
                      {/* Status Message */}
                      <div className={cn(
                        "p-3 rounded-md border",
                        purchaseStatus === 'not-logged-in' || purchaseStatus === 'not-purchased' 
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                          : purchaseStatus === 'already-reviewed' || purchaseStatus === 'eligible'
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
                      )}>
                        {isCheckingPurchase ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Checking purchase status...
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className={cn(
                              "text-sm font-medium",
                              purchaseStatus === 'not-logged-in' ? "text-blue-700 dark:text-blue-300" :
                              purchaseStatus === 'not-purchased' ? "text-amber-700 dark:text-amber-300" :
                              purchaseStatus === 'already-reviewed' || purchaseStatus === 'eligible' ? "text-green-700 dark:text-green-300" :
                              "text-gray-700 dark:text-gray-300"
                            )}>
                              {purchaseStatusMessage || (statusInfo?.text || "Loading review status...")}
                            </p>
                            {(purchaseStatus === 'not-purchased') && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Purchase this product to share your experience.
                              </p>
                            )}
                            {(purchaseStatus === 'already-reviewed' && userReview) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Your rating: {userReview.reviewValue} stars
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Review Form (only shown if user can review) */}
                      {(canReview && purchaseStatus === 'eligible') && (
                        <>
                          <div className="space-y-2 mt-4">
                            <p className="text-sm font-medium">Your Rating</p>
                            <StarRatingComponent
                              rating={reviewRating}
                              editable={true}
                              handleRatingChange={setReviewRating}
                              size="md"
                              disabled={isSubmittingReview}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Your Review</p>
                            <textarea
                              className="w-full min-h-[100px] p-3 border rounded-md resize-none text-sm focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                              placeholder="Share your experience with this product..."
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              maxLength={500}
                              disabled={isSubmittingReview}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Minimum 10 characters</span>
                              <span>{reviewText.length}/500</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 h-9"
                              onClick={handleSubmitReview}
                              disabled={isSubmittingReview || reviewText.trim().length < 10 || reviewRating === 0}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              {isSubmittingReview ? "Submitting..." : "Submit Review"}
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="h-9"
                              onClick={() => {
                                setReviewText("");
                                setReviewRating(0);
                              }}
                              disabled={isSubmittingReview}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Reviews List Section */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">
                          Customer Reviews ({reviewCount})
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshReviews}
                          disabled={reviewsLoading}
                          className="h-7 text-xs"
                        >
                          <RefreshCw className={cn("h-3 w-3 mr-1", reviewsLoading && "animate-spin")} />
                          {reviewsLoading ? "Refreshing..." : "Refresh"}
                        </Button>
                      </div>
                      
                      {reviewsLoading ? (
                        <div className="py-8 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-muted-foreground">Loading reviews...</p>
                          </div>
                        </div>
                      ) : productReviews.length > 0 ? (
                        <ScrollArea className="h-[200px] pr-4">
                          {productReviews.map((review, index) => (
                            <ReviewItem 
                              key={review?._id || `review-${index}`} 
                              review={review} 
                              isUsersReview={user?.id === review.userId}
                            />
                          ))}
                        </ScrollArea>
                      ) : (
                        <div className="py-8 text-center border rounded-md">
                          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No reviews yet. Be the first to review this product!
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;