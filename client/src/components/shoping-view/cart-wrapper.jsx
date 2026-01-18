// import React, { useState, useCallback, useMemo, useEffect } from "react";
// import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
// import { Button } from "../ui/button";
// import UserCartItemsContent from "./cart-items-content";
// import { Separator } from "../ui/separator";
// import { useNavigate } from "react-router-dom";
// import { ShoppingBag, PackageOpen, Lock, ShoppingCart } from "lucide-react";
// import { cn } from "@/lib/utils";

// function UserCartWrapper({ cartItems = [], setOpenCartSheet }) {
//   const navigate = useNavigate();
//   const [isClosing, setIsClosing] = useState(false);

//   const {
//     hasItems,
//     totalItems,
//     subtotal,
//     shippingCost,
//     finalTotal,
//     remainingForFreeShipping,
//   } = useMemo(() => {
//     const subtotal = cartItems.reduce((sum, item) => {
//       const price = item.salePrice > 0 ? item.salePrice : item.price;
//       return sum + price * item.quantity;
//     }, 0);

//     const shippingThreshold = 300;
//     const shippingCost = subtotal >= shippingThreshold ? 0 : 25;

//     return {
//       hasItems: cartItems.length > 0,
//       totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
//       subtotal,
//       shippingCost,
//       finalTotal: subtotal + shippingCost,
//       remainingForFreeShipping: Math.max(shippingThreshold - subtotal, 0),
//     };
//   }, [cartItems]);

//   const format = useCallback((amount) => `GHC ${amount.toFixed(2)}`, []);

//   // Close sheet with animation
//   const handleClose = useCallback(() => {
//     setIsClosing(true);
//     setTimeout(() => {
//       if (setOpenCartSheet) {
//         setOpenCartSheet(false);
//       }
//     }, 300);
//   }, [setOpenCartSheet]);

//   // Checkout: Close sheet and navigate
//   const checkout = useCallback(() => {
//     setIsClosing(true);
//     setTimeout(() => {
//       if (setOpenCartSheet) {
//         setOpenCartSheet(false);
//       }
//       navigate("/shop/checkout");
//     }, 300);
//   }, [navigate, setOpenCartSheet]);

//   // Reset closing state when cart re-opens
//   useEffect(() => {
//     setIsClosing(false);
//   }, [cartItems.length]);

//   // Handle escape key
//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === 'Escape') {
//         handleClose();
//       }
//     };
    
//     window.addEventListener('keydown', handleEscape);
//     return () => window.removeEventListener('keydown', handleEscape);
//   }, [handleClose]);

//   return (
//     <SheetContent
//       side="right"
//       className={cn(
//         "w-full sm:max-w-md h-full flex flex-col p-0 transition-all duration-300",
//         isClosing && "opacity-0 translate-x-full"
//       )}
//       onCloseAutoFocus={(e) => e.preventDefault()}
//       onEscapeKeyDown={handleClose}
//       onPointerDownOutside={handleClose}
//     >
//       {/* Header */}
//       <SheetHeader className="border-b px-4 py-3 flex-shrink-0">
//         <div className="flex items-center gap-2">
//           <ShoppingBag className="h-5 w-5 text-muted-foreground" />
//           <div>
//             <SheetTitle>My Cart</SheetTitle>
//             {hasItems && (
//               <p className="text-xs text-muted-foreground">
//                 {totalItems} items · {format(subtotal)}
//               </p>
//             )}
//           </div>
//         </div>
//         {hasItems && shippingCost > 0 && (
//           <p className="mt-2 text-xs text-muted-foreground">
//             Add {format(remainingForFreeShipping)} more for free shipping
//           </p>
//         )}
//       </SheetHeader>

//       {/* Body */}
//       <div
//         className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5"
//         onWheel={(e) => e.stopPropagation()}
//       >
//         {hasItems ? (
//           <>
//             {cartItems.map((item, i) => (
//               <div key={`${item.productId}-${i}`}>
//                 <UserCartItemsContent cartItem={item} />
//                 {i < cartItems.length - 1 && <Separator className="my-4" />}
//               </div>
//             ))}
//           </>
//         ) : (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
//               <PackageOpen className="h-10 w-10 text-muted-foreground" />
//             </div>
//             <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
//             <p className="text-muted-foreground mb-6">
//               Add some products to get started
//             </p>
//             <Button 
//               variant="outline" 
//               className="gap-2"
//               onClick={() => {
//                 handleClose();
//                 navigate("/shop/listing");
//               }}
//             >
//               <ShoppingCart className="h-4 w-4" />
//               Browse Products
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       {hasItems && (
//         <div className="border-t px-4 py-4 space-y-4 flex-shrink-0">
//           <div className="text-sm space-y-2">
//             <div className="flex justify-between">
//               <span>Subtotal</span>
//               <span>{format(subtotal)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Shipping</span>
//               <span>{shippingCost === 0 ? "FREE" : format(shippingCost)}</span>
//             </div>
//             <Separator />
//             <div className="flex justify-between font-semibold">
//               <span>Total</span>
//               <span className="text-primary">{format(finalTotal)}</span>
//             </div>
//           </div>

//           <Button 
//             className="w-full h-11 gap-2" 
//             onClick={checkout}
//             size="lg"
//           >
//             <Lock className="h-4 w-4" />
//             Proceed to Checkout
//           </Button>
          
//           <Button 
//             variant="outline" 
//             className="w-full h-11" 
//             onClick={() => {
//               handleClose();
//               navigate("/shop/cart");
//             }}
//           >
//             View Full Cart Details
//           </Button>
//         </div>
//       )}
      
//       {/* Close button for mobile */}
//       <div className="lg:hidden border-t p-4">
//         <Button 
//           variant="ghost" 
//           className="w-full" 
//           onClick={handleClose}
//         >
//           Close
//         </Button>
//       </div>
//     </SheetContent>
//   );
// }

// export default UserCartWrapper;

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import UserCartItemsContent from "./cart-items-content";
import { Separator } from "../ui/separator";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, PackageOpen, Lock, ShoppingCart, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

function UserCartWrapper({ cartItems = [], setOpenCartSheet }) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [hasStockIssues, setHasStockIssues] = useState(false);

  const {
    hasItems,
    totalItems,
    subtotal,
    shippingCost,
    finalTotal,
    remainingForFreeShipping,
    itemsWithStockIssues,
  } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.salePrice > 0 ? item.salePrice : item.price;
      return sum + price * item.quantity;
    }, 0);

    const shippingThreshold = 300;
    const shippingCost = subtotal >= shippingThreshold ? 0 : 25;

    // Check for items that might have stock issues
    const itemsWithStockIssues = cartItems.filter(item => {
      // This would need actual stock check - for now, we'll check a flag if available
      return item.stockIssue || false;
    });

    return {
      hasItems: cartItems.length > 0,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      shippingCost,
      finalTotal: subtotal + shippingCost,
      remainingForFreeShipping: Math.max(shippingThreshold - subtotal, 0),
      itemsWithStockIssues: itemsWithStockIssues.length,
    };
  }, [cartItems]);

  // Check for stock issues whenever cart items change
  useEffect(() => {
    // This would ideally check each item's stock against the database
    // For now, we'll set a flag if we detect any items that might have issues
    const checkStockIssues = async () => {
      let hasIssues = false;
      
      // Simple check: if any item has a stockIssue flag
      hasIssues = cartItems.some(item => item.stockIssue);
      
      setHasStockIssues(hasIssues);
    };
    
    checkStockIssues();
  }, [cartItems]);

  const format = useCallback((amount) => `GHC ${amount.toFixed(2)}`, []);

  // Close sheet with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      if (setOpenCartSheet) {
        setOpenCartSheet(false);
      }
    }, 300);
  }, [setOpenCartSheet]);

  // Checkout: Close sheet and navigate
  const checkout = useCallback(() => {
    if (hasStockIssues) {
      toast.error("Please resolve stock issues before checkout");
      return;
    }
    
    setIsClosing(true);
    setTimeout(() => {
      if (setOpenCartSheet) {
        setOpenCartSheet(false);
      }
      navigate("/shop/checkout");
    }, 300);
  }, [navigate, setOpenCartSheet, hasStockIssues]);

  // Reset closing state when cart re-opens
  useEffect(() => {
    setIsClosing(false);
  }, [cartItems.length]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  return (
    <SheetContent
      side="right"
      className={cn(
        "w-full sm:max-w-md h-full flex flex-col p-0 transition-all duration-300",
        isClosing && "opacity-0 translate-x-full"
      )}
      onCloseAutoFocus={(e) => e.preventDefault()}
      onEscapeKeyDown={handleClose}
      onPointerDownOutside={handleClose}
    >
      {/* Header */}
      <SheetHeader className="border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          <div>
            <SheetTitle>My Cart</SheetTitle>
            {hasItems && (
              <p className="text-xs text-muted-foreground">
                {totalItems} item{totalItems !== 1 ? 's' : ''} · {format(subtotal)}
                {itemsWithStockIssues > 0 && (
                  <span className="ml-2 text-red-600">
                    • {itemsWithStockIssues} stock issue{itemsWithStockIssues !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        {hasItems && shippingCost > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Add {format(remainingForFreeShipping)} more for free shipping
          </p>
        )}
      </SheetHeader>

      {/* Stock Warning Banner */}
      {hasStockIssues && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Stock issues detected</p>
              <p className="text-xs">Some items may not be available in the requested quantity.</p>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5"
        onWheel={(e) => e.stopPropagation()}
      >
        {hasItems ? (
          <>
            {cartItems.map((item, i) => (
              <div key={`${item.productId}-${i}`}>
                <UserCartItemsContent cartItem={item} />
                {i < cartItems.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <PackageOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                handleClose();
                navigate("/shop/listing");
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Browse Products
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasItems && (
        <div className="border-t px-4 py-4 space-y-4 flex-shrink-0">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{format(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "FREE" : format(shippingCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{format(finalTotal)}</span>
            </div>
          </div>

          <Button 
            className="w-full h-11 gap-2" 
            onClick={checkout}
            size="lg"
            disabled={hasStockIssues}
          >
            {hasStockIssues ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Resolve Stock Issues
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Proceed to Checkout
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-11" 
            onClick={() => {
              handleClose();
              navigate("/shop/cart");
            }}
          >
            View Full Cart Details
          </Button>
        </div>
      )}
      
      {/* Close button for mobile */}
      <div className="lg:hidden border-t p-4">
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={handleClose}
        >
          Close
        </Button>
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;