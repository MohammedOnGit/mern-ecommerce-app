// pages/shopping-view/checkout.jsx 
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import malikImg from "@/assets/ban/malik.webp";
import Address from "@/components/shoping-view/address";
import UserCartItemsContent from "@/components/shoping-view/cart-items-content";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { createNewOrder } from "@/store/shop/order-slice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems = [], isLoading } = useSelector((state) => state.shopCart || {});
  const { isloading: isOrderCreating, error: orderError } = useSelector((state) => state.shopOrder || {});

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  // Calculate total with proper decimal precision
  const calculateTotalCartAmount = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    let total = 0;
    cartItems.forEach(item => {
      const price = item?.salePrice > 0 ? parseFloat(item.salePrice) : parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity) || 1;
      total = parseFloat((total + (price * quantity)).toFixed(2));
    });
    
    return total;
  };

  const totalCartAmount = calculateTotalCartAmount();

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleCheckout = async () => {
    try {
      // Validation checks
      if (!selectedAddress) {
        toast.error("Please select a shipping address");
        return;
      }

      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      if (!user?.id) {
        toast.error("User ID not found. Please log in again.");
        navigate("/auth/login");
        return;
      }

      if (!user?.email) {
        toast.error("User email is required for payment");
        return;
      }

      setIsProcessing(true);

      // Calculate totals with precise decimal handling
      let subtotal = 0;
      const formattedCartItems = cartItems.map(item => {
        const price = parseFloat((item.salePrice > 0 ? item.salePrice : item.price) || 0);
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = parseFloat((price * quantity).toFixed(2));
        subtotal = parseFloat((subtotal + itemTotal).toFixed(2));

        return {
          productId: item.productId || item._id || `temp-${Date.now()}`,
          title: item.title || item.name || "Unknown Product",
          image: item.image || item.imgUrl || "",
          price: parseFloat(price.toFixed(2)),
          salePrice: item.salePrice ? parseFloat(Number(item.salePrice).toFixed(2)) : undefined,
          quantity: quantity,
          productTotal: itemTotal
        };
      });

      // Calculate final totals
      const shippingFee = 0;
      const tax = 0;
      subtotal = parseFloat(subtotal.toFixed(2));
      const totalAmount = parseFloat((subtotal + shippingFee + tax).toFixed(2));

      // Log for debugging
      console.log("💰 Order Totals Calculation:", {
        subtotal,
        shippingFee,
        tax,
        totalAmount,
        itemsCount: formattedCartItems.length,
        items: formattedCartItems.map(item => ({
          price: item.price,
          quantity: item.quantity,
          productTotal: item.productTotal
        }))
      });

      const orderData = {
        userId: user.id,
        cartItems: formattedCartItems,
        addressInfo: {
          addressId: selectedAddress._id,
          address: selectedAddress.address || "",
          city: selectedAddress.city || "",
          digitalAddress: selectedAddress.digitalAddress || "",
          phone: selectedAddress.phone || "",
          notes: selectedAddress.notes || ""
        },
        paymentMethod: "paystack",
        totalAmount: totalAmount,
        customerEmail: user.email,
        subtotal: subtotal,
        shippingFee: shippingFee,
        tax: tax,
        notes: ""
      };

      console.log("📦 Sending order data to backend:", JSON.stringify(orderData, null, 2));

      // Dispatch Redux action
      const result = await dispatch(createNewOrder(orderData)).unwrap();
      
      console.log("✅ Order creation result:", result);

      if (result.success) {
        const authorizationUrl = result.data?.payment?.authorization_url || result.authorization_url;
        
        if (!authorizationUrl) {
          console.error("No authorization URL in response:", result);
          throw new Error("Payment initialization failed. No payment URL received.");
        }
        
        console.log("✅ Order created, redirecting to Paystack:", authorizationUrl);
        
        // Save order info before redirect
        try {
          localStorage.setItem('pendingCheckout', JSON.stringify({
            orderId: result.orderId || result.data?.orderId,
            timestamp: Date.now(),
            totalAmount: totalAmount
          }));
        } catch (e) {
          console.warn("Could not save checkout data to localStorage:", e);
        }
        
        // Redirect to Paystack
        window.location.href = authorizationUrl;
      } else {
        throw new Error(result.message || "Failed to create order");
      }
    } catch (error) {
      console.error("❌ Checkout error details:", error);
      
      // Safe error message handling
      const errorMessage = error?.message || "An error occurred during checkout";
      console.error("❌ Error message:", errorMessage);
      
      // Check error type safely
      if (typeof errorMessage === 'string') {
        const lowerErrorMessage = errorMessage.toLowerCase();
        
        if (lowerErrorMessage.includes('network') || 
            lowerErrorMessage.includes('fetch') ||
            lowerErrorMessage.includes('connection')) {
          toast.error("Network error. Please check your connection and try again.");
        } else if (lowerErrorMessage.includes('401') || 
                   lowerErrorMessage.includes('unauthorized') ||
                   lowerErrorMessage.includes('authentication')) {
          toast.error("Session expired. Please log in again.");
          navigate("/auth/login");
        } else if (lowerErrorMessage.includes('400') || 
                   lowerErrorMessage.includes('validation')) {
          if (lowerErrorMessage.includes('total') && lowerErrorMessage.includes('match')) {
            toast.error("Cart calculation issue. Please refresh page and try again.");
          } else {
            toast.error("Order validation error: " + errorMessage);
          }
        } else if (lowerErrorMessage.includes('500') || 
                   lowerErrorMessage.includes('server')) {
          toast.error("Server error. Please try again in a moment.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate processing state
  const isProcessingState = isProcessing || isOrderCreating;
  
  // Check if checkout can proceed
  const canCheckout = selectedAddress && 
                     cartItems && 
                     cartItems.length > 0 && 
                     user?.id && 
                     user?.email;

  return (
    <div className="flex flex-col w-full">
      {/* Banner */}
      <div className="relative w-full overflow-hidden h-[200px] sm:h-[260px] md:h-[320px] lg:h-96">
        <img
          src={malikImg}
          alt="Shopping banner showing products"
          className="absolute inset-0 w-full h-full object-cover lg:object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-8 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Address Section */}
          <div className="lg:sticky lg:top-5">
            <Address onAddressSelect={handleAddressSelect} />
          </div>

          {/* Cart Items Section */}
          <div className="flex flex-col border rounded p-2 max-h-[80vh]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-gray-500">Loading cart items...</span>
              </div>
            ) : cartItems && cartItems.length > 0 ? (
              <>
                {/* Scrollable Cart Items List */}
                <div className="flex-1 overflow-y-auto space-y-3 px-4 py-2 bg-gray-50 rounded">
                  {cartItems.map((item, index) => (
                    <UserCartItemsContent 
                      key={item.productId || item._id || `cart-item-${index}`} 
                      cartItem={item} 
                    />
                  ))}
                </div>

                {/* Sticky Total & Checkout */}
                <div className="mt-4 border-t bg-white px-4 py-4 sticky bottom-0 z-10 shadow-md">
                  {/* Address Selection Alert */}
                  {!selectedAddress && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          Please select a shipping address from the left panel
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Selected Address Display */}
                  {selectedAddress && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Shipping to:
                      </p>
                      <p className="text-sm text-green-700">
                        {selectedAddress.address || "Address not specified"}, {selectedAddress.city || "City not specified"}
                      </p>
                    </div>
                  )}

                  {/* Show order error if any */}
                  {orderError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Order Error:
                      </p>
                      <p className="text-sm text-red-700">
                        {typeof orderError === 'string' ? orderError : "An error occurred"}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between mb-3 text-lg font-semibold">
                    <span>Total</span>
                    <span>GHC {totalCartAmount.toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-label="Proceed to checkout"
                    onClick={handleCheckout}
                    disabled={isProcessingState || !canCheckout}
                  >
                    {isProcessingState ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>

                  {!selectedAddress && cartItems.length > 0 && (
                    <p className="text-sm text-amber-600 mt-2 text-center">
                      Select an address to continue
                    </p>
                  )}

                  {!user?.id && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Please log in to proceed with checkout
                    </p>
                  )}

                  {user?.id && !user?.email && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Email address is required for payment
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center h-full py-10 text-center text-gray-500">
                <p className="mb-4">Your cart is empty</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/shop")}
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;