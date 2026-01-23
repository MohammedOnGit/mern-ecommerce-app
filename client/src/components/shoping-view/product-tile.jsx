import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Eye,
  Heart,
  Package,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { inventoryStatus } from "@/config";
import { cn } from "@/lib/utils";

/* ============================
   STOCK HELPERS (PURE)
============================ */
const getStockInfo = (product) => {
  if (!product) {
    return {
      realStock: 0,
      isInStock: false,
      isLowStock: false,
      isBackorder: false,
      canAdd: false,
      stockStatus: inventoryStatus["out-of-stock"],
    };
  }

  const availableStock = Number(product.availableStock) || 0;
  const reservedStock = Number(product.reservedStock) || 0;
  const lowStockThreshold = Number(product.lowStockThreshold) || 5;
  const isActive = product.isActive !== false;
  const allowBackorders = Boolean(product.allowBackorders);

  const realStock = Math.max(availableStock - reservedStock, 0);
  const isInStock = realStock > 0;
  const isLowStock = isInStock && realStock <= lowStockThreshold;
  const isBackorder = !isInStock && allowBackorders;
  const canAdd = isActive && (isInStock || allowBackorders);

  let stockStatus = inventoryStatus["in-stock"];

  if (!canAdd) {
    stockStatus = inventoryStatus["out-of-stock"];
  } else if (isLowStock) {
    stockStatus = inventoryStatus["low-stock"];
  }

  return {
    realStock,
    isInStock,
    isLowStock,
    isBackorder,
    canAdd,
    stockStatus,
  };
};

/* ============================
   COMPONENT
============================ */
const ShoppingProductTile = ({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  cartItems = [],
}) => {
  if (!product) return null;

  const {
    _id,
    title = "",
    image = "",
    description = "",
    category = "",
    brand = "",
    price = 0,
    salePrice,
  } = product;

  const stockInfo = getStockInfo(product);

  const cartItem = cartItems.find(
    (item) => item.productId === _id || item._id === _id
  );

  const isInCart = Boolean(cartItem);
  const cartQuantity = Number(cartItem?.quantity) || 0;
  const isReservedInCart = Boolean(cartItem?.stockReserved);

  const showReservationStatus = isInCart && isReservedInCart;
  const showLowStockWarning = stockInfo.isLowStock && !isInCart;

  /* ============================
     HANDLERS
  ============================ */
  const handleAddToCartClick = (e) => {
    e.stopPropagation();

    if (!stockInfo.canAdd) {
      toast.error("Product unavailable");
      return;
    }

    if (isInCart) {
      toast.info(`Already ${cartQuantity} in your cart`);
      return;
    }

    if (stockInfo.isBackorder) {
      toast.info("This item is on backorder and will ship when available");
    }

    if (stockInfo.isLowStock) {
      toast.warning(`Only ${stockInfo.realStock} item(s) left`);
    }

    handleAddtoCart({ ...product, quantity: 1 });
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    handleGetProductDetails(_id);
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition">
      {/* Stock Badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge
          className={cn(
            "text-xs font-semibold px-2 py-1",
            stockInfo.stockStatus?.badgeColor
          )}
          variant="secondary"
        >
          {stockInfo.stockStatus?.icon} {stockInfo.stockStatus?.label}
        </Badge>
      </div>

      {/* Reserved / Backorder Badge (exclusive) */}
      {showReservationStatus ? (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Reserved
          </Badge>
        </div>
      ) : stockInfo.isBackorder ? (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
            <Package className="h-3 w-3 mr-1" />
            Backorder
          </Badge>
        </div>
      ) : null}

      {/* Image */}
      <CardHeader className="p-0">
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        </div>

        {/* Quick Actions */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 opacity-0 group-hover:opacity-100 transition">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              onClick={handleViewDetailsClick}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <Badge variant="outline">{category}</Badge>
          <span>{brand}</span>
        </div>

        <h3
          className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary"
          onClick={handleViewDetailsClick}
        >
          {title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Stock Info */}
        <div className="space-y-1">
          {showReservationStatus ? (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 text-xs"
            >
              <ShieldCheck className="h-3 w-3 mr-1" />
              {cartQuantity} reserved in your cart
            </Badge>
          ) : (
            <p className={cn("text-xs", stockInfo.stockStatus?.color)}>
              {stockInfo.isBackorder
                ? "Available for backorder"
                : `${stockInfo.realStock} available`}
            </p>
          )}

          {showLowStockWarning && (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs font-medium">Low stock</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex gap-2 items-baseline">
          <span className="text-lg font-bold">
            ₵{salePrice ?? price}
          </span>
          {salePrice && (
            <span className="text-sm line-through text-muted-foreground">
              ₵{price}
            </span>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 space-y-2">
        <Button
          onClick={handleAddToCartClick}
          disabled={!stockInfo.canAdd || isInCart}
          className={cn(
            "w-full gap-2",
            (!stockInfo.canAdd || isInCart) &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          {isInCart
            ? `In Cart (${cartQuantity})`
            : stockInfo.isBackorder
            ? "Backorder Now"
            : "Add to Cart"}
        </Button>

        <Button variant="outline" size="sm" onClick={handleViewDetailsClick}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShoppingProductTile;
