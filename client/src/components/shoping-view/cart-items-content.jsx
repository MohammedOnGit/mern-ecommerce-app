import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, Trash2, Heart, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import {
  deleteCartItem,
  updateCartQuantity,
} from "@/store/shop/cart-slice";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "@/store/shop/wishlist-slice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function UserCartItemsContent({ cartItem }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMovingToWishlist, setIsMovingToWishlist] = useState(false);

  useEffect(() => {
    if (user?.id) dispatch(fetchWishlist());
  }, [dispatch, user?.id]);

  const isOnSale = cartItem.salePrice > 0;
  const displayPrice = isOnSale ? cartItem.salePrice : cartItem.price;

  const exceedsStock =
    !cartItem.allowBackorders &&
    typeof cartItem.availableStock === "number" &&
    cartItem.quantity > cartItem.availableStock;

  const isInWishlist = useMemo(() => {
    const id = cartItem.productId;
    return wishlistItems?.some(
      (item) => item.product?._id === id || item.productId === id
    );
  }, [wishlistItems, cartItem.productId]);

  const updateQuantity = async (type) => {
    const newQty =
      type === "increment"
        ? cartItem.quantity + 1
        : cartItem.quantity - 1;

    if (newQty < 1) return;

    if (
      !cartItem.allowBackorders &&
      newQty > cartItem.availableStock
    ) {
      toast.error(`Only ${cartItem.availableStock} available`);
      return;
    }

    setIsUpdatingQuantity(true);
    try {
      await dispatch(
        updateCartQuantity({
          userId: user.id,
          productId: cartItem.productId,
          quantity: newQty,
        })
      ).unwrap();
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const removeItem = async () => {
    setIsDeleting(true);
    try {
      await dispatch(
        deleteCartItem({
          userId: user.id,
          productId: cartItem.productId,
        })
      ).unwrap();
      toast.success("Item removed");
    } finally {
      setIsDeleting(false);
    }
  };

  const moveToWishlist = async () => {
    if (!user?.id) return toast.info("Please login");

    setIsMovingToWishlist(true);
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(cartItem.productId)).unwrap();
      } else {
        await dispatch(addToWishlist(cartItem.productId)).unwrap();
        await removeItem();
      }
    } finally {
      setIsMovingToWishlist(false);
    }
  };

  return (
    <div className="flex gap-4 py-4">
      <img
        src={cartItem.image}
        alt={cartItem.title}
        className="h-20 w-20 rounded-md object-cover bg-muted"
      />

      <div className="flex-1">
        <h3 className="text-sm font-medium">{cartItem.title}</h3>

        <p className="text-sm font-semibold text-primary">
          GHC {displayPrice.toFixed(2)}
        </p>

        {exceedsStock && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            Only {cartItem.availableStock} available
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => updateQuantity("decrement")}
            disabled={isUpdatingQuantity || cartItem.quantity === 1}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="text-sm font-medium">{cartItem.quantity}</span>

          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => updateQuantity("increment")}
            disabled={isUpdatingQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("text-xs", isInWishlist && "text-red-500")}
            onClick={moveToWishlist}
            disabled={isMovingToWishlist}
          >
            <Heart
              className={cn("h-3 w-3 mr-1", isInWishlist && "fill-red-500")}
            />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <p className="font-semibold text-primary">
          GHC {(displayPrice * cartItem.quantity).toFixed(2)}
        </p>

        <Button
          size="icon"
          variant="ghost"
          onClick={removeItem}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;

