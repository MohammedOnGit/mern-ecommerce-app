import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useSelector, useDispatch } from "react-redux";
import { getAllOrdersByUserId } from "@/store/shop/order-slice";
import { toast } from "sonner";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  confirmed: { label: "Confirmed", color: "bg-purple-100 text-purple-800", icon: Package },
  shipping: { label: "Shipping", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: XCircle },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <Badge className={cn("gap-1.5", config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function ShoppingOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, orderDetails, isloading, error } = useSelector((state) => state.shopOrder);

  // Debug: Log user object to see what properties are available
  useEffect(() => {
    console.log("🛒 DEBUG User object:", user);
    console.log("🛒 DEBUG User ID property:", user?.id);
    console.log("🛒 DEBUG User _ID property:", user?._id);
    console.log("🛒 DEBUG User userId property:", user?.userId);
  }, [user]);

  const formattedOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }
    
    return orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber || `ORD-${order._id?.slice(-6)?.toUpperCase() || 'XXXXXX'}`,
      date: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not available',
      status: order.orderStatus || order.paymentStatus || 'pending',
      total: order.totalAmount || 0,
      items: order.cartItems?.length || 0,
      payment: order.paymentMethod === 'paystack' ? 'Mobile Money/Card' : order.paymentMethod || 'Not specified',
      deliveryDate: 'Pending',
      rawData: order
    }));
  }, [orders]);

  // Add filteredOrders calculation
  const filteredOrders = useMemo(() => {
    if (!formattedOrders.length) return [];
    
    return formattedOrders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.payment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [formattedOrders, searchQuery, statusFilter]);

  useEffect(() => {
    // Try to get the correct user ID - check both possible properties
    const userId = getUserId();
    if (userId) {
      fetchOrders(userId);
    }
  }, [user]);

  // Helper function to get the correct user ID
  const getUserId = () => {
    // Check all possible user ID properties
    return user?.id || user?._id || user?.userId;
  };

  const fetchOrders = async (userId) => {
    if (!userId) {
      console.error("🛒 No user ID found for fetching orders");
      toast.error("Unable to identify user");
      return;
    }

    setIsRefreshing(true);
    try {
      console.log("🛒 Fetching orders for user ID:", userId);
      console.log("🛒 User ID type:", typeof userId);
      
      const result = await dispatch(getAllOrdersByUserId(userId));
      
      if (result.meta.requestStatus === 'fulfilled') {
        if (result.payload?.count > 0) {
          toast.success(`Loaded ${result.payload.count} orders`);
        } else {
          toast.info("No orders found");
        }
      } else if (result.meta.requestStatus === 'rejected') {
        console.error("🛒 Failed to fetch orders:", result.error);
        toast.error(result.error?.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("🛒 Failed to fetch orders:", err);
      toast.error(err.message || "Failed to load orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order.rawData);
    setIsDetailsOpen(true);
  };

  const handleRefresh = () => {
    const userId = getUserId();
    if (userId) {
      fetchOrders(userId);
    }
  };

  // Debug button to test different user IDs
  const testUserIds = () => {
    console.log("🔍 Testing all possible user ID properties:");
    console.log("user.id:", user?.id);
    console.log("user._id:", user?._id);
    console.log("user.userId:", user?.userId);
    
    // Try fetching with each possible ID
    const idsToTest = [user?.id, user?._id, user?.userId].filter(Boolean);
    console.log("IDs to test:", idsToTest);
    
    // Try the first available ID
    if (idsToTest.length > 0) {
      fetchOrders(idsToTest[0]);
    }
  };

  if (isloading && !isRefreshing) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && formattedOrders.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Order History</CardTitle>
          <CardDescription>Track and manage all your orders in one place</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-medium text-lg">Failed to load orders</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error || "An unexpected error occurred. Please try again."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Try Again
              </Button>
              <Button variant="outline" onClick={testUserIds}>
                Debug User ID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (formattedOrders.length === 0 && !isloading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Order History</CardTitle>
          <CardDescription>Track and manage all your orders in one place</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <Package className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium text-lg">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/shop'}>
                Browse Products
              </Button>
              <Button variant="outline" onClick={testUserIds}>
                Debug
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Order History</CardTitle>
              <CardDescription>
                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {isRefreshing && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Updating orders...</span>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, order number or payment method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="py-3">
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                </TableCaption>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Order Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" /> 
                        {order.date}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-sm">{order.items} item{order.items !== 1 ? 's' : ''}</TableCell>
                      <TableCell className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-3 w-3 text-muted-foreground" /> 
                        {order.payment}
                      </TableCell>
                      <TableCell className="text-right font-bold">GHC {order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="gap-2 hover:bg-primary/10" 
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" /> 
                          View 
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 mt-6">
            {filteredOrders.map(order => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono font-bold text-lg">{order.orderNumber}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" /> {order.date}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Items</div>
                      <div className="font-medium">{order.items} item{order.items !== 1 ? 's' : ''}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Payment</div>
                      <div className="font-medium">{order.payment}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-bold text-lg">GHC {order.total.toFixed(2)}</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 gap-2" 
                    onClick={() => openOrderDetails(order)}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4" /> View Order Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl p-0">
          {selectedOrder && <ShoppingOrderDetailsView order={selectedOrder} onClose={() => setIsDetailsOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShoppingOrders;
