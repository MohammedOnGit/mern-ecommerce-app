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
  shipped: { variant: "outline", label: "On the Way", icon: Truck, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
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

  const currentStatus =
    (order.orderStatus || "pending") === "shipped"
      ? "shipping"
      : order.orderStatus || "pending";

  const status = statusConfig[currentStatus] || statusConfig.pending;
  const StatusIcon = status.icon;

  const orderNumber =
    order.paymentId ||
    `ORD-${order._id?.slice(-6)?.toUpperCase() || "XXXXXX"}`;

  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date not available";

  const subtotal = order.subtotal || order.totalAmount || 0;
  const shippingFee = order.shippingFee || 0;
  const tax = order.tax || 0;
  const total = order.totalAmount || 0;

  const getOrderProgress = () => {
    const statusOrder = ["pending", "processing", "confirmed", "shipping", "delivered"];
    const index = statusOrder.indexOf(currentStatus);
    return index >= 0 ? ((index + 1) / statusOrder.length) * 100 : 0;
  };

  const timelineSteps = [
    { stage: "pending", label: "Order Placed", date: orderDate, completed: true },
    { stage: "processing", label: "Processing", date: "Processing", completed: ["processing", "confirmed", "shipping", "delivered"].includes(currentStatus) },
    { stage: "confirmed", label: "Confirmed", date: "Confirmed", completed: ["confirmed", "shipping", "delivered"].includes(currentStatus) },
    { stage: "shipping", label: "Shipped", date: "Shipping soon", completed: ["shipping", "delivered"].includes(currentStatus) },
    { stage: "delivered", label: "Delivered", date: "Est. 3–5 days", completed: currentStatus === "delivered" },
  ];

  return (
    <DialogContent className="w-full max-w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] sm:max-w-6xl flex flex-col overflow-hidden p-0">
      {/* Header */}
      <DialogHeader className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="sm:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <DialogTitle className="text-xl sm:text-2xl font-bold">
                  Order #{orderNumber}
                </DialogTitle>
                <Badge variant={status.variant} className="gap-1.5 px-3 py-1.5">
                  <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {orderDate}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {order.cartItems?.length || 0} items
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  {order.paymentMethod || "Paystack"}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex gap-2">
            <Button variant="outline" size="sm"><Printer className="h-4 w-4" /> Print</Button>
            <Button variant="outline" size="sm"><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
          </div>
        </div>

        <div className="flex gap-1 mt-4 overflow-x-auto">
          {["details", "timeline", "items", "support"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </DialogHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Progress value={getOrderProgress()} className="h-2" />

        {/* Items Table */}
        {order.cartItems && (
          <div className="bg-card border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.cartItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">GHC {item.price?.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">
                      GHC {(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex justify-between"><span>Subtotal</span><span>GHC {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shippingFee === 0 ? "Free" : `GHC ${shippingFee}`}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>GHC {tax.toFixed(2)}</span></div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold"><span>Total</span><span>GHC {total.toFixed(2)}</span></div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
