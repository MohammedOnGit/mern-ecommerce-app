// import { Outlet, useLocation } from "react-router-dom";
// import ShoppingHeader from "../shoping-view/header";
// import {
//   useEffect,
//   useState,
//   useCallback,
//   Suspense,
//   useMemo,
// } from "react";
// import { Toaster } from "@/components/ui/sonner";
// import {
//   ArrowUp,
//   Loader2,
//   Smartphone,
//   Tablet,
//   Monitor,
//   AlertCircle,
//   Wifi,
//   WifiOff,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { ShoppingFooter, CompactFooter } from "../shoping-view/footer";
// import ErrorBoundary from "../ErrorBoundary";

// /* -------------------------------------------------------------------------- */
// /*                               DEVICE DETECTION                             */
// /* -------------------------------------------------------------------------- */

// const useDeviceDetection = () => {
//   const [device, setDevice] = useState("desktop");

//   useEffect(() => {
//     let rafId = null;

//     const detect = () => {
//       const w = window.innerWidth;
//       if (w < 768) setDevice("mobile");
//       else if (w < 1024) setDevice("tablet");
//       else setDevice("desktop");
//     };

//     const onResize = () => {
//       cancelAnimationFrame(rafId);
//       rafId = requestAnimationFrame(detect);
//     };

//     detect();
//     window.addEventListener("resize", onResize, { passive: true });

//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener("resize", onResize);
//     };
//   }, []);

//   return device;
// };

// /* -------------------------------------------------------------------------- */
// /*                          PAGE LOADING INDICATOR                             */
// /* -------------------------------------------------------------------------- */

// const PageLoadingIndicator = ({ isLoading }) => (
//   <div className="fixed top-16 left-0 right-0 z-[100] h-1 bg-primary/10 overflow-hidden pointer-events-none">
//     <div
//       className={cn(
//         "h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300",
//         isLoading ? "w-full" : "w-0"
//       )}
//     />
//   </div>
// );

// /* -------------------------------------------------------------------------- */
// /*                           SCROLL TO TOP BUTTON                              */
// /* -------------------------------------------------------------------------- */

// const ScrollToTopButton = () => {
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     let ticking = false;

//     const onScroll = () => {
//       if (!ticking) {
//         window.requestAnimationFrame(() => {
//           setVisible(window.scrollY > 400);
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   const scrollToTop = useCallback(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, []);

//   return (
//     <Button
//       onClick={scrollToTop}
//       size="icon"
//       aria-label="Scroll to top"
//       className={cn(
//         "fixed right-4 sm:right-6 bottom-24 sm:bottom-6 z-40",
//         "h-12 w-12 rounded-full shadow-2xl shadow-primary/20",
//         "bg-background border-2 border-primary/20",
//         "backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
//         "transition-all duration-300 transform",
//         visible
//           ? "opacity-100 translate-y-0 scale-100"
//           : "opacity-0 translate-y-10 scale-95 pointer-events-none"
//       )}
//     >
//       <ArrowUp className="h-5 w-5" />
//     </Button>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /*                          PERFORMANCE MONITOR (DEV)                          */
// /* -------------------------------------------------------------------------- */

// const PerformanceMonitor = () => {
//   useEffect(() => {
//     if (import.meta.env.DEV && "PerformanceObserver" in window) {
//       const observer = new PerformanceObserver((list) => {
//         list.getEntries().forEach((entry) => {
//           console.debug(
//             `[Perf] ${entry.name}: ${entry.duration.toFixed(2)}ms`
//           );
//         });
//       });

//       observer.observe({
//         entryTypes: ["navigation", "measure", "resource"],
//       });

//       return () => observer.disconnect();
//     }
//   }, []);

//   return null;
// };

// /* -------------------------------------------------------------------------- */
// /*                                NETWORK STATUS                               */
// /* -------------------------------------------------------------------------- */

// const NetworkStatus = () => {
//   const [online, setOnline] = useState(navigator.onLine);
//   const [showNotification, setShowNotification] = useState(false);

//   useEffect(() => {
//     const handleOnline = () => {
//       setOnline(true);
//       setShowNotification(true);
//       setTimeout(() => setShowNotification(false), 3000);
//     };
    
//     const handleOffline = () => {
//       setOnline(false);
//       setShowNotification(true);
//     };

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   if (!showNotification) return null;

//   return (
//     <div className={cn(
//       "fixed top-20 left-1/2 transform -translate-x-1/2 z-50",
//       "px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5",
//       online ? "bg-green-500 text-white" : "bg-red-500 text-white"
//     )}>
//       {online ? (
//         <>
//           <Wifi className="h-4 w-4" />
//           <span className="text-sm font-medium">Back online</span>
//         </>
//       ) : (
//         <>
//           <WifiOff className="h-4 w-4" />
//           <span className="text-sm font-medium">You're offline. Some features may not work.</span>
//         </>
//       )}
//     </div>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /*                                MAIN LAYOUT                                  */
// /* -------------------------------------------------------------------------- */

// function ShoppingLayout() {
//   const location = useLocation();
//   const device = useDeviceDetection();

//   const [isPageLoading, setIsPageLoading] = useState(false);

//   /* Route loading indicator */
//   useEffect(() => {
//     setIsPageLoading(true);
//     const t = setTimeout(() => setIsPageLoading(false), 250);
//     return () => clearTimeout(t);
//   }, [location.pathname]);

//   /* Scroll to top on route change */
//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "instant" });
//   }, [location.pathname]);

//   /* Real viewport height fix (mobile browsers) */
//   useEffect(() => {
//     const setVH = () => {
//       document.documentElement.style.setProperty(
//         "--vh",
//         `${window.innerHeight * 0.01}px`
//       );
//     };

//     setVH();
//     window.addEventListener("resize", setVH, { passive: true });
//     window.addEventListener("orientationchange", setVH);

//     return () => {
//       window.removeEventListener("resize", setVH);
//       window.removeEventListener("orientationchange", setVH);
//     };
//   }, []);

//   const shouldHideFooter = useMemo(
//     () =>
//       location.pathname.includes("/checkout") ||
//       location.pathname.includes("/cart"),
//     [location.pathname]
//   );

//   const useCompactFooter = useMemo(
//     () =>
//       location.pathname.includes("/product/") ||
//       location.pathname.includes("/shop/listing") ||
//       location.pathname.includes("/shop/search"),
//     [location.pathname]
//   );

//   const DeviceIcon = useMemo(
//     () =>
//       ({
//         mobile: Smartphone,
//         tablet: Tablet,
//         desktop: Monitor,
//       }[device]),
//     [device]
//   );

//   return (
//     <ErrorBoundary showHomeButton showDetails={import.meta.env.DEV}>
//       <div className="flex flex-col min-h-screen bg-background antialiased relative">
//         <PerformanceMonitor />

//         <PageLoadingIndicator isLoading={isPageLoading} />
//         <NetworkStatus />

//         {/* Header */}
//         <div className="fixed top-0 left-0 right-0 z-50">
//           <ShoppingHeader />
//         </div>

//         {/* Main */}
//         <main
//           className={cn(
//             "flex-1 w-full pt-16 relative overflow-x-hidden transition-opacity duration-300",
//             isPageLoading && "opacity-80"
//           )}
//         >
//           <div className="w-full mx-auto max-w-[1920px]">
//             <Suspense
//               fallback={
//                 <div className="flex items-center justify-center min-h-[60vh]">
//                   <div className="text-center space-y-4">
//                     <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
//                     <p className="text-muted-foreground">
//                       Loading your shopping experience…
//                     </p>
//                   </div>
//                 </div>
//               }
//             >
//               <Outlet />
//             </Suspense>
//           </div>

//           <ScrollToTopButton />

//           {import.meta.env.DEV && (
//             <div className="fixed bottom-32 left-4 z-40">
//               <div className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm rounded-full border text-xs">
//                 {DeviceIcon && <DeviceIcon className="h-3 w-3" />}
//                 <span className="font-medium capitalize">{device}</span>
//               </div>
//             </div>
//           )}
//         </main>

//         {/* Footer */}
//         {!shouldHideFooter && (
//           <div className="relative z-30 mt-auto">
//             {useCompactFooter ? <CompactFooter /> : <ShoppingFooter />}
//           </div>
//         )}

//         {/* Toasts */}
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             className: "bg-background border",
//             duration: 4000,
//           }}
//         />

//         {/* Accessibility */}
//         <a
//           href="#main-content"
//           className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md"
//         >
//           Skip to main content
//         </a>
//         <div id="main-content" className="sr-only" aria-hidden="true" />
//       </div>
//     </ErrorBoundary>
//   );
// }

// export default ShoppingLayout;


import { Outlet, useLocation } from "react-router-dom";
import ShoppingHeader from "../shoping-view/header";
import {
  useEffect,
  useState,
  useCallback,
  Suspense,
  useMemo,
} from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowUp,
  Loader2,
  Smartphone,
  Tablet,
  Monitor,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingFooter, CompactFooter } from "../shoping-view/footer";
import ErrorBoundary from "../ErrorBoundary";

/* -------------------------------------------------------------------------- */
/*                               DEVICE DETECTION                             */
/* -------------------------------------------------------------------------- */

const useDeviceDetection = () => {
  const [device, setDevice] = useState("desktop");

  useEffect(() => {
    let rafId = null;

    const detect = () => {
      const w = window.innerWidth;
      if (w < 768) setDevice("mobile");
      else if (w < 1024) setDevice("tablet");
      else setDevice("desktop");
    };

    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(detect);
    };

    detect();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return device;
};

/* -------------------------------------------------------------------------- */
/*                          PAGE LOADING INDICATOR                             */
/* -------------------------------------------------------------------------- */

const PageLoadingIndicator = ({ isLoading }) => (
  <div className="fixed top-16 left-0 right-0 z-[100] h-1 bg-primary/10 overflow-hidden pointer-events-none">
    <div
      className={cn(
        "h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300",
        isLoading ? "w-full" : "w-0"
      )}
    />
  </div>
);

/* -------------------------------------------------------------------------- */
/*                           SCROLL TO TOP BUTTON                              */
/* -------------------------------------------------------------------------- */

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      aria-label="Scroll to top"
      className={cn(
        "fixed right-4 sm:right-6 bottom-24 sm:bottom-6 z-40",
        "h-12 w-12 rounded-full shadow-2xl shadow-primary/20",
        "bg-background border-2 border-primary/20",
        "backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
        "transition-all duration-300 transform",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-10 scale-95 pointer-events-none"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

/* -------------------------------------------------------------------------- */
/*                          PERFORMANCE MONITOR (DEV)                          */
/* -------------------------------------------------------------------------- */

const PerformanceMonitor = () => {
  useEffect(() => {
    if (import.meta.env.DEV && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.debug(
            `[Perf] ${entry.name}: ${entry.duration.toFixed(2)}ms`
          );
        });
      });

      observer.observe({
        entryTypes: ["navigation", "measure", "resource"],
      });

      return () => observer.disconnect();
    }
  }, []);

  return null;
};

/* -------------------------------------------------------------------------- */
/*                                NETWORK STATUS                               */
/* -------------------------------------------------------------------------- */

const NetworkStatus = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowNotification(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50",
        "px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5",
        online ? "bg-green-500 text-white" : "bg-red-500 text-white"
      )}
    >
      {online ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You're offline. Some features may not work.
          </span>
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN LAYOUT                                  */
/* -------------------------------------------------------------------------- */

function ShoppingLayout() {
  const location = useLocation();
  const device = useDeviceDetection();

  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    const t = setTimeout(() => setIsPageLoading(false), 250);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    setVH();
    window.addEventListener("resize", setVH, { passive: true });
    window.addEventListener("orientationchange", setVH);

    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  const shouldHideFooter = useMemo(
    () =>
      location.pathname.includes("/checkout") ||
      location.pathname.includes("/cart"),
    [location.pathname]
  );

  const useCompactFooter = useMemo(
    () =>
      location.pathname.includes("/product/") ||
      location.pathname.includes("/shop/listing") ||
      location.pathname.includes("/shop/search"),
    [location.pathname]
  );

  const DeviceIcon = useMemo(
    () =>
      ({
        mobile: Smartphone,
        tablet: Tablet,
        desktop: Monitor,
      }[device]),
    [device]
  );

  return (
    <ErrorBoundary showHomeButton showDetails={import.meta.env.DEV}>
      <div className="flex flex-col min-h-screen bg-background antialiased relative">
        <PerformanceMonitor />

        <PageLoadingIndicator isLoading={isPageLoading} />
        <NetworkStatus />

        <div className="fixed top-0 left-0 right-0 z-50">
          <ShoppingHeader />
        </div>

        <main
          className={cn(
            "flex-1 w-full pt-16 relative overflow-x-hidden transition-opacity duration-300",
            isPageLoading && "opacity-80"
          )}
        >
          <div className="w-full mx-auto max-w-[1920px]">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">
                      Loading your shopping experience…
                    </p>
                  </div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>

          <ScrollToTopButton />

          {import.meta.env.DEV && (
            <div className="fixed bottom-32 left-4 z-40">
              <div className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm rounded-full border text-xs">
                {DeviceIcon && <DeviceIcon className="h-3 w-3" />}
                <span className="font-medium capitalize">{device}</span>
              </div>
            </div>
          )}
        </main>

        {!shouldHideFooter && (
          <div className="relative z-30 mt-auto">
            {useCompactFooter ? <CompactFooter /> : <ShoppingFooter />}
          </div>
        )}

        <Toaster
          position="top-right"
          toastOptions={{
            className: "bg-background border",
            duration: 4000,
          }}
        />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Skip to main content
        </a>
        <div id="main-content" className="sr-only" aria-hidden="true" />
      </div>
    </ErrorBoundary>
  );
}

export default ShoppingLayout;

