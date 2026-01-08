import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  MoreVertical,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  ShoppingCart,
  User,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AdminOrderDetailsView from "@/components/admin-view/order-details-view";

// Redux
import {
  getAllOrdersForAdmin,
  selectAdminOrders,
  selectAdminOrderError,
  selectAdminOrderLoading,
  selectAdminOrderPagination,
  clearAdminOrderError,
} from "@/store/admin/order-slice";

// Status configuration
const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary",
    icon: Package,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  processing: {
    label: "Processing",
    variant: "default",
    icon: Package,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    variant: "outline",
    icon: Truck,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    variant: "success",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
  },
  confirmed: {
    label: "Confirmed",
    variant: "default",
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
};

function AdminOrders() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAdminOrders);
  const isLoading = useSelector(selectAdminOrderLoading);
  const error = useSelector(selectAdminOrderError);
  const pagination = useSelector(selectAdminOrderPagination);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch orders
  const fetchOrders = useCallback(() => {
    const params = {
      page: currentPage,
      limit: 20,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(debouncedSearch && { search: debouncedSearch }),
    };
    dispatch(getAllOrdersForAdmin(params));
  }, [dispatch, currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    return () => dispatch(clearAdminOrderError());
  }, [dispatch]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  const handleRefresh = () => fetchOrders();
  const handlePageChange = (page) => setCurrentPage(page);
  const handleExport = () => console.log("Exporting orders...");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
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

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={`gap-1.5 px-3 py-1.5 border ${config.color}`}
      >
        <StatusIcon className="h-3.5 w-3.5" />
        <span className="font-medium">{config.label}</span>
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
      case "credit card":
        return <CreditCard className="h-3.5 w-3.5" />;
      case "mobile money":
        return <ShoppingCart className="h-3.5 w-3.5" />;
      default:
        return <CreditCard className="h-3.5 w-3.5" />;
    }
  };

  const totalPages = Math.ceil(pagination.totalOrders / pagination.limit) || 1;

  return (
    <div className="space-y-6">
      {/* Main Orders Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">All Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading orders...
                  </span>
                ) : (
                  `Showing ${orders.length} of ${pagination.totalOrders} orders`
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Error: {error.message || error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[120px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Items
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Payment
                    </TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center w-[70px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-24"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-32"></div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="h-4 bg-muted rounded w-20"></div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="h-4 bg-muted rounded w-16"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-muted rounded w-24"></div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="h-4 bg-muted rounded w-20"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-muted rounded w-8 mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                          <p className="font-medium text-lg">No orders found</p>
                          <p className="text-sm text-muted-foreground">
                            {debouncedSearch || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "No orders yet"}
                          </p>
                          {(debouncedSearch || statusFilter !== "all") && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow
                        key={order._id}
                        className="hover:bg-muted/30 group"
                      >
                        <TableCell className="font-medium">
                          <div className="font-mono text-sm">
                            {order.orderNumber ||
                              `ORD-${order._id?.slice(-8).toUpperCase()}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {order.customerName ||
                                  order.addressInfo?.fullName ||
                                  "Customer"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {order.customerEmail || "No email"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {formatDate(order.orderDate)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                            {order.cartItems?.length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.orderStatus)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <div>
                              <p className="text-sm capitalize">
                                {order.paymentMethod || "N/A"}
                              </p>
                              <Badge
                                variant={
                                  order.paymentStatus === "completed"
                                    ? "success"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {order.paymentStatus || "pending"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>
                                Order {order.orderNumber}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(order)}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {!isLoading && orders.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                      if (pageNum > totalPages - 4)
                        pageNum = totalPages - 4 + i;
                    }
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * 20 + 1} to{" "}
                {Math.min(currentPage * 20, pagination.totalOrders)} of{" "}
                {pagination.totalOrders}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Orders</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-1 text-start">12</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1 text-start">
              8
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1 text-start">
              15
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1 break-all text-start">
              {formatCurrency(24500)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[95dvh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View and manage order</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <AdminOrderDetailsView
              order={selectedOrder}
              onClose={() => setOpenDetailsDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminOrders;
