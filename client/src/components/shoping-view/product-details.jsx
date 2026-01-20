import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setProductDetails } from "@/store/shop/products-slice";
import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

function ProductDetailsDialog({
  open,
  setOpen,
  productDetails,
  handleAddtoCart,
}) {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems = [], isLoading: wishlistLoading } =
    useSelector((state) => state.wishlist || {});

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("details");
  const [reviewText, setReviewText] = useState("");

  if (!productDetails) return null;

  /* ---------- Derived State ---------- */
  const isOnSale = productDetails.salePrice > 0;
  const availableStock =
    productDetails.availableStock ??
    productDetails.totalStock ??
    0;

  const isInWishlist = wishlistItems.some(
    (item) =>
      item.product?._id === productDetails._id ||
      item.product?.productId === productDetails._id ||
      item.productId === productDetails._id
  );

  /* ---------- Handlers ---------- */
  const handleDialogClose = useCallback(() => {
    setOpen(false);
    setQuantity(1);
    setSelectedTab("details");
    setReviewText("");
    dispatch(setProductDetails());
  }, [dispatch, setOpen]);

  const incrementQuantity = () =>
    setQuantity((prev) => Math.min(prev + 1, availableStock || prev + 1));

  const decrementQuantity = () =>
    setQuantity((prev) => Math.max(1, prev - 1));

  const handleWishlistToggle = useCallback(() => {
    if (!user?.id) {
      toast.info("Please login to save items");
      return;
    }

    const action = isInWishlist
      ? removeFromWishlist(productDetails._id)
      : addToWishlist(productDetails._id);

    dispatch(action)
      .unwrap()
      .then(() =>
        toast.success(
          isInWishlist ? "Removed from wishlist" : "Added to wishlist"
        )
      )
      .catch(() => toast.error("Action failed"));
  }, [dispatch, isInWishlist, productDetails._id, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  const handleAddToCartClick = () => {
    if (availableStock <= 0) {
      toast.error("Product out of stock");
      return;
    }

    handleAddtoCart({ ...productDetails, quantity });
    handleDialogClose();
  };

  /* ---------- Render ---------- */
  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleDialogClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDialogClose}
          className="absolute right-3 top-3 z-10"
        >
          <X />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="bg-muted flex items-center justify-center">
            <img
              src={productDetails.image || "https://via.placeholder.com/600"}
              alt={productDetails.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Info */}
          <div className="p-6 overflow-y-auto">
            {isOnSale && (
              <Badge className="mb-3 bg-red-600 text-white">On Sale</Badge>
            )}

            <DialogTitle className="text-2xl font-bold mb-2">
              {productDetails.title}
            </DialogTitle>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(productDetails.rating || 4)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  )}
                />
              ))}
              <span className="text-muted-foreground">
                {productDetails.rating || 4.7}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                ₵{isOnSale ? productDetails.salePrice : productDetails.price}
              </span>
              {isOnSale && (
                <span className="ml-3 line-through text-muted-foreground">
                  ₵{productDetails.price}
                </span>
              )}
            </div>

            <Separator className="my-6" />

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <Button size="icon" variant="outline" onClick={decrementQuantity}>
                <Minus />
              </Button>
              <span className="font-medium">{quantity}</span>
              <Button size="icon" variant="outline" onClick={incrementQuantity}>
                <Plus />
              </Button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                onClick={handleAddToCartClick}
                disabled={availableStock <= 0}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <Heart
                  className={cn(
                    "mr-2 h-5 w-5",
                    isInWishlist && "fill-red-500 text-red-500"
                  )}
                />
                Save
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full mb-8"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 text-sm">
                {productDetails.description || "No description available."}
              </TabsContent>

              <TabsContent value="specs" className="mt-4 text-sm space-y-1">
                <p>Category: {productDetails.category}</p>
                <p>Brand: {productDetails.brand}</p>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-4">
                <Textarea
                  placeholder="Write a review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (!reviewText.trim()) {
                      toast.error("Review cannot be empty");
                      return;
                    }
                    toast.success("Review submitted");
                    setReviewText("");
                  }}
                >
                  Submit
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
