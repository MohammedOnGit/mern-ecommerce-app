import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { checkAuthStatus } from "@/store/auth-slice";
import { clearCart } from "@/store/shop/cart-slice";

function PaystackReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing your payment...");
  const [orderId, setOrderId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        setStatus("processing");
        setMessage("Verifying your payment...");

        const reference = searchParams.get('reference') || searchParams.get('trxref');
        const token = searchParams.get('token');
        const paymentSuccess = searchParams.get('payment_success') === 'true';
        
        console.log("Payment return parameters:", {
          reference,
          hasToken: !!token,
          paymentSuccess
        });

        if (!reference) {
          throw new Error("No payment reference found");
        }

        // CRITICAL: If we have a token in URL, save it immediately
        if (token) {
          localStorage.setItem('token', token);
          console.log("Token saved from URL parameter");
          
          // Restore auth state with the new token
          try {
            await dispatch(checkAuthStatus());
            console.log("Auth session restored from URL token");
          } catch (authError) {
            console.warn("Auth restore warning:", authError);
          }
        }

        // If payment already marked as success via token, just redirect
        if (paymentSuccess && token) {
          const orderIdFromToken = await extractOrderIdFromToken(token);
          if (orderIdFromToken) {
            setOrderId(orderIdFromToken);
            setStatus("success");
            setMessage("Payment verified successfully!");
            
            // Clear cart
            dispatch(clearCart());
            
            // Save order info
            localStorage.setItem('lastOrder', JSON.stringify({
              orderId: orderIdFromToken,
              timestamp: Date.now(),
              status: 'confirmed'
            }));
            
            // Redirect after delay
            setTimeout(() => {
              navigate(`/order-confirmation/${orderIdFromToken}`, {
                replace: true,
                state: { 
                  fromPayment: true,
                  paymentStatus: 'success'
                }
              });
            }, 1500);
            return;
          }
        }

        // Verify with backend (fallback)
        console.log("Verifying payment with backend...");
        const verifyResponse = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shop/orders/verify-payment?reference=${reference}`,
          {
            method: 'GET',
            credentials: 'include', // Important: include cookies
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );

        if (verifyResponse.redirected) {
          // If redirected, extract order ID from redirect URL
          const redirectUrl = verifyResponse.url;
          const orderIdMatch = redirectUrl.match(/order-confirmation\/([^?]+)/);
          
          if (orderIdMatch) {
            const extractedOrderId = orderIdMatch[1];
            setOrderId(extractedOrderId);
            setStatus("success");
            setMessage("Payment verified successfully!");
            
            // Clear cart
            dispatch(clearCart());
            
            // Save order info
            localStorage.setItem('lastOrder', JSON.stringify({
              orderId: extractedOrderId,
              timestamp: Date.now(),
              status: 'confirmed'
            }));
            
            // Attempt to restore auth if needed
            try {
              await dispatch(checkAuthStatus());
            } catch (authError) {
              console.warn("Auth restore after payment:", authError);
            }
            
            // Redirect
            setTimeout(() => {
              navigate(`/order-confirmation/${extractedOrderId}`, {
                replace: true,
                state: { 
                  fromPayment: true,
                  paymentStatus: 'success'
                }
              });
            }, 1500);
          } else {
            // Direct redirect
            window.location.href = redirectUrl;
          }
        } else if (verifyResponse.ok) {
          const data = await verifyResponse.json();
          if (data.success) {
            setOrderId(data.orderId);
            setStatus("success");
            setMessage("Payment verified successfully!");
            
            // Clear cart
            dispatch(clearCart());
            
            // Save order info
            localStorage.setItem('lastOrder', JSON.stringify({
              orderId: data.orderId,
              timestamp: Date.now(),
              status: 'confirmed'
            }));
            
            // Redirect
            setTimeout(() => {
              navigate(`/order-confirmation/${data.orderId}`, {
                replace: true,
                state: { 
                  fromPayment: true,
                  paymentStatus: 'success'
                }
              });
            }, 1500);
          } else {
            throw new Error(data.message || "Payment verification failed");
          }
        } else {
          throw new Error("Payment verification failed");
        }
        
      } catch (error) {
        console.error("Payment processing error:", error);
        
        setStatus("failed");
        setMessage("Payment verification failed");
        
        // Save error for debugging
        localStorage.setItem('paymentError', JSON.stringify({
          error: error.message,
          timestamp: Date.now(),
          retryCount
        }));
        
        // Retry logic (max 2 retries)
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setStatus("processing");
            setMessage(`Retrying... (${retryCount + 1}/2)`);
          }, 2000);
          return;
        }
        
        // Show error and redirect after max retries
        toast.error("Payment verification failed. Please check your order status.");
        
        setTimeout(() => {
          navigate('/shop/checkout', {
            replace: true,
            state: { 
              paymentError: true,
              error: error.message 
            }
          });
        }, 3000);
      }
    };

    processPaymentReturn();
  }, [searchParams, navigate, dispatch, retryCount]);

  // Helper function to extract order ID from JWT token
  const extractOrderIdFromToken = async (token) => {
    try {
      // In a real app, you'd decode the JWT to extract metadata
      // For now, we'll parse the URL for the order ID
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect_url') || window.location.href;
      const match = redirectUrl.match(/order-confirmation\/([^?]+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Error extracting order ID:", error);
      return null;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />;
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />;
      default:
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "processing":
        return retryCount > 0 ? `Retrying Payment (${retryCount}/2)` : "Processing Payment";
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
      default:
        return "Processing";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="text-center p-8 max-w-md w-full bg-white rounded-xl shadow-lg border">
        <div className="mb-8">
          {getStatusIcon()}
          <h1 className="text-2xl font-bold mb-3 text-gray-800">{getStatusTitle()}</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === "processing" && (
            <div className="space-y-3">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse w-3/4"></div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>Do not close or refresh this window</span>
              </div>
            </div>
          )}
          
          {status === "success" && orderId && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-1">Order Reference</p>
              <p className="font-mono text-green-900 text-sm break-all">{orderId}</p>
            </div>
          )}
          
          {status === "failed" && retryCount >= 2 && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  Unable to verify payment. Please check your email for confirmation or contact support.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/shop/checkout')}
                  className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
                >
                  Return to Checkout
                </button>
                <button
                  onClick={() => navigate('/shop/account')}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  View My Orders
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {status === "processing" 
              ? "You will be redirected automatically..." 
              : "If you're not redirected, click the buttons above."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaystackReturn;