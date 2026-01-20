import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import malikImg from "@/assets/ban/malik.webp";
import Address from "@/components/shoping-view/address";
import UserCartItemsContent from "@/components/shoping-view/cart-items-content";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { createNewOrder } from "@/store/shop/order-slice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: cartItems = [], isLoading } = useSelector(
    (state) => state.shopCart || {}
  );
  const {
    isloading: isOrderCreating,
    error: orderError,
  } = useSelector((state) => state.shopOrder || {});

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --------------------- FETCH CART ---------------------
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  // --------------------- DERIVED STATE ---------------------
  const hasStockIssues = useMemo(() => {
    return cartItems.some(
      (item) =>
        !item.allowBackorders &&
        typeof item.availableStock === "number" &&
        item.quantity > item.availableStock
    );
  }, [cartItems]);

  const { reserved, backorders } = useMemo(() => {
    let reservedCount = 0;
    let backorderCount = 0;

    cartItems.forEach((item) => {
      if (item.stockReserved) reservedCount += 1;
      if (
        item.allowBackorders &&
        (item.availableStock || 0) < (item.quantity || 1)
      ) {
        backorderCount += 1;
      }
    });

    return { reserved: reservedCount, backorders: backorderCount };
  }, [cartItems]);

  const totalCartAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price =
        item?.salePrice > 0
          ? Number(item.salePrice)
          : Number(item.price || 0);
      const quantity = Number(item.quantity) || 1;
      return Number((acc + price * quantity).toFixed(2));
    }, 0);
  }, [cartItems]);

  // --------------------- HANDLERS ---------------------
  const handleAddressSelect = useCallback((address) => {
    setSelectedAddress(address);
  }, []);

  const handleCheckout = async () => {
    try {
      if (!selectedAddress) {
        toast.error("Please select a shipping address");
        return;
      }
      if (!cartItems.length) {
        toast.error("Your cart is empty");
        return;
      }
      if (!user?.id || !user?.email) {
        toast.error("Please log in to continue checkout");
        navigate("/auth/login");
        return;
      }
      if (hasStockIssues) {
        toast.error(
          "Some items exceed available stock. Please update your cart."
        );
        return;
      }

      for (const item of cartItems) {
        if (!item.productId && !item._id) {
          toast.error("Invalid cart item detected. Please refresh your cart.");
          return;
        }
      }

      setIsProcessing(true);

      // Format cart items
      const formattedCartItems = cartItems.map((item) => {
        const price =
          item.salePrice > 0 ? Number(item.salePrice) : Number(item.price || 0);
        const quantity = Number(item.quantity) || 1;
        return {
          productId: item.productId || item._id,
          title: item.title || item.name || "Unknown Product",
          image: item.image || item.imgUrl || "",
          price: Number(price.toFixed(2)),
          salePrice:
            item.salePrice > 0
              ? Number(Number(item.salePrice).toFixed(2))
              : undefined,
          quantity,
          stockReserved: Boolean(item.stockReserved),
          allowBackorders: Boolean(item.allowBackorders),
        };
      });

      // Order payload: ✅ include totalAmount
      const orderData = {
        userId: user.id,
        cartItems: formattedCartItems,
        addressInfo: {
          addressId: selectedAddress._id,
          address: selectedAddress.address || "",
          city: selectedAddress.city || "",
          digitalAddress: selectedAddress.digitalAddress || "",
          phone: selectedAddress.phone || "",
          notes: selectedAddress.notes || "",
        },
        paymentMethod: "paystack",
        customerEmail: user.email,
        totalAmount: Number(totalCartAmount.toFixed(2)), // ✅ Fix
      };

      const result = await dispatch(createNewOrder(orderData)).unwrap();

      if (!result?.success) {
        throw new Error(result?.message || "Order creation failed");
      }

      const authorizationUrl =
        result.data?.payment?.authorization_url || result.authorization_url;

      if (!authorizationUrl) {
        throw new Error("Payment authorization failed");
      }

      localStorage.setItem(
        "pendingCheckout",
        JSON.stringify({
          orderId: result.orderId || result.data?.orderId,
          timestamp: Date.now(),
        })
      );

      window.location.href = authorizationUrl;
    } catch (error) {
      const message =
        typeof error?.message === "string" ? error.message : "Checkout failed";

      if (message.toLowerCase().includes("network")) {
        toast.error("Network error. Please try again.");
      } else if (message.toLowerCase().includes("unauthorized")) {
        toast.error("Session expired. Please log in again.");
        navigate("/auth/login");
      } else {
        toast.error(message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isProcessingState = isProcessing || isOrderCreating;
  const canCheckout =
    Boolean(selectedAddress) &&
    cartItems.length > 0 &&
    Boolean(user?.id) &&
    Boolean(user?.email) &&
    !hasStockIssues;

  // --------------------- RENDER ---------------------
  return (
    <div className="flex flex-col w-full">
      {/* Banner */}
      <div className="relative w-full overflow-hidden h-[200px] sm:h-[260px] md:h-[320px] lg:h-96">
        <img
          src={malikImg}
          alt="Shopping banner"
          className="absolute inset-0 w-full h-full object-cover lg:object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-8 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:sticky lg:top-5">
            <Address onAddressSelect={handleAddressSelect} />
          </div>

          <div className="flex flex-col border rounded p-2 max-h-[80vh]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-gray-500">Loading cart items...</span>
              </div>
            ) : cartItems.length ? (
              <>
                {(reserved > 0 || backorders > 0) && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg mx-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">
                        {reserved} reserved • {backorders} backorder
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-3 px-4 py-2 bg-gray-50 rounded">
                  {cartItems.map((item) => (
                    <UserCartItemsContent
                      key={item.productId || item._id}
                      cartItem={item}
                    />
                  ))}
                </div>

                <div className="mt-4 border-t bg-white px-4 py-4 sticky bottom-0 shadow-md">
                  <div className="flex justify-between mb-3 text-lg font-semibold">
                    <span>Total</span>
                    <span>GHC {totalCartAmount.toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
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

                  {orderError && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      {orderError}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center h-full py-10 text-gray-500">
                <p className="mb-4">Your cart is empty</p>
                <Button onClick={() => navigate("/shop")}>
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
