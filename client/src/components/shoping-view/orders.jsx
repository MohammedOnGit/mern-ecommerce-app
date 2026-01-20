//Chatgpt
import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useSelector, useDispatch } from "react-redux";
import { getAllOrdersByUserId } from "@/store/shop/order-slice";
import { toast } from "sonner";

/* ---------- Status Config & Badge ---------- */
const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  confirmed: { label: "Confirmed", color: "bg-purple-100 text-purple-800", icon: ShieldCheck },
  shipping: { label: "On the Way", color: "bg-purple-100 text-purple-800", icon: Truck },
  shipped: { label: "On the Way", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: XCircle },
};

function StatusBadge({ status }) {
  const normalizedStatus = status === "shipped" ? "shipping" : status;
  const config = statusConfig[normalizedStatus] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <Badge className={cn("gap-1.5", config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/* ---------- Main Component ---------- */
function ShoppingOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, isloading: isLoading, error } = useSelector((state) => state.shopOrder);

  /* ---------- Helpers ---------- */
  const getUserId = useCallback(() => user?.id || user?._id || user?.userId, [user]);

  const fetchOrders = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error("Unable to identify user");
      return;
    }

    setIsRefreshing(true);
    try {
      const result = await dispatch(getAllOrdersByUserId(userId));
      if (result.meta.requestStatus === "fulfilled") {
        const count = result.payload?.count ?? 0;
        toast[count > 0 ? "success" : "info"](
          count > 0 ? `Loaded ${count} orders` : "No orders found"
        );
      } else {
        throw result.error || new Error("Failed to load orders");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load orders");
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, getUserId]);

  useEffect(() => { if (getUserId()) fetchOrders(); }, [fetchOrders, getUserId]);

  const formattedOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber || `ORD-${order._id?.slice(-6)?.toUpperCase() || 'XXXXXX'}`,
      date: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not available',
      status: order.orderStatus || order.paymentStatus || 'pending',
      total: order.totalAmount || 0,
      items: order.cartItems?.length || 0,
      payment: order.paymentMethod === 'paystack' ? 'Mobile Money/Card' : order.paymentMethod || 'Not specified',
      rawData: order,
    }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return formattedOrders.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.payment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = statusFilter === "all" || order.status === statusFilter;
      if ((statusFilter === "shipping" && order.status === "shipped") || (statusFilter === "shipped" && order.status === "shipping")) {
        matchesStatus = true;
      }
      return matchesSearch && matchesStatus;
    });
  }, [formattedOrders, searchQuery, statusFilter]);

  const openOrderDetails = (order) => {
    setSelectedOrder(order.rawData);
    setIsDetailsOpen(true);
  };

  const handleRefresh = () => { if (getUserId()) fetchOrders(); };

  /* ---------- Render States ---------- */
  if (isLoading && !isRefreshing) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground mt-2">Loading your orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && formattedOrders.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="font-medium text-lg">Failed to load orders</p>
          <p className="text-sm text-muted-foreground">{error || "Try again later."}</p>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (formattedOrders.length === 0 && !isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="font-medium text-lg">No orders yet</p>
          <p className="text-sm text-muted-foreground">You haven't placed any orders yet. Start shopping to see your order history here.</p>
          <Button onClick={() => window.location.href = '/shop'}>Browse Products</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Order History</CardTitle>
            <CardDescription>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
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
                {["all","pending","processing","confirmed","shipping","delivered","cancelled"].map(status => (
                  <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase()+status.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</TableCaption>
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
                      <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                      <TableCell className="flex items-center gap-2 text-sm"><Calendar className="h-3 w-3 text-muted-foreground" />{order.date}</TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                      <TableCell className="text-sm">{order.items} item{order.items !== 1 ? 's' : ''}</TableCell>
                      <TableCell className="flex items-center gap-2 text-sm"><CreditCard className="h-3 w-3 text-muted-foreground" />{order.payment}</TableCell>
                      <TableCell className="text-right font-bold">GHC {order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="ghost" className="gap-2 hover:bg-primary/10" onClick={() => setSelectedOrder(order.rawData) || setIsDetailsOpen(true)}>
                          <Eye className="h-4 w-4" /> View <ChevronRight className="h-3 w-3" />
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1"><Calendar className="h-3 w-3" />{order.date}</div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-muted-foreground">Items</div><div className="font-medium">{order.items} item{order.items !== 1 ? 's' : ''}</div></div>
                    <div><div className="text-muted-foreground">Payment</div><div className="font-medium">{order.payment}</div></div>
                    <div><div className="text-muted-foreground">Total</div><div className="font-bold text-lg">GHC {order.total.toFixed(2)}</div></div>
                  </div>
                  <Button className="w-full mt-4 gap-2" onClick={() => setSelectedOrder(order.rawData) || setIsDetailsOpen(true)} variant="outline">
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

