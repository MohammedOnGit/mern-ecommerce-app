// // import React, { useState, useMemo, useCallback } from "react";
// // import { Star, Package, Percent, Heart } from "lucide-react";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { cn } from "@/lib/utils";
// // import { useDispatch, useSelector } from "react-redux";
// // import { toast } from "sonner";
// // import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";

// // function ShoppingProductTile({ product, handleGetProductDetails, handleAddtoCart }) {
// //   const dispatch = useDispatch();
// //   const { user } = useSelector((state) => state.auth);
// //   const { items: wishlistItems, isLoading: wishlistLoading } = useSelector(
// //     (state) => state.wishlist || { items: [], isLoading: false }
// //   );

// //   const [localWishlistLoading, setLocalWishlistLoading] = useState(false);

// //   // Discount percentage
// //   const discountPercentage = useMemo(() => {
// //     if (!product?.price || !product?.salePrice) return 0;
// //     return Math.round(((product.price - product.salePrice) / product.price) * 100);
// //   }, [product?.price, product?.salePrice]);

// //   // Check if product is in wishlist
// //   const isInWishlist = useMemo(() => {
// //     if (!wishlistItems || !product) return false;
// //     const productId = product._id || product.id;
// //     return wishlistItems.some(
// //       (item) => (item.product?._id || item._id || item.productId) === productId
// //     );
// //   }, [wishlistItems, product]);

// //   // Toggle wishlist
// //   const handleWishlistToggle = useCallback(
// //     async (e) => {
// //       e.preventDefault();
// //       e.stopPropagation();
// //       e.nativeEvent.stopImmediatePropagation();

// //       if (!user?.id) return toast.info("Please login to save items");
// //       const productId = product?._id || product?.id;
// //       if (!productId) return toast.error("Product information is missing");

// //       setLocalWishlistLoading(true);
// //       try {
// //         if (isInWishlist) {
// //           await dispatch(removeFromWishlist(productId)).unwrap();
// //           toast.success("Removed from wishlist");
// //         } else {
// //           await dispatch(addToWishlist(productId)).unwrap();
// //           toast.success("Added to wishlist");
// //         }
// //       } catch (err) {
// //         console.error(err);
// //         toast.error(err?.message || "Failed to update wishlist");
// //       } finally {
// //         setLocalWishlistLoading(false);
// //       }
// //     },
// //     [dispatch, isInWishlist, product, user?.id]
// //   );

// //   // Cart & details handlers
// //   const handleAddToCart = useCallback(
// //     (e) => {
// //       e.preventDefault();
// //       e.stopPropagation();
// //       e.nativeEvent.stopImmediatePropagation();
// //       handleAddtoCart(product);
// //     },
// //     [handleAddtoCart, product]
// //   );

// //   const handleViewDetails = useCallback(
// //     (e) => {
// //       e.preventDefault();
// //       e.stopPropagation();
// //       e.nativeEvent.stopImmediatePropagation();
// //       handleGetProductDetails(product._id || product.id);
// //     },
// //     [handleGetProductDetails, product]
// //   );

// //   const handleOpenDetails = useCallback(
// //     (e) => {
// //       e.stopPropagation();
// //       handleGetProductDetails(product._id || product.id);
// //     },
// //     [handleGetProductDetails, product]
// //   );

// //   return (
// //     <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border">
// //       {/* Image */}
// //       <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer" onClick={handleOpenDetails}>
// //         <img
// //           src={product.image || "https://via.placeholder.com/400x400?text=Product"}
// //           alt={product.title}
// //           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
// //           onError={(e) => (e.target.src = "https://via.placeholder.com/400x400?text=No+Image")}
// //         />

// //         {/* Discount Badge */}
// //         {discountPercentage > 0 && (
// //           <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-xs font-bold">
// //             <Percent className="h-3 w-3 mr-1" /> {discountPercentage}% OFF
// //           </Badge>
// //         )}

// //         {/* Wishlist */}
// //         <Button
// //           variant="ghost"
// //           size="icon"
// //           onClick={handleWishlistToggle}
// //           disabled={localWishlistLoading || wishlistLoading}
// //           className={cn(
// //             "absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200",
// //             "hover:bg-white hover:scale-110 shadow-md",
// //             isInWishlist && "bg-red-50 hover:bg-red-100",
// //             (localWishlistLoading || wishlistLoading) && "cursor-not-allowed"
// //           )}
// //           aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
// //         >
// //           {localWishlistLoading ? (
// //             <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
// //           ) : (
// //             <Heart
// //               className={cn(
// //                 "h-4 w-4 transition-colors",
// //                 isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
// //               )}
// //             />
// //           )}
// //         </Button>

// //         {/* Quick Add to Cart overlay */}
// //         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
// //           <div className="w-full px-4 pb-4">
// //             <Button
// //               onClick={handleAddToCart}
// //               className="w-full bg-white text-black hover:bg-white/90 font-medium"
// //               size="sm"
// //             >
// //               <Package className="h-4 w-4 mr-2" /> Add to Cart
// //             </Button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Product Info */}
// //       <CardContent className="p-4 space-y-3">
// //         {/* Category & Brand */}
// //         <div className="flex items-center justify-between">
// //           <Badge variant="outline" className="text-xs">{product.category || "Uncategorized"}</Badge>
// //           {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
// //         </div>

// //         {/* Title */}
// //         <h3
// //           className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
// //           onClick={handleViewDetails}
// //         >
// //           {product.title}
// //         </h3>

// //         {/* Description */}
// //         <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

// //         {/* Rating */}
// //         <div className="flex items-center gap-1">
// //           <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
// //           <span className="text-sm font-medium">{product.rating?.toFixed(1) || "4.5"}</span>
// //           <span className="text-xs text-muted-foreground">({product.reviews || 0} reviews)</span>
// //         </div>

// //         {/* Price */}
// //         <div className="flex items-baseline gap-2">
// //           <span className="text-xl font-bold">₵{product.salePrice || product.price}</span>
// //           {product.salePrice && (
// //             <>
// //               <span className="text-sm text-muted-foreground line-through">₵{product.price}</span>
// //               <span className="text-sm font-semibold text-green-600">
// //                 Save ₵{(product.price - product.salePrice).toFixed(2)}
// //               </span>
// //             </>
// //           )}
// //         </div>

// //         {/* Stock */}
// //         <div className="text-xs">
// //           {product.totalStock > 0 ? (
// //             <span className="text-green-600">In Stock ({product.totalStock} available)</span>
// //           ) : (
// //             <span className="text-red-600">Out of Stock</span>
// //           )}
// //         </div>

// //         {/* Actions */}
// //         <div className="flex gap-2 pt-2">
// //           <Button onClick={handleViewDetails} variant="outline" className="flex-1">View Details</Button>
// //           <Button onClick={handleAddToCart} className="flex-1 gap-2" disabled={product.totalStock <= 0}>
// //             <Package className="h-4 w-4" /> Add to Cart
// //           </Button>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   );
// // }

// // export default ShoppingProductTile;


// // // Update your ShoppingProductTile component
// // import React, { useState, useMemo, useCallback } from "react";
// // import { Star, Package, Percent, Heart, AlertCircle, CheckCircle } from "lucide-react";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { cn } from "@/lib/utils";
// // import { useDispatch, useSelector } from "react-redux";
// // import { toast } from "sonner";
// // import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";

// // function ShoppingProductTile({ product, handleGetProductDetails, handleAddtoCart }) {
// //   const dispatch = useDispatch();
// //   const { user } = useSelector((state) => state.auth);
// //   const { items: wishlistItems, isLoading: wishlistLoading } = useSelector(
// //     (state) => state.wishlist || { items: [], isLoading: false }
// //   );

// //   const [localWishlistLoading, setLocalWishlistLoading] = useState(false);

// //   // Calculate stock information
// //   const stockInfo = useMemo(() => {
// //     const totalStock = product.totalStock || 0;
// //     const reservedStock = product.reservedStock || 0;
// //     const availableStock = product.availableStock || (totalStock - reservedStock);
// //     const lowStockThreshold = product.lowStockThreshold || 5;
// //     const allowBackorders = product.allowBackorders || false;
// //     const isActive = product.isActive !== false;
    
// //     const isOutOfStock = totalStock <= 0;
// //     const isLowStock = availableStock > 0 && availableStock <= lowStockThreshold;
// //     const isAvailable = allowBackorders ? true : availableStock > 0;
// //     const isBackorder = allowBackorders && availableStock <= 0;
    
// //     let status = 'in-stock';
// //     let statusColor = 'text-green-600';
// //     let badgeColor = 'bg-green-100 text-green-800';
// //     let statusText = `In Stock (${availableStock} available)`;
    
// //     if (isBackorder) {
// //       status = 'backorder';
// //       statusColor = 'text-amber-600';
// //       badgeColor = 'bg-amber-100 text-amber-800';
// //       statusText = 'Available on Backorder';
// //     } else if (isOutOfStock && !allowBackorders) {
// //       status = 'out-of-stock';
// //       statusColor = 'text-red-600';
// //       badgeColor = 'bg-red-100 text-red-800';
// //       statusText = 'Out of Stock';
// //     } else if (isLowStock) {
// //       status = 'low-stock';
// //       statusColor = 'text-amber-600';
// //       badgeColor = 'bg-amber-100 text-amber-800';
// //       statusText = `Low Stock (${availableStock} left)`;
// //     }
    
// //     return {
// //       totalStock,
// //       reservedStock,
// //       availableStock,
// //       lowStockThreshold,
// //       allowBackorders,
// //       isActive,
// //       isOutOfStock,
// //       isLowStock,
// //       isAvailable,
// //       isBackorder,
// //       status,
// //       statusColor,
// //       badgeColor,
// //       statusText
// //     };
// //   }, [product]);

// //   // Discount percentage
// //   const discountPercentage = useMemo(() => {
// //     if (!product?.price || !product?.salePrice) return 0;
// //     return Math.round(((product.price - product.salePrice) / product.price) * 100);
// //   }, [product?.price, product?.salePrice]);

// //   // Check if product is in wishlist
// //   const isInWishlist = useMemo(() => {
// //     if (!wishlistItems || !product) return false;
// //     const productId = product._id || product.id;
// //     return wishlistItems.some(
// //       (item) => (item.product?._id || item._id || item.productId) === productId
// //     );
// //   }, [wishlistItems, product]);

// //   // Toggle wishlist
// //   const handleWishlistToggle = useCallback(
// //     async (e) => {
// //       e.preventDefault();
// //       e.stopPropagation();
// //       e.nativeEvent.stopImmediatePropagation();

// //       if (!user?.id) return toast.info("Please login to save items");
// //       const productId = product?._id || product?.id;
// //       if (!productId) return toast.error("Product information is missing");

// //       setLocalWishlistLoading(true);
// //       try {
// //         if (isInWishlist) {
// //           await dispatch(removeFromWishlist(productId)).unwrap();
// //           toast.success("Removed from wishlist");
// //         } else {
// //           await dispatch(addToWishlist(productId)).unwrap();
// //           toast.success("Added to wishlist");
// //         }
// //       } catch (err) {
// //         console.error(err);
// //         toast.error(err?.message || "Failed to update wishlist");
// //       } finally {
// //         setLocalWishlistLoading(false);
// //       }
// //     },
// //     [dispatch, isInWishlist, product, user?.id]
// //   );

// //   // Cart & details handlers
// //   const handleAddToCart = useCallback(
// //     (e) => {
// //       e.preventDefault();
// //       e.stopPropagation();
// //       e.nativeEvent.stopImmediatePropagation();
      
// //       // Check stock before adding to cart
// //       if (!stockInfo.isAvailable && !stockInfo.allowBackorders) {
// //         toast.error("Product is out of stock");
// //         return;
// //       }
      
// //       if (stockInfo.isLowStock && !stockInfo.allowBackorders) {
// //         toast.warning(`Only ${stockInfo.availableStock} left in stock!`, {
// //           duration: 3000
// //         });
// //       }
      
// //       if (stockInfo.isBackorder) {
// //         toast.info("This item is on backorder. Delivery may take longer.", {
// //           duration: 4000
// //         });
// //       }
      
// //       handleAddtoCart(product);
// //     },
// //     [handleAddtoCart, product, stockInfo]
// //   );

// //   const handleViewDetails = useCallback(
// //     (e) => {
// //       e.preventDefault();
// //       e.stopPropagation();
// //       e.nativeEvent.stopImmediatePropagation();
// //       handleGetProductDetails(product._id || product.id);
// //     },
// //     [handleGetProductDetails, product]
// //   );

// //   const handleOpenDetails = useCallback(
// //     (e) => {
// //       e.stopPropagation();
// //       handleGetProductDetails(product._id || product.id);
// //     },
// //     [handleGetProductDetails, product]
// //   );

// //   return (
// //     <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border">
// //       {/* Image */}
// //       <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer" onClick={handleOpenDetails}>
// //         <img
// //           src={product.image || "https://via.placeholder.com/400x400?text=Product"}
// //           alt={product.title}
// //           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
// //           onError={(e) => (e.target.src = "https://via.placeholder.com/400x400?text=No+Image")}
// //         />

// //         {/* Discount Badge */}
// //         {discountPercentage > 0 && (
// //           <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-xs font-bold">
// //             <Percent className="h-3 w-3 mr-1" /> {discountPercentage}% OFF
// //           </Badge>
// //         )}

// //         {/* Stock Status Badge */}
// //         <Badge className={`absolute top-3 right-3 ${stockInfo.badgeColor} text-xs font-bold`}>
// //           {stockInfo.status === 'out-of-stock' && <AlertCircle className="h-3 w-3 mr-1" />}
// //           {stockInfo.status === 'backorder' && <AlertCircle className="h-3 w-3 mr-1" />}
// //           {stockInfo.status === 'low-stock' && <AlertCircle className="h-3 w-3 mr-1" />}
// //           {stockInfo.status === 'in-stock' && <CheckCircle className="h-3 w-3 mr-1" />}
// //           {stockInfo.statusText}
// //         </Badge>

// //         {/* Wishlist */}
// //         <Button
// //           variant="ghost"
// //           size="icon"
// //           onClick={handleWishlistToggle}
// //           disabled={localWishlistLoading || wishlistLoading}
// //           className={cn(
// //             "absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200",
// //             "hover:bg-white hover:scale-110 shadow-md",
// //             isInWishlist && "bg-red-50 hover:bg-red-100",
// //             (localWishlistLoading || wishlistLoading) && "cursor-not-allowed"
// //           )}
// //           aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
// //         >
// //           {localWishlistLoading ? (
// //             <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
// //           ) : (
// //             <Heart
// //               className={cn(
// //                 "h-4 w-4 transition-colors",
// //                 isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
// //               )}
// //             />
// //           )}
// //         </Button>

// //         {/* Quick Add to Cart overlay */}
// //         {stockInfo.isAvailable || stockInfo.allowBackorders ? (
// //           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
// //             <div className="w-full px-4 pb-4">
// //               <Button
// //                 onClick={handleAddToCart}
// //                 className="w-full bg-white text-black hover:bg-white/90 font-medium"
// //                 size="sm"
// //                 disabled={!stockInfo.isAvailable && !stockInfo.allowBackorders}
// //               >
// //                 <Package className="h-4 w-4 mr-2" />
// //                 {stockInfo.isBackorder ? "Backorder" : "Add to Cart"}
// //               </Button>
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
// //             <div className="text-white text-center p-4">
// //               <AlertCircle className="h-8 w-8 mx-auto mb-2" />
// //               <p className="font-semibold">Out of Stock</p>
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* Product Info */}
// //       <CardContent className="p-4 space-y-3">
// //         {/* Category & Brand */}
// //         <div className="flex items-center justify-between">
// //           <Badge variant="outline" className="text-xs">{product.category || "Uncategorized"}</Badge>
// //           {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
// //         </div>

// //         {/* Title */}
// //         <h3
// //           className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
// //           onClick={handleViewDetails}
// //         >
// //           {product.title}
// //         </h3>

// //         {/* Description */}
// //         <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

// //         {/* Rating */}
// //         <div className="flex items-center gap-1">
// //           <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
// //           <span className="text-sm font-medium">{product.rating?.toFixed(1) || "4.5"}</span>
// //           <span className="text-xs text-muted-foreground">({product.reviews || 0} reviews)</span>
// //         </div>

// //         {/* Price */}
// //         <div className="flex items-baseline gap-2">
// //           <span className="text-xl font-bold">₵{product.salePrice || product.price}</span>
// //           {product.salePrice && (
// //             <>
// //               <span className="text-sm text-muted-foreground line-through">₵{product.price}</span>
// //               <span className="text-sm font-semibold text-green-600">
// //                 Save ₵{(product.price - product.salePrice).toFixed(2)}
// //               </span>
// //             </>
// //           )}
// //         </div>

// //         {/* Stock Details */}
// //         <div className="text-xs space-y-1">
// //           <div className={`font-medium ${stockInfo.statusColor}`}>
// //             {stockInfo.statusText}
// //           </div>
// //           {stockInfo.isLowStock && !stockInfo.allowBackorders && (
// //             <div className="text-amber-600">
// //               ⚠️ Selling fast!
// //             </div>
// //           )}
// //           {stockInfo.isBackorder && (
// //             <div className="text-amber-600">
// //               📦 Will ship when available
// //             </div>
// //           )}
// //         </div>

// //         {/* Actions */}
// //         <div className="flex gap-2 pt-2">
// //           <Button 
// //             onClick={handleViewDetails} 
// //             variant="outline" 
// //             className="flex-1"
// //           >
// //             View Details
// //           </Button>
// //           <Button 
// //             onClick={handleAddToCart} 
// //             className="flex-1 gap-2" 
// //             disabled={!stockInfo.isAvailable && !stockInfo.allowBackorders}
// //           >
// //             <Package className="h-4 w-4" />
// //             {stockInfo.isBackorder ? "Backorder" : 
// //              !stockInfo.isAvailable && !stockInfo.allowBackorders ? "Out of Stock" : "Add to Cart"}
// //           </Button>
// //         </div>
// //       </CardContent>
// //     </Card>
// //   );
// // }

// // export default ShoppingProductTile;






// import React from "react";
// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ShoppingBag, Eye, Heart, AlertCircle, Package } from "lucide-react";
// import { toast } from "sonner";
// import { inventoryStatus } from "@/config";
// import { cn } from "@/lib/utils";

// // Helper function to determine stock status
// const getStockStatus = (product) => {
//   const totalStock = product.totalStock || 0;
//   const availableStock = product.availableStock || totalStock;
//   const lowStockThreshold = product.lowStockThreshold || 5;
//   const isActive = product.isActive !== false;
  
//   if (!isActive) {
//     return inventoryStatus['out-of-stock'];
//   }
  
//   if (availableStock <= 0) {
//     return inventoryStatus['out-of-stock'];
//   }
  
//   if (availableStock <= lowStockThreshold) {
//     return inventoryStatus['low-stock'];
//   }
  
//   return inventoryStatus['in-stock'];
// };

// const ShoppingProductTile = ({ 
//   product, 
//   handleGetProductDetails, 
//   handleAddtoCart,
//   isOutOfStock: propIsOutOfStock 
// }) => {
//   const stockStatus = getStockStatus(product);
//   const totalStock = product.totalStock || 0;
//   const availableStock = product.availableStock || totalStock;
//   const lowStockThreshold = product.lowStockThreshold || 5;
//   const isActive = product.isActive !== false;
//   const showOutOfStock = product.showOutOfStock !== false;
//   const allowBackorders = product.allowBackorders || false;
  
//   // Determine if product can be added to cart
//   const canAddToCart = isActive && (availableStock > 0 || allowBackorders);
//   const isLowStock = availableStock > 0 && availableStock <= lowStockThreshold;
//   const isOutOfStock = availableStock <= 0 && !allowBackorders;
  
//   const handleAddToCartClick = (e) => {
//     e.stopPropagation();
    
//     if (!canAddToCart) {
//       if (!isActive) {
//         toast.error("This product is currently unavailable");
//       } else {
//         toast.error("This product is out of stock");
//       }
//       return;
//     }
    
//     // Check if product allows backorders
//     if (allowBackorders && availableStock <= 0) {
//       toast.info("This item is on backorder. It will ship when available.", {
//         duration: 4000,
//       });
//     }
    
//     // Show low stock warning
//     if (isLowStock) {
//       toast.warning(`Only ${availableStock} item(s) left in stock!`, {
//         duration: 3000,
//       });
//     }
    
//     // Check if there's enough stock
//     if (availableStock <= 0 && !allowBackorders) {
//       toast.error("This product is out of stock");
//       return;
//     }
    
//     // Add to cart with quantity 1
//     handleAddtoCart({ ...product, quantity: 1 });
//   };
  
//   const handleViewDetailsClick = (e) => {
//     e.stopPropagation();
//     handleGetProductDetails(product._id);
//   };

//   return (
//     <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800">
//       {/* Stock Status Badge */}
//       <div className="absolute top-2 left-2 z-10">
//         <Badge 
//           className={`${stockStatus.badgeColor} text-xs font-semibold px-2 py-1`}
//           variant="secondary"
//         >
//           {stockStatus.icon} {stockStatus.label}
//         </Badge>
//       </div>
      
//       {/* Backorder Badge */}
//       {allowBackorders && availableStock <= 0 && (
//         <div className="absolute top-2 right-2 z-10">
//           <Badge 
//             className="bg-purple-600 text-white text-xs font-semibold px-2 py-1"
//             variant="secondary"
//           >
//             <Package className="h-3 w-3 mr-1" /> Backorder
//           </Badge>
//         </div>
//       )}
      
//       {/* Product Image */}
//       <CardHeader className="p-0 relative">
//         <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
//           <img
//             src={product.image}
//             alt={product.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//             loading="lazy"
//           />
//         </div>
        
//         {/* Out of Stock Overlay */}
//         {isOutOfStock && !showOutOfStock && (
//           <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
//             <Badge className="bg-destructive text-white font-bold px-4 py-2 text-sm">
//               Out of Stock
//             </Badge>
//           </div>
//         )}
        
//         {/* Quick Actions Overlay */}
//         <div className={cn(
//           "absolute inset-0 bg-black/0 transition-colors duration-300 flex items-center justify-center",
//           !isOutOfStock && "group-hover:bg-black/10 opacity-0 group-hover:opacity-100"
//         )}>
//           <div className="flex gap-2">
//             <Button
//               size="icon"
//               variant="secondary"
//               className="rounded-full bg-white/90 hover:bg-white shadow-lg hover:scale-110 transition-transform"
//               onClick={handleViewDetailsClick}
//               title="View details"
//             >
//               <Eye className="h-4 w-4" />
//             </Button>
//             <Button
//               size="icon"
//               variant="secondary"
//               className="rounded-full bg-white/90 hover:bg-white shadow-lg hover:scale-110 transition-transform"
//               title="Add to wishlist"
//             >
//               <Heart className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-4">
//         {/* Category/Brand */}
//         <div className="flex justify-between items-start mb-2">
//           <Badge variant="outline" className="text-xs">
//             {product.category}
//           </Badge>
//           <span className="text-xs text-gray-500 dark:text-gray-400">
//             {product.brand}
//           </span>
//         </div>

//         {/* Product Title */}
//         <h3 className="font-semibold text-sm md:text-base line-clamp-2 min-h-[2.5rem] mb-2 hover:text-primary cursor-pointer"
//             onClick={handleViewDetailsClick}>
//           {product.title}
//         </h3>

//         {/* Product Description */}
//         <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-3 min-h-[2rem]">
//           {product.description}
//         </p>

//         {/* Stock Information */}
//         <div className="mb-3">
//           <div className="flex items-center justify-between text-xs mb-2">
//             <span className="text-gray-500">Stock:</span>
//             <div className="flex items-center gap-1">
//               {allowBackorders && availableStock <= 0 ? (
//                 <span className="font-medium text-purple-600 flex items-center">
//                   <Package className="h-3 w-3 mr-1" /> Available for backorder
//                 </span>
//               ) : (
//                 <>
//                   <span className={cn("font-medium", stockStatus.color)}>
//                     {availableStock} available
//                   </span>
//                   {totalStock > 0 && availableStock < totalStock && (
//                     <span className="text-gray-400 text-xs">
//                       ({totalStock - availableStock} reserved)
//                     </span>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
          
//           {/* Stock Progress Bar */}
//           {totalStock > 0 && availableStock > 0 && (
//             <div className="mt-2">
//               <div className="flex justify-between text-xs mb-1">
//                 <span>Stock Level</span>
//                 <span>{Math.round((availableStock / totalStock) * 100)}%</span>
//               </div>
//               <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                 <div 
//                   className={`h-full ${
//                     availableStock <= 0 ? 'bg-red-500' :
//                     isLowStock ? 'bg-amber-500' : 'bg-green-500'
//                   }`}
//                   style={{ width: `${Math.min(100, (availableStock / totalStock) * 100)}%` }}
//                 />
//               </div>
              
//               {/* Stock Warnings */}
//               {isLowStock && availableStock > 0 && (
//                 <div className="flex items-center gap-1 mt-1">
//                   <AlertCircle className="h-3 w-3 text-amber-600" />
//                   <p className="text-xs text-amber-600 dark:text-amber-400">
//                     Low stock - Only {availableStock} left!
//                   </p>
//                 </div>
//               )}
              
//               {allowBackorders && availableStock <= 0 && (
//                 <div className="flex items-center gap-1 mt-1">
//                   <Package className="h-3 w-3 text-purple-600" />
//                   <p className="text-xs text-purple-600 dark:text-purple-400">
//                     Available for backorder
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Price */}
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-baseline gap-2">
//             <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
//               ₵{product.salePrice || product.price}
//             </span>
//             {product.salePrice && (
//               <span className="text-sm text-gray-500 line-through">
//                 ₵{product.price}
//               </span>
//             )}
//           </div>
//           {/* Rating */}
//           {product.rating > 0 && (
//             <div className="flex items-center">
//               <span className="text-xs text-amber-500">★</span>
//               <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
//                 {product.rating.toFixed(1)}
//               </span>
//             </div>
//           )}
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0">
//         <Button
//           className={cn(
//             "w-full gap-2 transition-all",
//             !canAddToCart 
//               ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed hover:bg-gray-300' 
//               : 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
//           )}
//           onClick={handleAddToCartClick}
//           disabled={!canAddToCart}
//           size="lg"
//         >
//           <ShoppingBag className="h-4 w-4" />
//           {!canAddToCart ? (
//             isActive ? "Out of Stock" : "Unavailable"
//           ) : (
//             <>
//               {allowBackorders && availableStock <= 0 ? "Backorder Now" : "Add to Cart"}
//               {isLowStock && availableStock > 0 && (
//                 <span className="ml-1 text-xs">({availableStock} left)</span>
//               )}
//             </>
//           )}
//         </Button>
//       </CardFooter>
      
//       {/* View Details Button */}
//       <div className="px-4 pb-4 pt-0">
//         <Button
//           variant="outline"
//           className="w-full hover:bg-gray-50 dark:hover:bg-gray-800"
//           onClick={handleViewDetailsClick}
//           size="sm"
//         >
//           View Details
//         </Button>
//       </div>
//     </Card>
//   );
// };

// export default ShoppingProductTile;


import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Eye, Heart, Package } from "lucide-react";
import { toast } from "sonner";
import { inventoryStatus } from "@/config";
import { cn } from "@/lib/utils";

/* ---------------- helpers ---------------- */

const getStockStatus = (product) => {
  const {
    availableStock = 0,
    lowStockThreshold = 5,
    isActive = true,
  } = product;

  if (!isActive || availableStock <= 0) {
    return inventoryStatus["out-of-stock"];
  }

  if (availableStock <= lowStockThreshold) {
    return inventoryStatus["low-stock"];
  }

  return inventoryStatus["in-stock"];
};

/* ---------------- component ---------------- */

const ShoppingProductTile = ({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) => {
  const {
    _id,
    title,
    image,
    description,
    category,
    brand,
    price,
    salePrice,
    rating = 0,
    availableStock = 0,
    allowBackorders = false,
    isActive = true,
  } = product;

  const stockStatus = getStockStatus(product);

  const isOutOfStock = availableStock <= 0 && !allowBackorders;
  const isLowStock = availableStock > 0 && stockStatus.key === "low-stock";
  const canAddToCart = isActive && (!isOutOfStock || allowBackorders);

  /* ---------------- handlers ---------------- */

  const handleAddToCartClick = (e) => {
    e.stopPropagation();

    if (!canAddToCart) {
      toast.error(isActive ? "Product is out of stock" : "Product unavailable");
      return;
    }

    if (allowBackorders && availableStock <= 0) {
      toast.info("This item is on backorder and will ship later");
    }

    if (isLowStock) {
      toast.warning(`Only ${availableStock} item(s) left`);
    }

    handleAddtoCart({ ...product, quantity: 1 });
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    handleGetProductDetails(_id);
  };

  /* ---------------- render ---------------- */

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition">
      {/* Stock Badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge
          className={cn(
            "text-xs font-semibold px-2 py-1",
            stockStatus.badgeColor
          )}
          variant="secondary"
        >
          {stockStatus.icon} {stockStatus.label}
        </Badge>
      </div>

      {/* Backorder Badge */}
      {allowBackorders && availableStock <= 0 && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
            <Package className="h-3 w-3 mr-1" /> Backorder
          </Badge>
        </div>
      )}

      {/* Image */}
      <CardHeader className="p-0 relative">
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        </div>

        {/* Quick actions */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 opacity-0 group-hover:opacity-100 transition">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              onClick={handleViewDetailsClick}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <Badge variant="outline">{category}</Badge>
          <span>{brand}</span>
        </div>

        <h3
          className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary"
          onClick={handleViewDetailsClick}
        >
          {title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Stock */}
        <p className={cn("text-xs", stockStatus.color)}>
          {allowBackorders && availableStock <= 0
            ? "Available for backorder"
            : `${availableStock} in stock`}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-baseline">
            <span className="text-lg font-bold">
              ₵{salePrice || price}
            </span>
            {salePrice && (
              <span className="text-sm line-through text-muted-foreground">
                ₵{price}
              </span>
            )}
          </div>

          {rating > 0 && (
            <span className="text-xs text-amber-500">
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 space-y-2">
        <Button
          onClick={handleAddToCartClick}
          disabled={!canAddToCart}
          className={cn(
            "w-full gap-2",
            !canAddToCart && "opacity-50 cursor-not-allowed"
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          {allowBackorders && availableStock <= 0
            ? "Backorder Now"
            : "Add to Cart"}
          {isLowStock && availableStock > 0 && (
            <span className="text-xs">({availableStock} left)</span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetailsClick}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShoppingProductTile;
