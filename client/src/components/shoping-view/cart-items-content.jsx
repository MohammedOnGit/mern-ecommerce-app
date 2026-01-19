// // import React, { useState, useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { Minus, Plus, Trash2, Heart } from "lucide-react";
// // import { Button } from "../ui/button";
// // import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
// // import { addToWishlist, removeFromWishlist, fetchWishlist } from "@/store/shop/wishlist-slice";
// // import { toast } from "sonner";
// // import { cn } from "@/lib/utils";

// // function UserCartItemsContent({ cartItem }) {
// //   const dispatch = useDispatch();
// //   const { user } = useSelector((state) => state.auth);
// //   const { items: wishlistItems, isLoading: wishlistLoading } = useSelector(
// //     (state) => state.wishlist || { items: [], isLoading: false }
// //   );

// //   const [isMovingToWishlist, setIsMovingToWishlist] = useState(false);
// //   const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
// //   const [isDeleting, setIsDeleting] = useState(false);

// //   useEffect(() => {
// //     if (user?.id) dispatch(fetchWishlist());
// //   }, [dispatch, user?.id]);

// //   const isOnSale = cartItem?.salePrice > 0;
// //   const displayPrice = isOnSale ? cartItem.salePrice : cartItem.price;
// //   const totalPrice = displayPrice * cartItem.quantity;

// //   const isInWishlist = React.useMemo(() => {
// //     const cartProductId = cartItem?.productId || cartItem?._id;
// //     return wishlistItems?.some(
// //       (item) => item.product?._id === cartProductId || item.productId === cartProductId
// //     );
// //   }, [wishlistItems, cartItem]);

// //   const handleCartItemDelete = async () => {
// //     if (!user?.id || !cartItem?.productId) return;
// //     setIsDeleting(true);
// //     try {
// //       await dispatch(deleteCartItem({ userId: user.id, productId: cartItem.productId })).unwrap();
// //       toast.success("Item removed");
// //     } catch {
// //       toast.error("Failed to remove item");
// //     } finally {
// //       setIsDeleting(false);
// //     }
// //   };

// //   const handleUpdateQuantity = async (type) => {
// //     if (!user?.id || !cartItem?.productId) return;
// //     if (type === "decrement" && cartItem.quantity === 1) return;

// //     setIsUpdatingQuantity(true);
// //     const quantity = type === "increment" ? cartItem.quantity + 1 : cartItem.quantity - 1;

// //     try {
// //       await dispatch(updateCartQuantity({ userId: user.id, productId: cartItem.productId, quantity })).unwrap();
// //     } catch {
// //       toast.error("Failed to update cart");
// //     } finally {
// //       setIsUpdatingQuantity(false);
// //     }
// //   };

// //   const moveToWishlist = async () => {
// //     if (!user?.id) return toast.info("Please login");
// //     const productId = cartItem?.productId || cartItem?._id;
// //     setIsMovingToWishlist(true);

// //     try {
// //       if (isInWishlist) {
// //         await dispatch(removeFromWishlist(productId)).unwrap();
// //         toast.success("Removed from wishlist");
// //       } else {
// //         await dispatch(addToWishlist(productId)).unwrap();
// //         await handleCartItemDelete();
// //         toast.success("Moved to wishlist");
// //       }
// //     } catch {
// //       toast.error("Wishlist update failed");
// //     } finally {
// //       setIsMovingToWishlist(false);
// //     }
// //   };

// //   return (
// //     <div className="flex gap-4 py-4 border-b">
// //       {/* Image */}
// //       <img
// //         src={cartItem?.image || "https://via.placeholder.com/80"}
// //         alt={cartItem?.title}
// //         className="h-20 w-20 rounded-md object-cover bg-muted"
// //         loading="lazy"
// //       />

// //       {/* Info */}
// //       <div className="flex-1">
// //         <h3 className="text-sm font-medium line-clamp-2">{cartItem?.title}</h3>
// //         <div className="flex items-center gap-2 mt-1">
// //           <span className="text-sm font-semibold text-primary">GHC {displayPrice.toFixed(2)}</span>
// //           {isOnSale && <span className="text-xs line-through text-muted-foreground">GHC {cartItem.price.toFixed(2)}</span>}
// //         </div>

// //         <div className="flex items-center gap-2 mt-3">
// //           <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleUpdateQuantity("decrement")} disabled={isUpdatingQuantity || cartItem.quantity === 1}>
// //             <Minus className="h-3 w-3" />
// //           </Button>

// //           <span className="text-sm font-medium">{cartItem.quantity}</span>

// //           <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleUpdateQuantity("increment")} disabled={isUpdatingQuantity}>
// //             <Plus className="h-3 w-3" />
// //           </Button>

// //           <Button variant="ghost" size="sm" className={cn("text-xs", isInWishlist && "text-red-500")} onClick={moveToWishlist} disabled={isMovingToWishlist || wishlistLoading}>
// //             <Heart className={cn("h-3 w-3 mr-1", isInWishlist && "fill-red-500")} />
// //             Save
// //           </Button>
// //         </div>
// //       </div>

// //       {/* Price + Delete */}
// //       <div className="flex flex-col items-end justify-between">
// //         <p className="font-semibold text-primary">GHC {totalPrice.toFixed(2)}</p>
// //         <Button size="icon" variant="ghost" onClick={handleCartItemDelete} disabled={isDeleting} className="text-muted-foreground hover:text-destructive">
// //           <Trash2 className="h-4 w-4" />
// //         </Button>
// //       </div>
// //     </div>
// //   );
// // }

// // export default UserCartItemsContent;

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Minus, Plus, Trash2, Heart, AlertCircle, Package } from "lucide-react";
// import { Button } from "../ui/button";
// import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
// import { addToWishlist, removeFromWishlist, fetchWishlist } from "@/store/shop/wishlist-slice";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { Badge } from "../ui/badge";

// function UserCartItemsContent({ cartItem }) {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { items: wishlistItems, isLoading: wishlistLoading } = useSelector(
//     (state) => state.wishlist || { items: [], isLoading: false }
//   );

//   const [isMovingToWishlist, setIsMovingToWishlist] = useState(false);
//   const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [stockInfo, setStockInfo] = useState(null);

//   useEffect(() => {
//     if (user?.id) dispatch(fetchWishlist());
    
//     // Fetch stock information for this item
//     if (cartItem?.productId) {
//       fetchStockInfo();
//     }
//   }, [dispatch, user?.id, cartItem?.productId]);

//   const fetchStockInfo = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/shop/products/get/${cartItem.productId}`);
//       const data = await response.json();
//       if (data.success && data.data) {
//         const product = data.data;
//         const availableStock = product.availableStock || product.totalStock || 0;
//         const totalStock = product.totalStock || 0;
//         const lowStockThreshold = product.lowStockThreshold || 5;
//         const isLowStock = availableStock > 0 && availableStock <= lowStockThreshold;
        
//         setStockInfo({
//           availableStock,
//           totalStock,
//           isLowStock,
//           lowStockThreshold,
//           isActive: product.isActive !== false,
//           allowBackorders: product.allowBackorders || false
//         });
//       }
//     } catch (error) {
//       console.error("Failed to fetch stock info:", error);
//     }
//   };

//   const isOnSale = cartItem?.salePrice > 0;
//   const displayPrice = isOnSale ? cartItem.salePrice : cartItem.price;
//   const totalPrice = displayPrice * cartItem.quantity;

//   const isInWishlist = React.useMemo(() => {
//     const cartProductId = cartItem?.productId || cartItem?._id;
//     return wishlistItems?.some(
//       (item) => item.product?._id === cartProductId || item.productId === cartProductId
//     );
//   }, [wishlistItems, cartItem]);

//   // Check if current quantity exceeds available stock
//   const exceedsAvailableStock = stockInfo && 
//     !stockInfo.allowBackorders && 
//     cartItem.quantity > stockInfo.availableStock;

//   const handleCartItemDelete = async () => {
//     if (!user?.id || !cartItem?.productId) return;
//     setIsDeleting(true);
//     try {
//       await dispatch(deleteCartItem({ userId: user.id, productId: cartItem.productId })).unwrap();
//       toast.success("Item removed from cart");
//     } catch (error) {
//       toast.error(error.message || "Failed to remove item");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleUpdateQuantity = async (type) => {
//     if (!user?.id || !cartItem?.productId) return;
    
//     // Prevent going below 1
//     if (type === "decrement" && cartItem.quantity === 1) {
//       toast.error("Minimum quantity is 1. Remove item instead.");
//       return;
//     }

//     const newQuantity = type === "increment" ? cartItem.quantity + 1 : cartItem.quantity - 1;
    
//     // ✅ INVENTORY VALIDATION: Check if new quantity exceeds available stock
//     if (stockInfo && !stockInfo.allowBackorders && newQuantity > stockInfo.availableStock) {
//       toast.error(`Only ${stockInfo.availableStock} item(s) available in stock`);
//       return;
//     }

//     setIsUpdatingQuantity(true);
//     try {
//       await dispatch(updateCartQuantity({ 
//         userId: user.id, 
//         productId: cartItem.productId, 
//         quantity: newQuantity 
//       })).unwrap();
//     } catch (error) {
//       toast.error(error.message || "Failed to update cart");
//     } finally {
//       setIsUpdatingQuantity(false);
//     }
//   };

//   const moveToWishlist = async () => {
//     if (!user?.id) {
//       toast.info("Please login to save items");
//       return;
//     }
    
//     const productId = cartItem?.productId || cartItem?._id;
//     setIsMovingToWishlist(true);

//     try {
//       if (isInWishlist) {
//         await dispatch(removeFromWishlist(productId)).unwrap();
//         toast.success("Removed from wishlist");
//       } else {
//         await dispatch(addToWishlist(productId)).unwrap();
//         await handleCartItemDelete();
//         toast.success("Moved to wishlist");
//       }
//     } catch {
//       toast.error("Wishlist update failed");
//     } finally {
//       setIsMovingToWishlist(false);
//     }
//   };

//   return (
//     <div className="flex gap-4 py-4 border-b">
//       {/* Image */}
//       <div className="relative">
//         <img
//           src={cartItem?.image || "https://via.placeholder.com/80"}
//           alt={cartItem?.title}
//           className="h-20 w-20 rounded-md object-cover bg-muted"
//           loading="lazy"
//         />
        
//         {/* Stock Warning Badge */}
//         {exceedsAvailableStock && (
//           <div className="absolute -top-2 -left-2">
//             <Badge variant="destructive" className="text-xs px-2 py-1">
//               <AlertCircle className="h-3 w-3 mr-1" />
//               Stock Issue
//             </Badge>
//           </div>
//         )}
//       </div>

//       {/* Info */}
//       <div className="flex-1">
//         <div className="flex justify-between items-start">
//           <h3 className="text-sm font-medium line-clamp-2">{cartItem?.title}</h3>
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-semibold text-primary">GHC {displayPrice.toFixed(2)}</span>
//             {isOnSale && (
//               <span className="text-xs line-through text-muted-foreground">
//                 GHC {cartItem.price.toFixed(2)}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Stock Information */}
//         {stockInfo && (
//           <div className="mt-2 mb-3">
//             <div className="flex items-center gap-2 text-xs">
//               <Package className="h-3 w-3 text-gray-500" />
//               <span className={cn(
//                 "font-medium",
//                 exceedsAvailableStock ? "text-red-600" :
//                 stockInfo.isLowStock ? "text-amber-600" : "text-green-600"
//               )}>
//                 {exceedsAvailableStock 
//                   ? `Only ${stockInfo.availableStock} available (you have ${cartItem.quantity})`
//                   : stockInfo.isLowStock 
//                     ? `Low stock: ${stockInfo.availableStock} left`
//                     : `${stockInfo.availableStock} available`
//                 }
//               </span>
//             </div>
            
//             {/* Stock Progress Bar */}
//             {stockInfo.totalStock > 0 && (
//               <div className="mt-1">
//                 <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
//                   <div 
//                     className={cn(
//                       "h-full",
//                       exceedsAvailableStock ? "bg-red-500" :
//                       stockInfo.isLowStock ? "bg-amber-500" : "bg-green-500"
//                     )}
//                     style={{ 
//                       width: `${Math.min(100, (stockInfo.availableStock / stockInfo.totalStock) * 100)}%` 
//                     }}
//                   />
//                 </div>
//               </div>
//             )}
            
//             {/* Warning Message */}
//             {exceedsAvailableStock && (
//               <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
//                 <div className="flex items-center gap-1">
//                   <AlertCircle className="h-3 w-3" />
//                   <span>Quantity exceeds available stock. Please adjust quantity.</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         <div className="flex items-center gap-2 mt-3">
//           <Button 
//             size="icon" 
//             variant="outline" 
//             className="h-7 w-7" 
//             onClick={() => handleUpdateQuantity("decrement")} 
//             disabled={isUpdatingQuantity || cartItem.quantity === 1 || exceedsAvailableStock}
//           >
//             <Minus className="h-3 w-3" />
//           </Button>

//           <span className={cn(
//             "text-sm font-medium min-w-6 text-center",
//             exceedsAvailableStock && "text-red-600"
//           )}>
//             {cartItem.quantity}
//           </span>

//           <Button 
//             size="icon" 
//             variant="outline" 
//             className="h-7 w-7" 
//             onClick={() => handleUpdateQuantity("increment")} 
//             disabled={isUpdatingQuantity || exceedsAvailableStock}
//           >
//             <Plus className="h-3 w-3" />
//           </Button>

//           <Button 
//             variant="ghost" 
//             size="sm" 
//             className={cn("text-xs", isInWishlist && "text-red-500")} 
//             onClick={moveToWishlist} 
//             disabled={isMovingToWishlist || wishlistLoading || exceedsAvailableStock}
//           >
//             <Heart className={cn("h-3 w-3 mr-1", isInWishlist && "fill-red-500")} />
//             Save
//           </Button>
//         </div>
//       </div>

//       {/* Price + Delete */}
//       <div className="flex flex-col items-end justify-between">
//         <div className="text-right">
//           <p className="font-semibold text-primary">GHC {totalPrice.toFixed(2)}</p>
//           <p className="text-xs text-muted-foreground">
//             {cartItem.quantity} × GHC {displayPrice.toFixed(2)}
//           </p>
//         </div>
//         <Button 
//           size="icon" 
//           variant="ghost" 
//           onClick={handleCartItemDelete} 
//           disabled={isDeleting || exceedsAvailableStock}
//           className="text-muted-foreground hover:text-destructive"
//         >
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default UserCartItemsContent;


import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, Trash2, Heart, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import {
  deleteCartItem,
  updateCartQuantity,
} from "@/store/shop/cart-slice";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "@/store/shop/wishlist-slice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function UserCartItemsContent({ cartItem }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMovingToWishlist, setIsMovingToWishlist] = useState(false);

  useEffect(() => {
    if (user?.id) dispatch(fetchWishlist());
  }, [dispatch, user?.id]);

  const isOnSale = cartItem.salePrice > 0;
  const displayPrice = isOnSale ? cartItem.salePrice : cartItem.price;

  const exceedsStock =
    !cartItem.allowBackorders &&
    typeof cartItem.availableStock === "number" &&
    cartItem.quantity > cartItem.availableStock;

  const isInWishlist = useMemo(() => {
    const id = cartItem.productId;
    return wishlistItems?.some(
      (item) => item.product?._id === id || item.productId === id
    );
  }, [wishlistItems, cartItem.productId]);

  const updateQuantity = async (type) => {
    const newQty =
      type === "increment"
        ? cartItem.quantity + 1
        : cartItem.quantity - 1;

    if (newQty < 1) return;

    if (
      !cartItem.allowBackorders &&
      newQty > cartItem.availableStock
    ) {
      toast.error(`Only ${cartItem.availableStock} available`);
      return;
    }

    setIsUpdatingQuantity(true);
    try {
      await dispatch(
        updateCartQuantity({
          userId: user.id,
          productId: cartItem.productId,
          quantity: newQty,
        })
      ).unwrap();
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const removeItem = async () => {
    setIsDeleting(true);
    try {
      await dispatch(
        deleteCartItem({
          userId: user.id,
          productId: cartItem.productId,
        })
      ).unwrap();
      toast.success("Item removed");
    } finally {
      setIsDeleting(false);
    }
  };

  const moveToWishlist = async () => {
    if (!user?.id) return toast.info("Please login");

    setIsMovingToWishlist(true);
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(cartItem.productId)).unwrap();
      } else {
        await dispatch(addToWishlist(cartItem.productId)).unwrap();
        await removeItem();
      }
    } finally {
      setIsMovingToWishlist(false);
    }
  };

  return (
    <div className="flex gap-4 py-4">
      <img
        src={cartItem.image}
        alt={cartItem.title}
        className="h-20 w-20 rounded-md object-cover bg-muted"
      />

      <div className="flex-1">
        <h3 className="text-sm font-medium">{cartItem.title}</h3>

        <p className="text-sm font-semibold text-primary">
          GHC {displayPrice.toFixed(2)}
        </p>

        {exceedsStock && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            Only {cartItem.availableStock} available
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => updateQuantity("decrement")}
            disabled={isUpdatingQuantity || cartItem.quantity === 1}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="text-sm font-medium">{cartItem.quantity}</span>

          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => updateQuantity("increment")}
            disabled={isUpdatingQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("text-xs", isInWishlist && "text-red-500")}
            onClick={moveToWishlist}
            disabled={isMovingToWishlist}
          >
            <Heart
              className={cn("h-3 w-3 mr-1", isInWishlist && "fill-red-500")}
            />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <p className="font-semibold text-primary">
          GHC {(displayPrice * cartItem.quantity).toFixed(2)}
        </p>

        <Button
          size="icon"
          variant="ghost"
          onClick={removeItem}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;

