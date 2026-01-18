
// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Separator } from "../ui/separator";
// import { Avatar, AvatarFallback } from "../ui/avatar";
// import {
//   Star,
//   ShoppingBag,
//   Heart,
//   Share2,
//   Plus,
//   Minus,
//   X,
// } from "lucide-react";
// import { Button } from "../ui/button";
// import { useDispatch, useSelector } from "react-redux";
// import { setProductDetails } from "@/store/shop/products-slice";
// import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";
// import { cn } from "@/lib/utils";
// import { Badge } from "../ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// import { Textarea } from "../ui/textarea";
// import { toast } from "sonner";

// function ProductDetailsDialog({
//   open,
//   setOpen,
//   productDetails,
//   handleAddtoCart,
// }) {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { items: wishlistItems, isLoading: wishlistLoading } = useSelector(
//     (state) => state.wishlist || { items: [], isLoading: false }
//   );

//   const [quantity, setQuantity] = useState(1);
//   const [selectedTab, setSelectedTab] = useState("details");
//   const [reviewText, setReviewText] = useState("");

//   if (!productDetails) return null;

//   const isInWishlist = wishlistItems?.some(
//     (item) =>
//       item.product?._id === productDetails._id ||
//       item.product?.productId === productDetails._id ||
//       item.productId === productDetails._id
//   );

//   function handleDialogClose() {
//     setOpen(false);
//     setQuantity(1);
//     dispatch(setProductDetails());
//   }

//   const isOnSale = productDetails?.salePrice > 0;

//   const incrementQuantity = () => setQuantity((prev) => prev + 1);
//   const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

//   const handleWishlistToggle = () => {
//     if (!user?.id) {
//       toast.info("Please login to save items");
//       return;
//     }

//     const action = isInWishlist
//       ? removeFromWishlist(productDetails._id)
//       : addToWishlist(productDetails._id);

//     dispatch(action)
//       .unwrap()
//       .then(() =>
//         toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist")
//       )
//       .catch(() => toast.error("Action failed"));
//   };

//   const handleShare = () => {
//     navigator.clipboard.writeText(window.location.href);
//     toast.success("Link copied");
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && handleDialogClose()}>
//       <DialogContent className="max-w-5xl p-0 overflow-hidden">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={handleDialogClose}
//           className="absolute right-3 top-3"
//         >
//           <X />
//         </Button>

//         <div className="grid grid-cols-1 md:grid-cols-2">
//           {/* Image */}
//           <div className="bg-muted">
//             <img
//               src={productDetails.image || "https://via.placeholder.com/600"}
//               alt={productDetails.title}
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* Info */}
//           <div className="p-6 overflow-y-auto">
//             {isOnSale && (
//               <Badge className="mb-3 bg-red-600 text-white">On Sale</Badge>
//             )}

//             <DialogTitle className="text-2xl font-bold mb-2">
//               {productDetails.title}
//             </DialogTitle>

//             {/* Rating */}
//             <div className="flex items-center gap-2 mb-4 text-sm">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={cn(
//                     "h-4 w-4",
//                     i < Math.floor(productDetails.rating || 4)
//                       ? "fill-amber-400 text-amber-400"
//                       : "text-gray-300"
//                   )}
//                 />
//               ))}
//               <span className="text-muted-foreground">
//                 {productDetails.rating || 4.7}
//               </span>
//             </div>

//             {/* Price */}
//             <div className="mb-6">
//               <span className="text-3xl font-bold text-primary">
//                 ₵{isOnSale ? productDetails.salePrice : productDetails.price}
//               </span>
//               {isOnSale && (
//                 <span className="ml-3 line-through text-muted-foreground">
//                   ₵{productDetails.price}
//                 </span>
//               )}
//             </div>

//             <Separator className="my-6" />

//             {/* Quantity */}
//             <div className="flex items-center gap-4 mb-6">
//               <Button size="icon" variant="outline" onClick={decrementQuantity}>
//                 <Minus />
//               </Button>
//               <span className="font-medium">{quantity}</span>
//               <Button size="icon" variant="outline" onClick={incrementQuantity}>
//                 <Plus />
//               </Button>
//             </div>

//             {/* Actions */}
//             <div className="grid grid-cols-2 gap-3 mb-6">
//               <Button
//                 onClick={() => {
//                   handleAddtoCart({ ...productDetails, quantity });
//                   handleDialogClose();
//                 }}
//                 disabled={productDetails.totalStock <= 0}
//               >
//                 <ShoppingBag className="mr-2 h-5 w-5" />
//                 Add to Cart
//               </Button>

//               <Button
//                 variant="outline"
//                 onClick={handleWishlistToggle}
//                 disabled={wishlistLoading}
//               >
//                 <Heart
//                   className={cn(
//                     "mr-2 h-5 w-5",
//                     isInWishlist && "fill-red-500 text-red-500"
//                   )}
//                 />
//                 Save
//               </Button>
//             </div>

//             <Button
//               variant="ghost"
//               className="w-full mb-8"
//               onClick={handleShare}
//             >
//               <Share2 className="mr-2 h-4 w-4" />
//               Share
//             </Button>

//             {/* Tabs */}
//             <Tabs value={selectedTab} onValueChange={setSelectedTab}>
//               <TabsList className="grid grid-cols-3">
//                 <TabsTrigger value="details">Details</TabsTrigger>
//                 <TabsTrigger value="specs">Specs</TabsTrigger>
//                 <TabsTrigger value="reviews">Reviews</TabsTrigger>
//               </TabsList>

//               <TabsContent value="details" className="mt-4 text-sm">
//                 {productDetails.description || "No description available."}
//               </TabsContent>

//               <TabsContent value="specs" className="mt-4 text-sm">
//                 <p>Category: {productDetails.category}</p>
//                 <p>Brand: {productDetails.brand}</p>
//               </TabsContent>

//               <TabsContent value="reviews" className="mt-4 space-y-4">
//                 <Textarea
//                   placeholder="Write a review..."
//                   value={reviewText}
//                   onChange={(e) => setReviewText(e.target.value)}
//                 />
//                 <Button
//                   onClick={() => {
//                     if (!reviewText.trim()) return;
//                     toast.success("Review submitted");
//                     setReviewText("");
//                   }}
//                 >
//                   Submit
//                 </Button>
//               </TabsContent>
//             </Tabs>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default ProductDetailsDialog;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  Plus,
  Minus,
  X,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setProductDetails } from "@/store/shop/products-slice";
import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Progress } from "../ui/progress";
import { inventoryStatus } from "@/config";

function ProductDetailsDialog({
  open,
  setOpen,
  productDetails,
  handleAddtoCart,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems, isLoading: wishlistLoading } = useSelector(
    (state) => state.wishlist || { items: [], isLoading: false }
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("details");
  const [reviewText, setReviewText] = useState("");
  const [maxAllowedQuantity, setMaxAllowedQuantity] = useState(1);
  
  // Calculate derived state based on productDetails
  const {
    totalStock = 0,
    availableStock = 0,
    lowStockThreshold = 5,
    isActive = true,
    showOutOfStock = true,
    isOnSale = false
  } = productDetails || {};
  
  const isInWishlist = productDetails ? wishlistItems?.some(
    (item) =>
      item.product?._id === productDetails._id ||
      item.product?.productId === productDetails._id ||
      item.productId === productDetails._id
  ) : false;

  // Determine stock status - make it safe for null productDetails
  const getStockStatus = () => {
    if (!productDetails || !isActive) {
      return inventoryStatus['out-of-stock'];
    }
    
    if (availableStock <= 0) {
      return inventoryStatus['out-of-stock'];
    }
    
    if (availableStock <= lowStockThreshold) {
      return inventoryStatus['low-stock'];
    }
    
    return inventoryStatus['in-stock'];
  };

  const stockStatus = getStockStatus();
  const canAddToCart = productDetails && isActive && availableStock > 0;
  const isLowStock = productDetails && availableStock > 0 && availableStock <= lowStockThreshold;

  // Update max allowed quantity and reset quantity when product changes
  useEffect(() => {
    if (productDetails) {
      const maxQty = canAddToCart ? availableStock : 1;
      setMaxAllowedQuantity(maxQty);
      setQuantity(Math.min(quantity, maxQty));
    }
  }, [productDetails, availableStock, canAddToCart]);

  function handleDialogClose() {
    setOpen(false);
    setQuantity(1);
    dispatch(setProductDetails());
  }

  const incrementQuantity = () => {
    if (quantity < maxAllowedQuantity) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.warning(`Maximum ${maxAllowedQuantity} item(s) available`);
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    if (!productDetails) return;
    
    if (!canAddToCart) {
      if (!isActive) {
        toast.error("This product is currently unavailable");
      } else {
        toast.error("This product is out of stock");
      }
      return;
    }

    if (isLowStock) {
      toast.warning(`Only ${availableStock} item(s) left in stock!`, {
        duration: 3000,
      });
    }

    // Check if requested quantity exceeds available stock
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} item(s) available. Adjusting quantity.`);
      setQuantity(availableStock);
      return;
    }

    handleAddtoCart({ ...productDetails, quantity });
    handleDialogClose();
  };

  const handleWishlistToggle = () => {
    if (!user?.id) {
      toast.info("Please login to save items");
      return;
    }
    
    if (!productDetails) return;

    const action = isInWishlist
      ? removeFromWishlist(productDetails._id)
      : addToWishlist(productDetails._id);

    dispatch(action)
      .unwrap()
      .then(() =>
        toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist")
      )
      .catch(() => toast.error("Action failed"));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  // EARLY RETURN - MUST BE AFTER ALL HOOKS
  if (!productDetails) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleDialogClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[90vh]">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDialogClose}
          className="absolute right-3 top-3 z-10"
        >
          <X />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Image */}
          <div className="bg-muted relative">
            <img
              src={productDetails.image || "https://via.placeholder.com/600"}
              alt={productDetails.title}
              className="w-full h-full object-cover max-h-[70vh]"
            />
            
            {/* Stock Status Overlay */}
            <div className="absolute top-3 left-3">
              <Badge 
                className={`${stockStatus.badgeColor} text-sm font-semibold px-3 py-1.5`}
                variant="secondary"
              >
                {stockStatus.icon} {stockStatus.label}
              </Badge>
            </div>
            
            {/* Sale Badge */}
            {isOnSale && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-red-600 text-white text-sm font-semibold px-3 py-1.5">
                  SALE
                </Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 overflow-y-auto">
            {/* Stock Information */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Stock Information</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available:</span>
                  <span className={`font-medium ${stockStatus.color}`}>
                    {availableStock} item(s)
                  </span>
                </div>
                
                {totalStock > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Stock:</span>
                      <span className="font-medium">{totalStock} item(s)</span>
                    </div>
                    
                    {/* Stock Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Stock Level</span>
                        <span>{Math.round((availableStock / totalStock) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(availableStock / totalStock) * 100} 
                        className="h-2"
                        indicatorClassName={
                          availableStock <= 0 ? 'bg-red-500' :
                          isLowStock ? 'bg-amber-500' : 'bg-green-500'
                        }
                      />
                    </div>
                    
                    {isLowStock && availableStock > 0 && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          Low stock warning! Only {availableStock} item(s) remaining.
                        </span>
                      </div>
                    )}
                    
                    {availableStock <= 0 && showOutOfStock && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs text-red-700 dark:text-red-300">
                          Currently out of stock. Check back soon!
                        </span>
                      </div>
                    )}
                    
                    {availableStock <= 0 && !showOutOfStock && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Product hidden when out of stock
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold mb-2">
              {productDetails.title}
            </DialogTitle>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(productDetails.rating || 4)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  )}
                />
              ))}
              <span className="text-muted-foreground">
                {productDetails.rating || 4.7}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                ₵{isOnSale ? productDetails.salePrice : productDetails.price}
              </span>
              {isOnSale && (
                <span className="ml-3 line-through text-muted-foreground">
                  ₵{productDetails.price}
                </span>
              )}
            </div>

            <Separator className="my-6" />

            {/* Quantity Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Quantity</span>
                <span className="text-sm text-gray-500">
                  Max: {maxAllowedQuantity}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus />
                </Button>
                <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={incrementQuantity}
                  disabled={quantity >= maxAllowedQuantity}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={cn(
                  !canAddToCart && "opacity-50 cursor-not-allowed"
                )}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {canAddToCart ? (
                  <>
                    Add to Cart
                    {isLowStock && (
                      <span className="ml-1 text-xs">({availableStock} left)</span>
                    )}
                  </>
                ) : (
                  "Out of Stock"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <Heart
                  className={cn(
                    "mr-2 h-5 w-5",
                    isInWishlist && "fill-red-500 text-red-500"
                  )}
                />
                {isInWishlist ? "Saved" : "Save"}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full mb-8"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 text-sm space-y-2">
                <p>{productDetails.description || "No description available."}</p>
                <div className="pt-4 border-t">
                  <p className="font-medium mb-1">Product Status:</p>
                  <Badge variant={isActive ? "default" : "secondary"} className="mb-2">
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {isActive 
                      ? "This product is currently available for purchase."
                      : "This product is not currently available for purchase."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-medium">Category</p>
                    <p>{productDetails.category || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Brand</p>
                    <p>{productDetails.brand || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Low Stock Threshold</p>
                    <p>{lowStockThreshold} item(s)</p>
                  </div>
                  <div>
                    <p className="font-medium">Show When Out of Stock</p>
                    <p>{showOutOfStock ? "Yes" : "No"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-4">
                <Textarea
                  placeholder="Write a review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (!reviewText.trim()) return;
                    toast.success("Review submitted");
                    setReviewText("");
                  }}
                >
                  Submit
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
