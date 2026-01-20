//chatgpt

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

import ProductFilter from "../../components/shoping-view/filter";
import ShoppingProductTile from "../../components/shoping-view/product-tile";
import ProductDetailsDialog from "@/components/shoping-view/product-details";

import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchWishlist } from "@/store/shop/wishlist-slice";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Filter,
  Grid2X2,
  Grid3X3,
  X,
  PackageOpen,
  Package,
  Check,
  AlertCircle,
} from "lucide-react";
import { sortOptions } from "@/config";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------------- HELPERS ---------------- */
const createSearchParamsHelper = (filters) =>
  Object.entries(filters)
    .filter(([, v]) => Array.isArray(v) && v.length)
    .map(([k, v]) => `${k}=${v.join(",")}`)
    .join("&");

const parseSearchParamsToFilters = (searchParams) => {
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    if (value) filters[key] = value.split(",");
  }
  return filters;
};

const getAvailableStock = (product) =>
  product.availableStock ?? product.totalStock ?? 0;

const filterProductsByInventory = (products, inventoryFilter) => {
  if (inventoryFilter === "all") return products;

  return products.filter((product) => {
    const stock = getAvailableStock(product);
    const threshold = product.lowStockThreshold || 5;
    const isActive = product.isActive !== false;

    switch (inventoryFilter) {
      case "in-stock":
        return isActive && stock > 0;
      case "low-stock":
        return isActive && stock > 0 && stock <= threshold;
      case "out-of-stock":
        return stock <= 0;
      case "active":
        return isActive;
      case "inactive":
        return !isActive;
      default:
        return true;
    }
  });
};

const sortProducts = (products, sortType) => {
  const sorted = [...products];

  switch (sortType) {
    case "price-lowtohigh":
      return sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    case "price-hightolow":
      return sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    case "title-atoz":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-ztoa":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
      );
    case "stock-hightolow":
      return sorted.sort((a, b) => getAvailableStock(b) - getAvailableStock(a));
    case "stock-lowtohigh":
      return sorted.sort((a, b) => getAvailableStock(a) - getAvailableStock(b));
    default:
      return sorted;
  }
};

/* ---------------- SHOPPING LISTING ---------------- */
export default function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useSelector((state) => state.auth);
  const { products = [], productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );

  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [gridView, setGridView] = useState("grid");
  const [inventoryFilter, setInventoryFilter] = useState("all");

  /* ---------- Wishlist ---------- */
  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  /* ---------- Init Filters ---------- */
  useEffect(() => {
    const urlFilters = parseSearchParamsToFilters(searchParams);
    setFilters(
      Object.keys(urlFilters).length
        ? urlFilters
        : JSON.parse(sessionStorage.getItem("shop-filters") || "{}")
    );

    setSort(sessionStorage.getItem("shop-sort") || "price-lowtohigh");
    setInventoryFilter(sessionStorage.getItem("shop-inventory-filter") || "all");
  }, [searchParams]);

  /* ---------- Sync Filters to URL ---------- */
  useEffect(() => {
    const params = createSearchParamsHelper(filters);
    setSearchParams(params ? new URLSearchParams(params) : new URLSearchParams());
  }, [filters, setSearchParams]);

  /* ---------- Fetch Products ---------- */
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParam: sort }));
  }, [dispatch, filters, sort]);

  /* ---------- Product Details ---------- */
  const handleGetProductDetails = useCallback(
    (productId) => {
      dispatch(fetchProductDetails({ productId })).then((res) => {
        if (res?.meta?.requestStatus === "fulfilled") {
          setOpenDetailsDialog(true);
        } else {
          toast.error("Failed to load product details");
        }
      });
    },
    [dispatch]
  );

  /* ---------- Add to Cart ---------- */
  const handleAddtoCart = useCallback(
    (product) => {
      if (!user?.id) {
        toast.info("Please login to add items to cart");
        navigate("/login");
        return;
      }

      const stock = getAvailableStock(product);
      if (product.isActive === false || stock <= 0) {
        toast.error("This product is unavailable");
        return;
      }

      dispatch(
        addToCart({
          userId: user.id,
          productId: product._id,
          quantity: product.quantity || 1,
        })
      ).then((res) => {
        if (res?.meta?.requestStatus === "fulfilled") {
          dispatch(fetchCartItems(user.id));
          toast.success(`${product.title} added to cart`);
        } else {
          toast.error("Failed to add to cart");
        }
      });
    },
    [dispatch, navigate, user]
  );

  /* ---------- Derived Data ---------- */
  const filteredProducts = useMemo(
    () => filterProductsByInventory(products, inventoryFilter),
    [products, inventoryFilter]
  );

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort]
  );

  const categoryFromLocation = useMemo(
    () => new URLSearchParams(location.search).get("category"),
    [location.search]
  );

  const hasFilters =
    Object.keys(filters).length > 0 || inventoryFilter !== "all";

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {categoryFromLocation
              ? `${categoryFromLocation.charAt(0).toUpperCase()}${categoryFromLocation.slice(1)} Collection`
              : "All Products"}
          </h1>
        </div>

        {/* PRODUCTS */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : sortedProducts.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((p) => (
              <ShoppingProductTile
                key={p._id}
                product={p}
                handleGetProductDetails={handleGetProductDetails}
                handleAddtoCart={handleAddtoCart}
                isOutOfStock={getAvailableStock(p) <= 0}
              />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageOpen className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle>No products found</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try adjusting your filters."
                  : "No products available at the moment."}
              </EmptyDescription>
            </EmptyHeader>
            {hasFilters && (
              <Button onClick={() => setFilters({})}>Clear Filters</Button>
            )}
          </Empty>
        )}

        {/* PRODUCT DETAILS */}
        {productDetails && (
          <ProductDetailsDialog
            open={openDetailsDialog}
            setOpen={setOpenDetailsDialog}
            productDetails={productDetails}
            handleAddtoCart={handleAddtoCart}
          />
        )}
      </div>
    </div>
  );
}
