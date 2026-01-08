import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  X,
  Package,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  Truck,
  PackageOpen,
  AlertCircle,
  Download,
  Printer,
  MessageCircle,
  Mail,
  Bell,
  Shield,
  Edit,
  Copy,
  ShoppingBag,
  Clock,
  DollarSign,
  ChevronLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus, selectAdminOrderUpdating } from "@/store/admin/order-slice";

const statusVariants = {
  pending: {
    variant: "default",
    icon: AlertCircle,
    color: "bg-yellow-50 text-yellow-800 border-yellow-200",
    label: "Pending",
    nextActions: ["processing", "cancelled"]
  },
  processing: {
    variant: "secondary",
    icon: PackageOpen,
    color: "bg-blue-50 text-blue-800 border-blue-200",
    label: "Processing",
    nextActions: ["confirmed", "cancelled"]
  },
  confirmed: {
    variant: "default",
    icon: CheckCircle,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    label: "Confirmed",
    nextActions: ["shipped", "cancelled"]
  },
  shipped: {
    variant: "outline",
    icon: Truck,
    color: "bg-purple-50 text-purple-800 border-purple-200",
    label: "Shipped",
    nextActions: ["delivered"]
  },
  delivered: {
    variant: "success",
    icon: CheckCircle,
    color: "bg-green-50 text-green-800 border-green-200",
    label: "Delivered",
    nextActions: []
  },
  cancelled: {
    variant: "destructive",
    icon: X,
    color: "bg-red-50 text-red-800 border-red-200",
    label: "Cancelled",
    nextActions: []
  },
};

function AdminOrderDetailsView({ order, onClose }) {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const isUpdating = useSelector(selectAdminOrderUpdating);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Current status config
  const currentStatus = order?.orderStatus || "pending";
  const statusConfig = statusVariants[currentStatus] || statusVariants.pending;
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "GHS 0.00";
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleStatusUpdate = async (newStatus) => {
    // Get the order ID from the order object
    const orderId = order?._id || order?.id;
    
    if (!orderId) {
      console.error("Order ID not found. Order object:", order);
      toast.error("Cannot update: Order ID not found");
      return;
    }
    
    console.log("🔄 Update button clicked - Order ID:", orderId, "New Status:", newStatus);
    
    try {
      // Check if the order ID is valid (not undefined or null)
      if (!orderId || orderId === "undefined" || orderId === "null") {
        toast.error("Invalid order ID");
        return;
      }
      
      const result = await dispatch(updateOrderStatus({ 
        orderId, 
        status: newStatus 
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Order status updated to ${newStatus}`);
      } else if (result.meta.requestStatus === 'rejected') {
        console.error("Update rejected:", result.error);
        toast.error(result.error?.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update order status");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleSendNotification = (type) => {
    console.log(`Sending ${type} notification for order ${order?._id}`);
    toast.info(`Sending ${type} notification...`);
    // TODO: Implement notification API
  };

  const getStatusButtonConfig = (status) => {
    const configs = {
      processing: {
        label: "Mark as Processing",
        icon: PackageOpen,
        variant: "default",
        color: "bg-blue-500 hover:bg-blue-600"
      },
      confirmed: {
        label: "Mark as Confirmed",
        icon: CheckCircle,
        variant: "default",
        color: "bg-emerald-500 hover:bg-emerald-600"
      },
      shipped: {
        label: "Mark as Shipped",
        icon: Truck,
        variant: "default",
        color: "bg-purple-500 hover:bg-purple-600"
      },
      delivered: {
        label: "Mark as Delivered",
        icon: CheckCircle,
        variant: "default",
        color: "bg-green-500 hover:bg-green-600"
      },
      cancelled: {
        label: "Cancel Order",
        icon: X,
        variant: "destructive",
        color: "bg-red-500 hover:bg-red-600"
      }
    };
    return configs[status] || { label: `Mark as ${status}`, icon: CheckCircle, variant: "default" };
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Debug: Log order object to see its structure
  useEffect(() => {
    if (order) {
      console.log("📊 Order object structure:", {
        orderId: order._id,
        id: order.id,
        orderNumber: order.orderNumber,
        fullOrder: order
      });
    }
  }, [order]);

  return (
    <DialogContent className="w-full max-w-full h-[100dvh] sm:max-h-[95vh] sm:max-w-6xl flex flex-col overflow-hidden p-0 bg-background">
      {/* Header */}
      <DialogHeader className="sticky top-0 z-50 bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2 shrink-0"
                onClick={() => onClose?.()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg sm:text-xl font-semibold truncate">
                  {order.orderNumber || `ORD-${order._id?.slice(-8).toUpperCase()}`}
                </DialogTitle>
                <Badge 
                  variant={statusConfig.variant}
                  className={`${statusConfig.color} border px-3 py-1 font-medium flex items-center gap-1.5`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span className="capitalize">{statusConfig.label}</span>
                </Badge>
              </div>
              
              <DialogDescription className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(order.orderDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  {formatCurrency(order.totalAmount)}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {order.cartItems?.length || 0} items
                </span>
              </DialogDescription>
            </div>
          </div>

          {/* Desktop Actions */}
          {!isMobile && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onClose?.()}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintInvoice}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleSendNotification("email")}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          )}
        </div>
      </DialogHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Order Items & Customer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-card border rounded-lg">
              <div className="p-5 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Items
                  </h3>
                  <Badge variant="outline" className="text-sm">
                    {order.cartItems?.length || 0} items
                  </Badge>
                </div>
              </div>
              
              <div className="p-1">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Product</TableHead>
                        <TableHead className="text-center w-[15%]">Qty</TableHead>
                        <TableHead className="text-right w-[20%]">Price</TableHead>
                        <TableHead className="text-right w-[25%]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.cartItems?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name || "Product"}</p>
                              {item.sku && (
                                <p className="text-sm text-muted-foreground">
                                  SKU: {item.sku}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">{item.quantity || 1}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price || 0)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency((item.price || 0) * (item.quantity || 1))}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <p className="text-muted-foreground">No items found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t px-5 pb-5">
                  <div className="max-w-xs ml-auto space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={order.shippingFee > 0 ? "" : "text-green-600 font-medium"}>
                        {order.shippingFee > 0 
                          ? formatCurrency(order.shippingFee)
                          : "Free"
                        }
                      </span>
                    </div>
                    {order.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(order.tax || 0)}</span>
                      </div>
                    )}
                    <Separator className="my-3" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-card border rounded-lg">
              <div className="p-5 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
              </div>
              
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {order.customerName || order.addressInfo?.fullName || "Customer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerEmail || "No email provided"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone</span>
                    </div>
                    <p className="text-sm">
                      {order.addressInfo?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Shipping Address</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{order.addressInfo?.address || "Not provided"}</p>
                      <p className="text-muted-foreground">
                        {order.addressInfo?.city || ""}
                        {order.addressInfo?.region ? `, ${order.addressInfo.region}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {order.addressInfo?.deliveryNotes && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">
                          Delivery Preference
                        </p>
                        <p className="text-sm text-blue-600">
                          "{order.addressInfo.deliveryNotes}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Order Actions */}
            <div className="bg-card border rounded-lg">
              <div className="p-5 border-b">
                <h3 className="text-lg font-semibold">Order Actions</h3>
              </div>
              
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9"
                    onClick={() => handleSendNotification("email")}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9"
                    onClick={() => handleSendNotification("sms")}
                  >
                    <MessageCircle className="h-4 w-4" />
                    SMS
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 h-9"
                  onClick={handlePrintInvoice}
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </Button>
                
                {/* Status Update Buttons */}
                {statusConfig.nextActions.map((status) => {
                  const btnConfig = getStatusButtonConfig(status);
                  const BtnIcon = btnConfig.icon;
                  const isDisabled = isUpdating || currentStatus === status;
                  
                  return (
                    <Button
                      key={status}
                      variant={btnConfig.variant}
                      size="sm"
                      className={`w-full gap-2 h-9 ${btnConfig.color}`}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={isDisabled}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BtnIcon className="h-4 w-4" />
                      )}
                      {isUpdating ? "Updating..." : btnConfig.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-card border rounded-lg">
              <div className="p-5 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Carrier</span>
                    <span className="font-medium text-sm">
                      {order.shippingMethod || "Standard Shipping"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className="text-xs">
                      {currentStatus === "shipped" ? "In Transit" : "Preparing"}
                    </Badge>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-4">Order Timeline</h4>
                  <div className="space-y-4">
                    {[
                      { 
                        status: "ordered", 
                        label: "Order Placed", 
                        date: order.orderDate,
                        active: true,
                        icon: CheckCircle
                      },
                      { 
                        status: "processing", 
                        label: "Processing", 
                        date: ["processing", "confirmed", "shipped", "delivered"].includes(currentStatus) ? order.orderUpdateDate : null,
                        active: ["processing", "confirmed", "shipped", "delivered"].includes(currentStatus),
                        icon: PackageOpen
                      },
                      { 
                        status: "shipped", 
                        label: "Shipped", 
                        date: ["shipped", "delivered"].includes(currentStatus) ? order.orderUpdateDate : null,
                        active: ["shipped", "delivered"].includes(currentStatus),
                        icon: Truck
                      },
                      { 
                        status: "delivered", 
                        label: "Delivered", 
                        date: currentStatus === "delivered" ? order.orderUpdateDate : null,
                        active: currentStatus === "delivered",
                        icon: CheckCircle
                      },
                    ].map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.status} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                              step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              <StepIcon className="h-3.5 w-3.5" />
                            </div>
                            {index < 3 && (
                              <div className={`flex-1 h-8 w-0.5 mt-1 ${
                                step.active ? "bg-primary" : "bg-muted"
                              }`}></div>
                            )}
                          </div>
                          <div className="pb-1">
                            <p className={`text-sm font-medium ${
                              step.active ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {step.date ? formatDate(step.date) : "Pending"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-card border rounded-lg">
              <div className="p-5 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Method</span>
                    <span className="font-medium text-sm capitalize">
                      {order.paymentMethod || "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant={order.paymentStatus === "completed" ? "success" : "secondary"}
                      className="text-xs"
                    >
                      {order.paymentStatus || "pending"}
                    </Badge>
                  </div>
                  
                  {order.paymentId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payment ID</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate max-w-[120px]">
                          {order.paymentId.slice(0, 8)}...
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleCopy(order.paymentId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Actions */}
      {isMobile && (
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1.5"
                onClick={handlePrintInvoice}
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
              <Button 
                size="sm" 
                variant="default" 
                className="gap-1.5"
                onClick={() => handleStatusUpdate("processing")}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                {isUpdating ? "Updating" : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

export default AdminOrderDetailsView;