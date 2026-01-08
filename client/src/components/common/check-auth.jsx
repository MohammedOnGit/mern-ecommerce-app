// components/common/check-auth.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AlertCircle, RefreshCw, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { requestManager } from "@/utils/request-manager";

function CheckAuth({ isAuthenticated, user, children, requiredRole }) {
  const location = useLocation();
  const [rateLimited, setRateLimited] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [authCheckLoading, setAuthCheckLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Reset rate limit state on location change
  useEffect(() => {
    setRateLimited(false);
    setRetryCount(0);
    setLastError(null);
  }, [location.pathname]);

  // Monitor for rate limiting errors
  useEffect(() => {
    const handleRateLimitError = (error) => {
      if (error?.response?.status === 429) {
        setRateLimited(true);
        setLastError("Too many requests. Please wait a moment.");
      }
    };

    // You can add global error monitoring here
    // For example, listen to axios interceptors

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Handle retry after rate limit
  const handleRetry = () => {
    if (retryCount >= 3) {
      // After 3 retries, clear cache and wait longer
      requestManager.clearCache();
      setTimeout(() => {
        setRateLimited(false);
        setRetryCount(0);
        window.location.reload();
      }, 5000);
      return;
    }

    setAuthCheckLoading(true);
    setRateLimited(false);
    
    // Simulate a small delay before retry
    setTimeout(() => {
      setAuthCheckLoading(false);
      setRetryCount(prev => prev + 1);
      // Trigger a page refresh to retry auth checks
      window.location.reload();
    }, 1000);
  };

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    if (!user || !user.role) return false;
    
    // Support multiple roles if needed
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };

  // Show rate limit error screen
  if (rateLimited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-2 border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                {authCheckLoading ? (
                  <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                )}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Rate Limited</h2>
                <p className="text-muted-foreground">
                  {lastError || "Too many requests. Please wait a moment."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Attempt {Math.min(retryCount + 1, 3)} of 3
                </p>
              </div>
              
              {retryCount >= 2 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Please wait a few minutes before trying again.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <Button 
              onClick={handleRetry} 
              className="gap-2 w-full"
              disabled={authCheckLoading || retryCount >= 3}
              variant={retryCount >= 2 ? "outline" : "default"}
            >
              {authCheckLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {retryCount >= 2 ? "Wait and Retry" : "Try Again"}
            </Button>
            
            {retryCount >= 3 && (
              <Button 
                onClick={() => window.location.href = "/"} 
                className="w-full"
                variant="ghost"
              >
                Go to Home
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 1. Root route `/` - redirect based on authentication and role
  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/shop/home" replace />
    );
  }

  // 2. Unauthenticated users → block everything except auth pages
  if (!isAuthenticated) {
    const allowedUnauthPaths = [
      "/auth/login",
      "/auth/register",
      "/shop/home",
      "/shop/listing",
      "/shop/search",
      "/shop/product/"
    ];
    
    const isAllowed = allowedUnauthPaths.some(path => 
      location.pathname.startsWith(path)
    );
    
    if (!isAllowed) {
      return <Navigate 
        to="/auth/login" 
        replace 
        state={{ from: location.pathname !== "/auth/login" ? location : null }} 
      />;
    }
  }

  // 3. Authenticated users → prevent access to auth pages (login/register)
  if (isAuthenticated && location.pathname.startsWith("/auth/")) {
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/shop/home" replace />
    );
  }

  // 4. Non-admin users → block admin routes
  if (isAuthenticated && location.pathname.startsWith("/admin/")) {
    if (user?.role !== "admin") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full border-2 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <ShieldAlert className="h-8 w-8 text-red-600" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Access Denied</h2>
                  <p className="text-muted-foreground">
                    You don't have permission to access the admin panel.
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={() => window.location.href = "/shop/home"} 
                className="w-full"
              >
                Go to Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    
    // Admin users accessing admin routes - check specific role if required
    if (requiredRole && !hasRequiredRole()) {
      return <Navigate to="/unauth-page" replace />;
    }
  }

  // 5. Check required role for any route
  if (requiredRole && !hasRequiredRole()) {
    return <Navigate to="/unauth-page" replace />;
  }

  // 6. Admin users accessing shop routes - redirect to admin dashboard
  if (isAuthenticated && user?.role === "admin" && location.pathname.startsWith("/shop/")) {
    const allowedShopPaths = ["/shop/home", "/shop/listing", "/shop/search", "/shop/product/"];
    const isAllowed = allowedShopPaths.some(path => 
      location.pathname.startsWith(path)
    );
    
    if (!isAllowed) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Otherwise allow access
  return <>{children}</>;
}

export default CheckAuth;