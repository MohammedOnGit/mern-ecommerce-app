// // pages/PayPalReturn.jsx - CREATE THIS FILE
// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// function PayPalReturn() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [status, setStatus] = useState("processing");
//   const [message, setMessage] = useState("Processing your payment...");

//   useEffect(() => {
//     const handleReturn = async () => {
//       try {
//         const params = new URLSearchParams(location.search);
//         const orderId = params.get("orderId");
        
//         if (!orderId) {
//           setStatus("error");
//           setMessage("No order ID found. Please contact support.");
//           return;
//         }

//         const response = await fetch("http://localhost:5000/api/shop/orders/capture", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ orderId }),
//         });

//         const data = await response.json();

//         if (data.success) {
//           setStatus("success");
//           setMessage("Payment successful! Your order has been confirmed.");
          
//           // Clear cart from localStorage if exists
//           localStorage.removeItem("cartItems");
          
//           // Redirect to order confirmation after 3 seconds
//           setTimeout(() => {
//             navigate(`/order-confirmation/${orderId}`);
//           }, 3000);
//         } else {
//           setStatus("error");
//           setMessage(data.message || "Payment failed. Please try again.");
//         }
//       } catch (error) {
//         console.error("Payment processing error:", error);
//         setStatus("error");
//         setMessage("An error occurred while processing your payment.");
//       }
//     };

//     handleReturn();
//   }, [location, navigate]);

//   const StatusIcon = () => {
//     switch (status) {
//       case "processing":
//         return <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />;
//       case "success":
//         return (
//           <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//             <CheckCircle className="h-10 w-10 text-green-600" />
//           </div>
//         );
//       case "error":
//         return (
//           <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
//             <XCircle className="h-10 w-10 text-red-600" />
//           </div>
//         );
//       default:
//         return <AlertCircle className="h-16 w-16 text-gray-500 mx-auto" />;
//     }
//   };

//   const StatusTitle = () => {
//     switch (status) {
//       case "processing":
//         return "Processing Payment";
//       case "success":
//         return "Payment Successful!";
//       case "error":
//         return "Payment Failed";
//       default:
//         return "Payment Status";
//     }
//   };

//   const StatusColor = () => {
//     switch (status) {
//       case "processing":
//         return "text-blue-600";
//       case "success":
//         return "text-green-600";
//       case "error":
//         return "text-red-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
//         <div className="mb-6">
//           <StatusIcon />
//         </div>
        
//         <h1 className={`text-2xl font-bold mb-2 ${StatusColor()}`}>
//           {StatusTitle()}
//         </h1>
        
//         <p className="text-gray-600 mb-6">{message}</p>
        
//         {status === "processing" && (
//           <div className="space-y-4">
//             <div className="flex justify-center">
//               <div className="animate-pulse flex space-x-2">
//                 <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
//                 <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
//                 <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
//               </div>
//             </div>
//             <p className="text-sm text-gray-500">
//               Please wait while we confirm your payment...
//             </p>
//           </div>
//         )}
        
//         {status === "success" && (
//           <div className="space-y-4">
//             <p className="text-sm text-gray-500 mb-4">
//               You will be redirected to your order confirmation page shortly...
//             </p>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div className="bg-green-500 h-2 rounded-full animate-pulse w-full"></div>
//             </div>
//           </div>
//         )}
        
//         {status === "error" && (
//           <div className="space-y-3">
//             <Button
//               className="w-full bg-blue-600 hover:bg-blue-700"
//               onClick={() => navigate("/shop/checkout")}
//             >
//               Try Again
//             </Button>
//             <Button
//               className="w-full"
//               variant="outline"
//               onClick={() => navigate("/shop")}
//             >
//               Continue Shopping
//             </Button>
//             <Button
//               className="w-full"
//               variant="ghost"
//               onClick={() => navigate("/shop/account")}
//             >
//               View Account
//             </Button>
//           </div>
//         )}
        
//         <div className="mt-8 pt-6 border-t">
//           <p className="text-xs text-gray-500">
//             Having issues?{" "}
//             <a 
//               href="mailto:support@yourstore.com" 
//               className="text-blue-600 hover:underline"
//             >
//               Contact support
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PayPalReturn;