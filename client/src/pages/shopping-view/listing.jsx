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
import { ArrowUpDown, Filter, Grid2X2, Grid3X3, X, PackageOpen, Package, Check, AlertCircle } from "lucide-react";
import { sortOptions } from "@/config";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------------- HELPERS ---------------- */
const createSearchParamsHelper = (filters) =>
  Object.entries(filters)
    .map(([k, v]) => (Array.isArray(v) && v.length > 0 ? `${k}=${v.join(",")}` : null))
    .filter(Boolean)
    .join("&");

const parseSearchParamsToFilters = (searchParams) => {
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    filters[key] = value.split(",");
  }
  return filters;
};

// Helper to filter products by inventory status
const filterProductsByInventory = (products, inventoryFilter) => {
  if (!inventoryFilter || inventoryFilter === 'all') return products;
  
  return products.filter(product => {
    const totalStock = product.totalStock || 0;
    const availableStock = product.availableStock || totalStock;
    const isActive = product.isActive !== false;
    
    switch (inventoryFilter) {
      case 'in-stock':
        return isActive && availableStock > 0;
      case 'low-stock':
        const lowStockThreshold = product.lowStockThreshold || 5;
        return isActive && availableStock > 0 && availableStock <= lowStockThreshold;
      case 'out-of-stock':
        return availableStock <= 0;
      case 'active':
        return isActive === true;
      case 'inactive':
        return isActive === false;
      default:
        return true;
    }
  });
};

// Helper to sort products
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
      return sorted.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
    case "stock-hightolow":
      return sorted.sort((a, b) => {
        const aStock = a.availableStock || a.totalStock || 0;
        const bStock = b.availableStock || b.totalStock || 0;
        return bStock - aStock;
      });
    case "stock-lowtohigh":
      return sorted.sort((a, b) => {
        const aStock = a.availableStock || a.totalStock || 0;
        const bStock = b.availableStock || b.totalStock || 0;
        return aStock - bStock;
      });
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
  const { products = [], productDetails = null, isLoading } = useSelector(
    (state) => state.shopProducts
  );

  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [gridView, setGridView] = useState("grid");
  const [inventoryFilter, setInventoryFilter] = useState('all');

  /* ---------- Fetch Wishlist ---------- */
  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  /* ---------- Load Filters from URL or Session ---------- */
  useEffect(() => {
    const urlFilters = parseSearchParamsToFilters(searchParams);
    const hasUrlFilters = Object.keys(urlFilters).length > 0;

    if (hasUrlFilters) {
      setFilters(urlFilters);
    } else {
      const savedFilters = sessionStorage.getItem("shop-filters");
      setFilters(savedFilters ? JSON.parse(savedFilters) : {});
    }

    setSort(sessionStorage.getItem("shop-sort") || "price-lowtohigh");
    setInventoryFilter(sessionStorage.getItem("shop-inventory-filter") || "all");
  }, [searchParams]);

  /* ---------- Sync Filters to URL ---------- */
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setSearchParams(new URLSearchParams(createSearchParamsHelper(filters)));
    } else {
      setSearchParams(new URLSearchParams());
    }
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
      
      const availableStock = product.availableStock || product.totalStock || 0;
      const requestedQuantity = product.quantity || 1;
      
      // ✅ INVENTORY VALIDATION: Check stock before adding to cart
      if (availableStock < requestedQuantity) {
        toast.error(`Only ${availableStock} item(s) available in stock`);
        return;
      }
      
      // Check if product is active
      if (product.isActive === false) {
        toast.error("This product is currently unavailable");
        return;
      }

      dispatch(addToCart({ userId: user.id, productId: product._id, quantity: requestedQuantity }))
        .then((res) => {
          if (res?.meta?.requestStatus === "fulfilled") {
            dispatch(fetchCartItems(user.id));
            toast.success(`${product.title} added to cart`);
          } else {
            toast.error(res?.error?.message || "Failed to add to cart");
          }
        })
        .catch((error) => {
          toast.error(error.message || "Failed to add to cart");
        });
    },
    [dispatch, user, navigate]
  );

  /* ---------- Filter Handlers ---------- */
  const handleFilter = useCallback((section, optionId) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (!newFilters[section]) newFilters[section] = [optionId];
      else if (newFilters[section].includes(optionId))
        newFilters[section] = newFilters[section].filter((id) => id !== optionId);
      else newFilters[section].push(optionId);

      if (newFilters[section]?.length === 0) delete newFilters[section];

      sessionStorage.setItem("shop-filters", JSON.stringify(newFilters));
      return newFilters;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setInventoryFilter('all');
    sessionStorage.removeItem("shop-filters");
    sessionStorage.removeItem("shop-inventory-filter");
    setSearchParams(new URLSearchParams());
    toast.success("Filters cleared");
  }, [setSearchParams]);

  const handleInventoryFilter = useCallback((filter) => {
    setInventoryFilter(filter);
    sessionStorage.setItem("shop-inventory-filter", filter);
  }, []);

  /* ---------- Statistics ---------- */
  const inventoryStats = useMemo(() => {
    const stats = {
      total: products.length,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      active: 0,
      inactive: 0
    };

    products.forEach(product => {
      const totalStock = product.totalStock || 0;
      const availableStock = product.availableStock || totalStock;
      const lowStockThreshold = product.lowStockThreshold || 5;
      const isActive = product.isActive !== false;
      
      if (isActive) stats.active++;
      else stats.inactive++;
      
      if (availableStock > 0) {
        stats.inStock++;
        if (availableStock <= lowStockThreshold) {
          stats.lowStock++;
        }
      } else {
        stats.outOfStock++;
      }
    });

    return stats;
  }, [products]);

  /* ---------- Filtered and Sorted Products ---------- */
  const filteredProducts = useMemo(() => {
    return filterProductsByInventory(products, inventoryFilter);
  }, [products, inventoryFilter]);

  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sort);
  }, [filteredProducts, sort]);

  /* ---------- Active Filters ---------- */
  const activeFilterCount = useMemo(
    () =>
      Object.values(filters).reduce(
        (total, cur) => total + (Array.isArray(cur) ? cur.length : 0),
        0
      ),
    [filters]
  );

  const hasFilters = activeFilterCount > 0 || inventoryFilter !== 'all';
  const categoryFromLocation = useMemo(
    () => new URLSearchParams(location.search).get("category"),
    [location.search]
  );

  /* ---------- Sort Handler ---------- */
  const handleSortChange = useCallback((value) => {
    setSort(value);
    sessionStorage.setItem("shop-sort", value);
  }, []);

  /* ---------- Open Details Dialog ---------- */
  useEffect(() => {
    if (productDetails) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  /* ---------- Mobile Filter Toggle ---------- */
  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters(prev => !prev);
  }, []);

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {categoryFromLocation
              ? `${categoryFromLocation.charAt(0).toUpperCase()}${categoryFromLocation.slice(1)} Collection`
              : "All Products"}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-muted-foreground">
              Showing {sortedProducts.length} of {products.length} product{products.length !== 1 && "s"}
              {hasFilters && (
                <span className="ml-2">
                  • <Badge variant="secondary" className="ml-1">{activeFilterCount + (inventoryFilter !== 'all' ? 1 : 0)} filter{(activeFilterCount + (inventoryFilter !== 'all' ? 1 : 0)) !== 1 && 's'}</Badge>
                </span>
              )}
            </p>
            
            {/* Inventory Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-green-700">{inventoryStats.inStock} in stock</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span className="text-amber-700">{inventoryStats.lowStock} low stock</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-gray-600" />
                <span className="text-gray-700">{inventoryStats.outOfStock} out of stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={toggleMobileFilters}
            className="w-full justify-between"
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters {hasFilters && <Badge className="ml-2">{activeFilterCount + (inventoryFilter !== 'all' ? 1 : 0)}</Badge>}
            </div>
            {showMobileFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden mb-6 p-4 border rounded-lg bg-background">
            <ProductFilter
              filters={filters}
              handleFilter={handleFilter}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Inventory Filter Tabs */}
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Inventory Status</h3>
                <Tabs value={inventoryFilter} onValueChange={handleInventoryFilter} className="w-full">
                  <TabsList className="grid grid-cols-2 gap-1 h-auto">
                    <TabsTrigger value="all" className="text-xs py-2">
                      All Products
                    </TabsTrigger>
                    <TabsTrigger value="in-stock" className="text-xs py-2">
                      In Stock
                    </TabsTrigger>
                    <TabsTrigger value="low-stock" className="text-xs py-2">
                      Low Stock
                    </TabsTrigger>
                    <TabsTrigger value="out-of-stock" className="text-xs py-2">
                      Out of Stock
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-medium">{inventoryStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Stock:</span>
                    <span className="font-medium text-green-600">{inventoryStats.inStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Low Stock:</span>
                    <span className="font-medium text-amber-600">{inventoryStats.lowStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Out of Stock:</span>
                    <span className="font-medium text-red-600">{inventoryStats.outOfStock}</span>
                  </div>
                </div>
              </div>

              {/* Product Filters */}
              <ProductFilter
                filters={filters}
                handleFilter={handleFilter}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant={gridView === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGridView("grid")}
                >
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={gridView === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGridView("list")}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All Filters
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort: {sortOptions.find(opt => opt.id === sort)?.label || "Recommended"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
                      {sortOptions.map((option) => (
                        <DropdownMenuRadioItem key={option.id} value={option.id}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Active Filters Display */}
            {(hasFilters || inventoryFilter !== 'all') && (
              <div className="mb-6 p-4 bg-muted/20 rounded-lg border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Active filters:</span>
                  
                  {/* Inventory Filter */}
                  {inventoryFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-2 px-3 py-1.5">
                      Status: {inventoryFilter.replace('-', ' ')}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleInventoryFilter('all')} />
                    </Badge>
                  )}
                  
                  {/* Category/Brand Filters */}
                  {Object.entries(filters).map(([key, values]) =>
                    Array.isArray(values) && values.map(value => (
                      <Badge key={`${key}-${value}`} variant="secondary" className="gap-2 px-3 py-1.5">
                        {key}: {value}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilter(key, value)} />
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-xl" />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              gridView === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedProducts.map((p) => (
                    <ShoppingProductTile
                      key={p._id}
                      product={p}
                      handleGetProductDetails={handleGetProductDetails}
                      handleAddtoCart={handleAddtoCart}
                      isOutOfStock={(p.availableStock || p.totalStock || 0) <= 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((p) => (
                    <div key={p._id} className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-card">
                      <div className="flex gap-4">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            className="w-full h-full object-cover rounded-lg" 
                            loading="lazy" 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{p.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {p.brand} • {p.category}
                              </p>
                            </div>
                            <span className="text-xl font-bold">₵{p.salePrice || p.price}</span>
                          </div>
                          
                          {/* Stock Info */}
                          <div className="my-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  (p.availableStock || p.totalStock || 0) <= 0 ? "destructive" :
                                  (p.availableStock || p.totalStock || 0) <= (p.lowStockThreshold || 5) ? "secondary" : "default"
                                }
                                className="text-xs"
                              >
                                {(p.availableStock || p.totalStock || 0) <= 0 ? "Out of Stock" :
                                 (p.availableStock || p.totalStock || 0) <= (p.lowStockThreshold || 5) ? "Low Stock" : "In Stock"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Available: {p.availableStock || p.totalStock || 0}
                                {p.totalStock > 0 && ` of ${p.totalStock}`}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 my-2">{p.description}</p>
                          <div className="flex items-center gap-4">
                            <Button 
                              onClick={() => handleAddtoCart(p)} 
                              className="gap-2"
                              disabled={(p.availableStock || p.totalStock || 0) <= 0 || p.isActive === false}
                            >
                              {(p.availableStock || p.totalStock || 0) <= 0 ? "Out of Stock" :
                               p.isActive === false ? "Unavailable" : "Add to Cart"}
                            </Button>
                            <Button variant="outline" onClick={() => handleGetProductDetails(p._id)}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PackageOpen className="h-12 w-12" />
                  </EmptyMedia>
                  <EmptyTitle>No products found</EmptyTitle>
                  <EmptyDescription>
                    {hasFilters 
                      ? "Try adjusting your filters or check back later."
                      : "No products available at the moment. Please check back later."}
                  </EmptyDescription>
                </EmptyHeader>
                <div className="mt-4 space-x-3">
                  {hasFilters && <Button onClick={handleClearFilters}>Clear All Filters</Button>}
                  <Button variant="outline" onClick={() => navigate("/shop/home")}>Continue Shopping</Button>
                </div>
              </Empty>
            )}
          </div>
        </div>

        {/* Product Details Dialog */}
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