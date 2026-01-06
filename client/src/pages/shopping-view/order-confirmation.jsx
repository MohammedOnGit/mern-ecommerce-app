import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, Home, Package, Mail, Truck, Clock, AlertCircle, CreditCard } from "lucide-react";
import { clearCart } from "@/store/shop/cart-slice";
import { checkAuthStatus } from "@/store/auth-slice";
import { getOrderDetails } from "@/store/shop/order-slice"; // IMPORT FROM ORDER SLICE
import axios from "axios";
import { toast } from "sonner";

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { orderDetails, isloading } = useSelector((state) => state.shopOrder); // GET ORDER FROM REDUX
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [urlToken, setUrlToken] = useState(null);

  // Step 1: Check for token in URL and restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const tokenFromUrl = searchParams.get('token');
        const paymentSuccess = searchParams.get('payment_success') === 'true';
        
        console.log("Order confirmation - URL parameters:", {
          tokenFromUrl: !!tokenFromUrl,
          paymentSuccess,
          orderId
        });

        // If we have a token from URL, save it immediately
        if (tokenFromUrl) {
          localStorage.setItem('token', tokenFromUrl);
          setUrlToken(tokenFromUrl);
          console.log("Token saved from URL to localStorage");
        }

        // Always try to restore auth
        await dispatch(checkAuthStatus());
        
        // Clear cart after successful payment
        if (paymentSuccess || location.state?.fromPayment) {
          dispatch(clearCart());
          
          // Clear cart-related localStorage items (keep auth)
          ['cart_backup', 'cartItems', 'cartLastUpdated'].forEach(key => 
            localStorage.removeItem(key)
          );
          console.log('🛒 Cart cleared after payment');
        }
        
        setSessionRestored(true);
        
      } catch (error) {
        console.warn("Session restoration note:", error.message);
        setSessionRestored(true); // Continue anyway
      }
    };

    restoreSession();
  }, [dispatch, searchParams, location.state, orderId]);

  // Step 2: Fetch order details
  useEffect(() => {
    if (sessionRestored && orderId) {
      fetchOrderDetails();
    }
  }, [orderId, sessionRestored]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Try to get order from location state first
      if (location.state?.order) {
        setOrder(location.state.order);
        setLoading(false);
        return;
      }
      
      // If we have an orderId, fetch from API via Redux
      if (orderId) {
        console.log("Fetching order details for:", orderId);
        
        // Use Redux thunk to fetch order details
        const result = await dispatch(getOrderDetails(orderId));
        
        if (result.meta.requestStatus === 'fulfilled') {
          const orderData = result.payload?.order;
          if (orderData) {
            setOrder(orderData);
            
            // Save order to localStorage for persistence
            localStorage.setItem('lastOrder', JSON.stringify({
              order: orderData,
              timestamp: Date.now(),
              restored: true
            }));
            
            console.log("Order loaded successfully:", orderData._id);
          } else {
            throw new Error("Order data not found in response");
          }
        } else {
          throw new Error(result.error?.message || "Failed to fetch order");
        }
      } else {
        // Try to load last order from localStorage
        const savedOrder = localStorage.getItem('lastOrder');
        if (savedOrder) {
          const parsed = JSON.parse(savedOrder);
          // Only use if less than 1 hour old
          if (Date.now() - parsed.timestamp < 3600000) {
            setOrder(parsed.order);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Unable to load order information");
    } finally {
      setLoading(false);
    }
  };

  // Handle loading state
  if (loading || isloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Loading your order</p>
            <p className="text-sm text-gray-500 mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 bg-white p-8 rounded-xl shadow-sm border border-green-100">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-800">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-4">
            <Mail className="h-4 w-4" />
            <span className="text-sm">
              {order?.customerEmail || user?.email 
                ? `Receipt sent to ${order?.customerEmail || user?.email}`
                : "Check your email for receipt"
              }
            </span>
          </div>
          
          {order?._id && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg inline-block max-w-full">
              <p className="text-sm text-gray-500 mb-1">Order Reference</p>
              <p className="font-mono font-bold text-lg text-gray-800 truncate" title={order._id}>
                {order._id}
              </p>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Package className="h-5 w-5" />
              Order Summary
            </h2>
            
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Order Status</p>
                  <p className="font-medium capitalize text-green-700 flex items-center gap-2">
                    {order.orderStatus === 'confirmed' && <CheckCircle className="h-4 w-4" />}
                    {order.orderStatus === 'pending' && <Clock className="h-4 w-4" />}
                    {order.orderStatus || 'processing'}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  <p className="font-medium capitalize text-blue-700 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {order.paymentStatus || 'completed'}
                  </p>
                </div>
              </div>
              
              {/* Amounts */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Items Total</span>
                    <span className="font-medium">GHC {(order.subtotal || order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  {(order.shippingFee || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">GHC {order.shippingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {(order.tax || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">GHC {order.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                    <span>Total Amount</span>
                    <span>GHC {(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              {order.addressInfo && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">{order.addressInfo.address || 'Address not specified'}</p>
                    <p className="text-gray-600">{order.addressInfo.city || 'City not specified'}</p>
                    {order.addressInfo.phone && (
                      <p className="text-gray-600 mt-1">Phone: {order.addressInfo.phone}</p>
                    )}
                    {order.addressInfo.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">Note: {order.addressInfo.notes}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Order Items */}
              {order.cartItems && order.cartItems.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Order Items ({order.cartItems.length})</h3>
                  <div className="space-y-3">
                    {order.cartItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-600">
                            GHC {item.price?.toFixed(2) || '0.00'} × {item.quantity || 1}
                          </p>
                        </div>
                        <div className="font-medium text-gray-800">
                          GHC {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Order Not Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find your order details. Please check your email for confirmation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate("/shop")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Continue Shopping
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/shop/account")}
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  View My Orders
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {order && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/shop")}
              className="flex-1 gap-2 py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              size="lg"
            >
              <Home className="h-5 w-5" />
              Continue Shopping
            </Button>
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={() => navigate("/shop/account")}
                className="flex-1 gap-2 py-6 text-lg border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
                size="lg"
              >
                <ShoppingBag className="h-5 w-5" />
                View My Orders
              </Button>
            )}
          </div>
        )}
        
        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
          <p className="mt-1">Order confirmation #{orderId || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;