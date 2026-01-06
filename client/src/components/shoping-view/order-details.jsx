// // export default ShoppingOrderDetailsView;
// import React, { useState } from "react";
// import {
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "../ui/dialog";
// import { Badge } from "../ui/badge";
// import { Separator } from "../ui/separator";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../ui/table";
// import {
//   Package,
//   Truck,
//   CheckCircle2,
//   X,
//   MapPin,
//   Phone,
//   User,
//   Calendar,
//   CreditCard,
//   ShieldCheck,
//   Clock,
//   PackageOpen,
//   Download,
//   MessageSquare,
//   HelpCircle,
//   Eye,
//   ArrowLeft,
//   Globe,
//   Printer,
//   Share2,
// } from "lucide-react";
// import { Button } from "../ui/button";
// import { cn } from "@/lib/utils";
// import { Progress } from "../ui/progress";

// const statusConfig = {
//   pending: { variant: "default", label: "Pending", icon: Clock, color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
//   processing: { variant: "secondary", label: "Processing", icon: Package, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
//   shipping: { variant: "outline", label: "On the Way", icon: Truck, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
//   delivered: { variant: "success", label: "Delivered", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
//   rejected: { variant: "destructive", label: "Cancelled", icon: X, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
// };

// const ghanaRegions = {
//   "Greater Accra": { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
//   "Ashanti": { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
//   "Eastern": { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
//   "Western": { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
//   "Northern": { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
// };

// function ShoppingOrderDetailsView({ order, onClose }) {
//   const [activeTab, setActiveTab] = useState("details");
//   const currentStatus = order?.status || "processing";
//   const status = statusConfig[currentStatus];
//   const StatusIcon = status.icon;
//   const customerRegion = order?.region || "Northern";
//   const regionInfo = ghanaRegions[customerRegion] || { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };

//   const orderItems = [
//     { id: 1, name: "Wireless Headset", description: "Premium Audio • Noise Cancelling • Black", quantity: 1, price: 200.0, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100", sku: "SKU-78901" },
//     { id: 2, name: "USB-C Charger", description: "Fast Charging • 65W • GaN Technology", quantity: 2, price: 125.0, image: "https://images.unsplash.com/photo-1594736797933-d0c6e2d8e5a5?w=100", sku: "SKU-78902" },
//   ];

//   const timelineSteps = [
//     { stage: "pending", label: "Order Placed", date: "12 Dec, 2:30 PM", completed: true },
//     { stage: "processing", label: "Processing", date: "12 Dec, 3:45 PM", completed: true },
//     { stage: "shipping", label: "Shipped", date: "13 Dec, 10:15 AM", completed: false },
//     { stage: "delivered", label: "Delivered", date: "Est. 15-18 Dec", completed: false },
//   ];

//   const completedSteps = timelineSteps.filter((step) => step.completed).length;
//   const progressPercentage = (completedSteps / timelineSteps.length) * 100;

//   return (
//     <DialogContent className="w-full max-w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] sm:max-w-6xl flex flex-col overflow-hidden p-0">
//       {/* Header */}
//       <DialogHeader className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b supports-[backdrop-filter]:bg-background/60 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 sm:hidden">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>

//             <div>
//               <div className="flex items-center gap-3 flex-wrap">
//                 <DialogTitle className="text-xl sm:text-2xl font-bold">
//                   Order #{order?.id || "122355"}
//                 </DialogTitle>
//                 <Badge variant={status.variant} className="gap-1.5 px-3 py-1.5 font-medium">
//                   <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
//                   {status.label}
//                 </Badge>
//               </div>

//               <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
//                 <div className="flex items-center gap-1">
//                   <Calendar className="h-3.5 w-3.5" />
//                   Placed on {order?.date || "12 Dec 2025"}
//                 </div>
//                 <div className="hidden sm:block">•</div>
//                 <div className="flex items-center gap-1">
//                   <Package className="h-3.5 w-3.5" />
//                   {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
//                 </div>
//                 <div className="hidden sm:block">•</div>
//                 <div className="flex items-center gap-1">
//                   <CreditCard className="h-3.5 w-3.5" />
//                   {order?.payment || "Mobile Money"}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="hidden sm:flex items-center gap-2">
//             <Button variant="outline" size="sm" className="gap-2">
//               <Printer className="h-4 w-4" /> Print
//             </Button>
//             <Button variant="outline" size="sm" className="gap-2">
//               <Share2 className="h-4 w-4" /> Share
//             </Button>
//             <Button variant="ghost" size="icon" onClick={onClose}>
//               <X className="h-5 w-5" />
//             </Button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide">
//           {["details", "timeline", "items", "support"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={cn(
//                 "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
//                 activeTab === tab
//                   ? "border-primary text-primary"
//                   : "border-transparent text-muted-foreground hover:text-foreground"
//               )}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>
//       </DialogHeader>

//       {/* Content */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="p-4 sm:p-6 space-y-6">
//           {/* Status Progress */}
//           {activeTab === "details" && (
//             <div className="bg-card border rounded-xl p-6">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//                 <h3 className="text-lg font-semibold">Delivery Progress</h3>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <Badge variant="outline" className="gap-1.5">
//                     <Globe className="h-3.5 w-3.5" /> Shipping within Ghana
//                   </Badge>
//                   <Button variant="ghost" size="sm" className="gap-1.5">
//                     <Eye className="h-3.5 w-3.5" /> Track Live
//                   </Button>
//                 </div>
//               </div>

//               <Progress value={progressPercentage} className="h-2 mb-8" />

//               <div className="flex justify-between items-center">
//                 {timelineSteps.map((step, index) => {
//                   const stepConfig = statusConfig[step.stage];
//                   const StepIcon = stepConfig?.icon || Clock;
//                   const isCompleted = step.completed;
//                   const isCurrent = step.stage === currentStatus;

//                   return (
//                     <div key={step.stage} className="flex-1 flex flex-col items-center relative">
//                       <div
//                         className={cn(
//                           "h-12 w-12 rounded-full flex items-center justify-center mb-2 border-2 transition-all duration-300",
//                           isCompleted
//                             ? "bg-primary text-primary-foreground border-primary"
//                             : isCurrent
//                             ? "bg-background border-primary text-primary"
//                             : "bg-muted text-muted-foreground border-muted"
//                         )}
//                       >
//                         <StepIcon className="h-5 w-5" />
//                       </div>
//                       <span className={cn("text-sm font-medium", isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground")}>
//                         {step.label}
//                       </span>
//                       <span className="text-xs text-muted-foreground">{step.date}</span>
//                       {index < timelineSteps.length - 1 && (
//                         <div className={cn(
//                           "absolute top-5 right-0 h-0.5 w-full bg-muted sm:bg-primary sm:left-1/2 sm:right-auto",
//                           isCompleted ? "bg-primary" : "bg-muted"
//                         )}></div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Two Column Layout */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Main Content */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Order Summary Cards */}
//               {activeTab === "details" && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <div className="bg-card border rounded-xl p-5">
//                     <div className="flex items-start justify-between mb-3">
//                       <div>
//                         <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
//                         <p className="font-semibold">Mobile Money (MTN)</p>
//                         <div className="flex items-center gap-1 mt-2">
//                           <ShieldCheck className="h-3 w-3 text-green-500" />
//                           <span className="text-xs text-muted-foreground">Verified</span>
//                         </div>
//                       </div>
//                       <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
//                         <CreditCard className="h-5 w-5 text-green-600" />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-card border rounded-xl p-5">
//                     <div className="flex items-start justify-between mb-3">
//                       <div>
//                         <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
//                         <p className="font-semibold text-green-600">Paid</p>
//                         <p className="text-xs text-muted-foreground mt-2">GHC {order?.total?.toFixed(2) || "450.00"}</p>
//                       </div>
//                       <CheckCircle2 className="h-5 w-5 text-green-500" />
//                     </div>
//                   </div>

//                   <div className="bg-card border rounded-xl p-5">
//                     <div className="flex items-start justify-between mb-3">
//                       <div>
//                         <p className="text-sm text-muted-foreground mb-2">Delivery Estimate</p>
//                         <p className="font-semibold">{order?.deliveryDate || "18–22 Dec 2025"}</p>
//                         <p className="text-xs text-muted-foreground mt-2">Standard Shipping</p>
//                       </div>
//                       <Truck className="h-5 w-5 text-muted-foreground" />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Items Table */}
//               {(activeTab === "items" || activeTab === "details") && (
//                 <div className="bg-card border rounded-xl overflow-hidden">
//                   <div className="p-6">
//                     <h3 className="text-lg font-semibold mb-6">Order Items ({orderItems.length})</h3>
//                     <div className="overflow-x-auto">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>Product</TableHead>
//                             <TableHead className="text-center">SKU</TableHead>
//                             <TableHead className="text-center">Quantity</TableHead>
//                             <TableHead className="text-right">Price</TableHead>
//                             <TableHead className="text-right">Total</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {orderItems.map((item) => (
//                             <TableRow key={item.id} className="hover:bg-muted/30">
//                               <TableCell>
//                                 <div className="flex items-center gap-3">
//                                   <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
//                                   <div>
//                                     <p className="font-medium">{item.name}</p>
//                                     <p className="text-sm text-muted-foreground">{item.description}</p>
//                                   </div>
//                                 </div>
//                               </TableCell>
//                               <TableCell className="text-center">
//                                 <code className="text-xs bg-muted px-2 py-1 rounded">{item.sku}</code>
//                               </TableCell>
//                               <TableCell className="text-center font-medium">{item.quantity}</TableCell>
//                               <TableCell className="text-right">GHC {item.price.toFixed(2)}</TableCell>
//                               <TableCell className="text-right font-bold">GHC {(item.price * item.quantity).toFixed(2)}</TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-6">
//               {/* Order Summary */}
//               <div className="bg-card border rounded-xl p-6 sticky top-6">
//                 <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Subtotal ({orderItems.length} items)</span>
//                     <span>GHC 450.00</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Shipping</span>
//                     <span className="text-green-600">Free</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Tax (VAT)</span>
//                     <span>GHC 68.18</span>
//                   </div>
//                   <Separator className="my-4" />
//                   <div className="flex justify-between text-lg font-bold">
//                     <span>Total</span>
//                     <span>GHC {order?.total?.toFixed(2) || "450.00"}</span>
//                   </div>
//                 </div>

//                 <div className="space-y-3 mt-8">
//                   <Button className="w-full gap-2">
//                     <Truck className="h-4 w-4" /> Track Delivery
//                   </Button>
//                   <Button variant="outline" className="w-full gap-2">
//                     <Download className="h-4 w-4" /> Download Invoice
//                   </Button>
//                   <Button variant="outline" className="w-full gap-2">
//                     <HelpCircle className="h-4 w-4" /> Need Help?
//                   </Button>
//                 </div>
//               </div>

//               {/* Delivery Address */}
//               <div className="bg-card border rounded-xl p-6">
//                 <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
//                   <MapPin className="h-5 w-5" /> Delivery Address
//                 </h3>

//                 <div className="space-y-4">
//                   <div className={`p-4 ${regionInfo.bg} rounded-lg border ${regionInfo.border}`}>
//                     <div className="flex items-center gap-2 mb-3">
//                       <Home className={`h-4 w-4 ${regionInfo.color}`} />
//                       <p className="font-medium">Shipping Address</p>
//                     </div>
//                     <p className="text-foreground">Tamale, Northern Region</p>
//                     <p className="text-sm text-muted-foreground mt-2">Ghana Postal Code: TL-1234</p>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="flex items-center gap-3">
//                       <div className={`h-10 w-10 rounded-full ${regionInfo.bg} flex items-center justify-center flex-shrink-0`}>
//                         <User className={`h-5 w-5 ${regionInfo.color}`} />
//                       </div>
//                       <div>
//                         <p className="font-medium">{order?.recipientName || "Abdulai Adam"}</p>
//                         <p className="text-sm text-muted-foreground">{order?.recipientPhone || "+233 24 977 5637"}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DialogContent>
//   );
// }

// export default ShoppingOrderDetailsView;


// components/shoping-view/order-details.jsx - UPDATED
import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Package,
  Truck,
  CheckCircle2,
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  ShieldCheck,
  Clock,
  Download,
  MessageSquare,
  HelpCircle,
  Eye,
  ArrowLeft,
  Globe,
  Printer,
  Share2,
  Home,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

const statusConfig = {
  pending: { variant: "default", label: "Pending", icon: Clock, color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  processing: { variant: "secondary", label: "Processing", icon: Package, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  confirmed: { variant: "outline", label: "Confirmed", icon: ShieldCheck, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  shipping: { variant: "outline", label: "On the Way", icon: Truck, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  delivered: { variant: "success", label: "Delivered", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  cancelled: { variant: "destructive", label: "Cancelled", icon: X, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
  failed: { variant: "destructive", label: "Failed", icon: X, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
};

function ShoppingOrderDetailsView({ order, onClose }) {
  const [activeTab, setActiveTab] = useState("details");

  if (!order) {
    return (
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6">
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="p-6 text-center">
          <p className="text-gray-500">No order data available</p>
        </div>
      </DialogContent>
    );
  }

  const currentStatus = order.orderStatus || "pending";
  const status = statusConfig[currentStatus] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  const orderNumber = order.paymentId || `ORD-${order._id?.slice(-6)?.toUpperCase() || 'XXXXXX'}`;
  const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not available';
  
  // Calculate order totals
  const subtotal = order.subtotal || order.totalAmount || 0;
  const shippingFee = order.shippingFee || 0;
  const tax = order.tax || 0;
  const total = order.totalAmount || 0;
  
  // Calculate order progress
  const getOrderProgress = () => {
    const statusOrder = ['pending', 'processing', 'confirmed', 'shipping', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  // Create timeline steps based on order status
  const getTimelineSteps = () => {
    const steps = [
      { stage: 'pending', label: 'Order Placed', date: orderDate, completed: true },
      { stage: 'processing', label: 'Processing', date: 'Processing', completed: ['processing', 'confirmed', 'shipping', 'delivered'].includes(currentStatus) },
      { stage: 'confirmed', label: 'Confirmed', date: 'Confirmed', completed: ['confirmed', 'shipping', 'delivered'].includes(currentStatus) },
      { stage: 'shipping', label: 'Shipped', date: 'Shipping soon', completed: ['shipping', 'delivered'].includes(currentStatus) },
      { stage: 'delivered', label: 'Delivered', date: 'Est. 3-5 days', completed: currentStatus === 'delivered' },
    ];
    
    return steps;
  };

  const timelineSteps = getTimelineSteps();
  const progressPercentage = getOrderProgress();

  return (
    <DialogContent className="w-full max-w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] sm:max-w-6xl flex flex-col overflow-hidden p-0">
      {/* Header */}
      <DialogHeader className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 sm:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <DialogTitle className="text-xl sm:text-2xl font-bold">
                  Order #{orderNumber}
                </DialogTitle>
                <Badge variant={status.variant} className="gap-1.5 px-3 py-1.5 font-medium">
                  <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {orderDate}
                </div>
                <div className="hidden sm:block">•</div>
                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {order.cartItems?.length || 0} item{order.cartItems?.length !== 1 ? "s" : ""}
                </div>
                <div className="hidden sm:block">•</div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  {order.paymentMethod || 'Paystack'}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide">
          {["details", "timeline", "items", "support"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </DialogHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Status Progress */}
          {activeTab === "details" && (
            <div className="bg-card border rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold">Order Progress</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Shipping within Ghana
                  </Badge>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Track Live
                  </Button>
                </div>
              </div>

              <Progress value={progressPercentage} className="h-2 mb-8" />

              <div className="flex justify-between items-center">
                {timelineSteps.map((step, index) => {
                  const stepConfig = statusConfig[step.stage];
                  const StepIcon = stepConfig?.icon || Clock;
                  const isCompleted = step.completed;
                  const isCurrent = step.stage === currentStatus;

                  return (
                    <div key={step.stage} className="flex-1 flex flex-col items-center relative">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center mb-2 border-2 transition-all duration-300",
                          isCompleted
                            ? "bg-primary text-primary-foreground border-primary"
                            : isCurrent
                            ? "bg-background border-primary text-primary"
                            : "bg-muted text-muted-foreground border-muted"
                        )}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span className={cn("text-sm font-medium", isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{step.date}</span>
                      {index < timelineSteps.length - 1 && (
                        <div className={cn(
                          "absolute top-5 right-0 h-0.5 w-full bg-muted sm:bg-primary sm:left-1/2 sm:right-auto",
                          isCompleted ? "bg-primary" : "bg-muted"
                        )}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary Cards */}
              {activeTab === "details" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-card border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                        <p className="font-semibold">{order.paymentMethod === 'paystack' ? 'Mobile Money/Card' : order.paymentMethod || 'Paystack'}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <ShieldCheck className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-muted-foreground">{order.paymentStatus === 'completed' ? 'Verified' : 'Pending'}</span>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                        <p className={cn(
                          "font-semibold",
                          order.paymentStatus === 'completed' ? 'text-green-600' : 
                          order.paymentStatus === 'pending' ? 'text-amber-600' : 
                          'text-red-600'
                        )}>
                          {order.paymentStatus || 'pending'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">GHC {total.toFixed(2)}</p>
                      </div>
                      {order.paymentStatus === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                  </div>

                  <div className="bg-card border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Delivery Estimate</p>
                        <p className="font-semibold">3-5 business days</p>
                        <p className="text-xs text-muted-foreground mt-2">Standard Shipping</p>
                      </div>
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              {(activeTab === "items" || activeTab === "details") && order.cartItems && (
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Order Items ({order.cartItems.length})</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.cartItems.map((item, index) => (
                            <TableRow key={index} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.image && (
                                    <img 
                                      src={item.image} 
                                      alt={item.title} 
                                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0" 
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{item.title}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                              <TableCell className="text-right">GHC {item.price?.toFixed(2) || '0.00'}</TableCell>
                              <TableCell className="text-right font-bold">
                                GHC {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-card border rounded-xl p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({order.cartItems?.length || 0} items)</span>
                    <span>GHC {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shippingFee === 0 ? "text-green-600" : ""}>
                      {shippingFee === 0 ? "Free" : `GHC ${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (VAT)</span>
                    <span>GHC {tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>GHC {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 mt-8">
                  <Button className="w-full gap-2">
                    <Truck className="h-4 w-4" /> Track Delivery
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" /> Download Invoice
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <HelpCircle className="h-4 w-4" /> Need Help?
                  </Button>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Delivery Address
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Home className="h-4 w-4 text-blue-600" />
                      <p className="font-medium">Shipping Address</p>
                    </div>
                    <p className="text-foreground">{order.addressInfo?.address || 'Address not specified'}</p>
                    <p className="text-foreground">{order.addressInfo?.city || 'City not specified'}</p>
                    {order.addressInfo?.digitalAddress && (
                      <p className="text-sm text-muted-foreground mt-2">Digital Address: {order.addressInfo.digitalAddress}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{order.addressInfo?.fullName || 'Customer Name'}</p>
                        {order.addressInfo?.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground">{order.addressInfo.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
