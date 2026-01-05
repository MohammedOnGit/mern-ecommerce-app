// App.jsx 
import React, { useEffect, lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { XCircle, ShieldCheck, Loader2 } from "lucide-react";

// Import utilities for rate limiting
import { requestManager } from "@/utils/request-manager";
import "@/utils/axios-interceptor";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { checkAuthStatus, restoreAuthFromStorage } from "@/store/auth-slice";

// Lazy load components for better performance
const AuthLayout = lazy(() => import("./components/auth/layout"));
const AuthLogin = lazy(() => import("./pages/auth/login"));
const AuthRegister = lazy(() => import("./pages/auth/register"));

const AdminLayout = lazy(() => import("./components/admin-view/layout"));
const AdminDashBoard = lazy(() => import("./pages/admin-view/dashboard"));
const AdminOrders = lazy(() => import("./pages/admin-view/orders"));
const AdminFeatures = lazy(() => import("./pages/admin-view/features"));
const AdminProducts = lazy(() => import("./pages/admin-view/products"));

const ShoppingLayout = lazy(() => import("./components/shoping-view/layout"));
const ShoppingHome = lazy(() => import("./pages/shopping-view/home"));
const ShopListing = lazy(() => import("./pages/shopping-view/listing"));
const ShoppingAccount = lazy(() => import("./pages/shopping-view/account"));
const ShoppingCheckout = lazy(() => import("./pages/shopping-view/checkout"));
const SearchPage = lazy(() => import("./pages/shopping-view/search-page"));
const Wishlist = lazy(() => import("./pages/shopping-view/Wishlist"));
const OrderConfirmation = lazy(() => import("./pages/shopping-view/order-confirmation"));
const PaystackReturn = lazy(() => import("./pages/shopping-view/paystack-return"));

const NotFound = lazy(() => import("./pages/not-found"));
const CheckAuth = lazy(() => import("./components/common/check-auth"));
const UnAuthPage = lazy(() => import("./pages/unauth-page"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <div className="space-y-4">
      <Skeleton className="h-12 w-12 rounded-full mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  </div>
);

// Session Restoring Component
const SessionRestoring = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="relative">
        <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-12 w-12 text-blue-600" />
        </div>
        <div className="absolute -bottom-2 -right-2">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Restoring Your Session
        </h1>
        <p className="text-gray-600">
          Please wait while we restore your shopping session...
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-3/4"></div>
        </div>
        <p className="text-xs text-gray-500">
          This usually takes just a moment
        </p>
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-500">
          Your cart items and preferences are being restored
        </p>
      </div>
    </div>
  </div>
);

// PayPal Cancel Component
const PayPalCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate("/shop/checkout")}>
            Return to Checkout
          </Button>
          <Button variant="outline" onClick={() => navigate("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const [showSessionRestoring, setShowSessionRestoring] = useState(false);

  useEffect(() => {
    // Immediately restore auth from localStorage (instant)
    dispatch(restoreAuthFromStorage());
    setIsSessionRestored(true);
    
    // Start background auth check (non-blocking)
    const checkAuthWithBackend = async () => {
      try {
        console.log("🔄 Starting background auth check...");
        await dispatch(checkAuthStatus()).unwrap();
        console.log("✅ Background auth check completed");
      } catch (error) {
        console.warn("⚠️ Background auth check failed, using localStorage data:", error.message);
        // User stays logged in with localStorage data - this is OK
      } finally {
        // Hide session restoring screen after a minimum delay for UX
        setTimeout(() => {
          setShowSessionRestoring(false);
        }, 1000); // Show for at least 1 second for better UX
      }
    };
    
    // Show session restoring screen for better UX
    setShowSessionRestoring(true);
    
    // Start auth check with a small delay to prevent blocking
    const authCheckTimeout = setTimeout(() => {
      checkAuthWithBackend();
    }, 100);
    
    // Cache cleanup
    const clearOldCache = () => {
      requestManager.clearCache();
    };

    const cacheInterval = setInterval(clearOldCache, 1800000); // 30 minutes

    return () => {
      clearTimeout(authCheckTimeout);
      clearInterval(cacheInterval);
      requestManager.clearCache();
    };
  }, [dispatch]);

  // Show session restoring screen
  if (showSessionRestoring) {
    return <SessionRestoring />;
  }

  // Show loading fallback only if auth is still loading AND we're not showing session restoring
  if (isLoading && !isSessionRestored) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ===================== AUTH ROUTES ===================== */}
          <Route
            path="/auth"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AuthLayout />
              </CheckAuth>
            }
          >
            <Route index element={<Navigate to="login" />} />
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>

          {/* ===================== ADMIN ROUTES ===================== */}
          <Route
            path="/admin"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <AdminLayout />
              </CheckAuth>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashBoard />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>

          {/* ===================== SHOPPING ROUTES ===================== */}
          <Route
            path="/shop"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <ShoppingLayout />
              </CheckAuth>
            }
          >
            <Route index element={<Navigate to="home" />} />
            <Route path="home" element={<ShoppingHome />} />
            <Route path="listing" element={<ShopListing />} />
            <Route path="checkout" element={<ShoppingCheckout />} />
            <Route path="account" element={<ShoppingAccount />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          </Route>

          {/* ===================== PAYMENT ROUTES ===================== */}
          <Route path="/shop/paystack-return" element={<PaystackReturn />} />
          <Route path="/shop/paypal-cancel" element={<PayPalCancel />} />
          
          {/* ===================== STANDALONE ORDER CONFIRMATION ROUTES ===================== */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

          {/* ===================== REDIRECTS FOR OLD LOGIN PATHS ===================== */}
          <Route
            path="/shop/login"
            element={<Navigate to="/auth/login" replace />}
          />
          <Route
            path="/shop/register"
            element={<Navigate to="/auth/register" replace />}
          />

          {/* ===================== UNAUTHORIZED & 404 ===================== */}
          <Route path="/unauth-page" element={<UnAuthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;