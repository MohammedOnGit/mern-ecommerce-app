// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useSearchParams } from "react-router-dom";

// import ProductFilter from "../../components/shoping-view/filter";
// import ShoppingProductTile from "../../components/shoping-view/product-tile";
// import ProductDetailsDialog from "@/components/shoping-view/product-details";

// import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
// import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import { Button } from "@/components/ui/button";
// import { ArrowUpDown } from "lucide-react";
// import { sortOptions } from "@/config";
// import { toast } from "sonner";

// /* ---------------- HELPERS ---------------- */
// function createSearchParamsHelper(filters) {
//   const queryParams = [];
//   for (const [key, value] of Object.entries(filters)) {
//     if (Array.isArray(value) && value.length > 0) {
//       queryParams.push(`${key}=${value.join(",")}`);
//     }
//   }
//   return queryParams.join("&");
// }

// function parseSearchParamsToFilters(searchParams) {
//   const filters = {};
//   for (const [key, value] of searchParams.entries()) {
//     filters[key] = value.split(",");
//   }
//   return filters;
// }

// /* ---------------- SHOPPING LISTING ---------------- */
// function ShoppingListing() {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { products = [], productDetails = null } = useSelector((state) => state.shopProducts);

//   const [filters, setFilters] = useState({});
//   const [sort, setSort] = useState("price-lowtohigh");
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

//   /* ---------------- PRODUCT DETAILS ---------------- */
//   const handleGetProductDetails = (productId) => {
//     dispatch(fetchProductDetails({ productId }));
//   };

//   /* ---------------- ADD TO CART ---------------- */
//   const handleAddtoCart = (product) => {
//     if (!user?.id || !product?._id) return;

//     dispatch(addToCart({ userId: user.id, productId: product._id, quantity: 1 }))
//       .then((res) => {
//         if (res?.meta?.requestStatus === "fulfilled") {
//           dispatch(fetchCartItems(user.id));
//           toast.success("", { description: `${product.title} added successfully` });
//         } else {
//           toast.error("Failed to add to cart");
//         }
//       });
//   };

//   /* ---------------- FILTER HANDLER ---------------- */
//   const handleFilter = (section, optionId) => {
//     const newFilters = { ...filters };
//     if (!newFilters[section]) newFilters[section] = [optionId];
//     else if (newFilters[section].includes(optionId)) newFilters[section] = newFilters[section].filter((id) => id !== optionId);
//     else newFilters[section].push(optionId);

//     if (newFilters[section]?.length === 0) delete newFilters[section];

//     setFilters(newFilters);
//     sessionStorage.setItem("shop-filters", JSON.stringify(newFilters));
//   };

//   /* ---------------- LOAD FILTERS FROM URL OR SESSION ---------------- */
//   useEffect(() => {
//     const urlFilters = parseSearchParamsToFilters(searchParams);

//     if (Object.keys(urlFilters).length > 0) {
//       setFilters(urlFilters);
//     } else {
//       // fallback to sessionStorage
//       setFilters(JSON.parse(sessionStorage.getItem("shop-filters")) || {});
//     }

//     setSort(sessionStorage.getItem("shop-sort") || "price-lowtohigh");
//   }, [searchParams]);

//   /* ---------------- SYNC FILTERS TO URL ---------------- */
//   useEffect(() => {
//     const queryString = createSearchParamsHelper(filters);
//     setSearchParams(new URLSearchParams(queryString));
//   }, [filters, setSearchParams]);

//   /* ---------------- FETCH PRODUCTS ---------------- */
//   useEffect(() => {
//     dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParam: sort }));
//   }, [dispatch, filters, sort]);

//   /* ---------------- OPEN PRODUCT DETAILS ---------------- */
//   useEffect(() => {
//     if (productDetails) setOpenDetailsDialog(true);
//   }, [productDetails]);

//   /* ---------------- RENDER ---------------- */
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 p-4">
//       <ProductFilter filters={filters} handleFilter={handleFilter} />

//       <div className="bg-background rounded-xl shadow-sm">
//         {/* TOP BAR */}
//         <div className="flex justify-between p-4 border-b">
//           <h2 className="text-xl font-semibold">All Products</h2>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
//               </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent>
//               <DropdownMenuRadioGroup
//                 value={sort}
//                 onValueChange={(value) => {
//                   setSort(value);
//                   sessionStorage.setItem("shop-sort", value);
//                 }}
//               >
//                 {sortOptions.map((sortItem) => (
//                   <DropdownMenuRadioItem key={sortItem.id} value={sortItem.id}>
//                     {sortItem.label}
//                   </DropdownMenuRadioItem>
//                 ))}
//               </DropdownMenuRadioGroup>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {/* PRODUCTS GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
//           {products.length > 0 ? (
//             products.map((product) => (
//               <ShoppingProductTile
//                 key={product._id}
//                 product={product}
//                 handleGetProductDetails={handleGetProductDetails}
//                 handleAddtoCart={handleAddtoCart}
//               />
//             ))
//           ) : (
//             <p className="col-span-full text-center text-muted-foreground">
//               No products found
//             </p>
//           )}
//         </div>
//       </div>

//       {/* PRODUCT DETAILS DIALOG */}
//       <ProductDetailsDialog
//         open={openDetailsDialog}
//         setOpen={setOpenDetailsDialog}
//         productDetails={productDetails}
//         handleAddtoCart={handleAddtoCart}
//       />
//     </div>
//   );
// }

// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

// import ProductFilter from "../../components/shoping-view/filter";
// import ShoppingProductTile from "../../components/shoping-view/product-tile";
// import ProductDetailsDialog from "@/components/shoping-view/product-details";

// import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
// import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
// import { fetchWishlist } from "@/store/shop/wishlist-slice";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import { Button } from "@/components/ui/button";
// import { ArrowUpDown, Filter, Grid2X2, Grid3X3, X } from "lucide-react";
// import { sortOptions } from "@/config";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
// import { PackageOpen } from "lucide-react";

// /* ---------------- HELPERS ---------------- */
// const createSearchParamsHelper = (filters) =>
//   Object.entries(filters)
//     .map(([k, v]) => (Array.isArray(v) && v.length > 0 ? `${k}=${v.join(",")}` : null))
//     .filter(Boolean)
//     .join("&");

// const parseSearchParamsToFilters = (searchParams) => {
//   const filters = {};
//   for (const [key, value] of searchParams.entries()) filters[key] = value.split(",");
//   return filters;
// };

// /* ---------------- SHOPPING LISTING ---------------- */
// export default function ShoppingListing() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const { user } = useSelector((state) => state.auth);
//   const { products = [], productDetails = null, isLoading } = useSelector((state) => state.shopProducts);
//   const { items: wishlistItems } = useSelector((state) => state.wishlist || { items: [] });

//   const [filters, setFilters] = useState({});
//   const [sort, setSort] = useState("price-lowtohigh");
//   const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const [gridView, setGridView] = useState("grid"); // 'grid' or 'list'

//   /* ---------- Fetch Wishlist ---------- */
//   useEffect(() => { if (user) dispatch(fetchWishlist()); }, [dispatch, user]);

//   /* ---------- Fetch Products ---------- */
//   useEffect(() => { dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParam: sort })); }, [dispatch, filters, sort]);

//   /* ---------- Load Filters from URL or Session ---------- */
//   useEffect(() => {
//     const urlFilters = parseSearchParamsToFilters(searchParams);
//     const hasUrlFilters = Object.keys(urlFilters).length > 0;
//     if (hasUrlFilters) setFilters(urlFilters);
//     else setFilters(JSON.parse(sessionStorage.getItem("shop-filters")) || {});
//     setSort(sessionStorage.getItem("shop-sort") || "price-lowtohigh");
//   }, [searchParams]);

//   /* ---------- Sync Filters to URL ---------- */
//   useEffect(() => {
//     setSearchParams(new URLSearchParams(createSearchParamsHelper(filters)));
//   }, [filters, setSearchParams]);

//   /* ---------- Product Details ---------- */
//   const handleGetProductDetails = useCallback((productId) => {
//     dispatch(fetchProductDetails({ productId })).then(res => {
//       if (res?.meta?.requestStatus === "fulfilled") setOpenDetailsDialog(true);
//     });
//   }, [dispatch]);

//   /* ---------- Add to Cart ---------- */
//   const handleAddtoCart = useCallback((product) => {
//     if (!user?.id || !product?._id) return toast.info("Please login to add items to cart");
//     dispatch(addToCart({ userId: user.id, productId: product._id, quantity: 1 }))
//       .then(res => {
//         if (res?.meta?.requestStatus === "fulfilled") {
//           dispatch(fetchCartItems(user.id));
//           toast.success(`${product.title} added to cart`);
//         } else toast.error("Failed to add to cart");
//       });
//   }, [dispatch, user]);

//   /* ---------- Filter Handlers ---------- */
//   const handleFilter = useCallback((section, optionId) => {
//     setFilters(prev => {
//       const newFilters = { ...prev };
//       if (!newFilters[section]) newFilters[section] = [optionId];
//       else if (newFilters[section].includes(optionId)) newFilters[section] = newFilters[section].filter(id => id !== optionId);
//       else newFilters[section].push(optionId);
//       if (newFilters[section]?.length === 0) delete newFilters[section];
//       sessionStorage.setItem("shop-filters", JSON.stringify(newFilters));
//       return newFilters;
//     });
//   }, []);

//   const handleClearFilters = useCallback(() => {
//     setFilters({});
//     sessionStorage.removeItem("shop-filters");
//     setSearchParams(new URLSearchParams());
//   }, [setSearchParams]);

//   /* ---------- Active Filters ---------- */
//   const activeFilterCount = useMemo(() => Object.values(filters).reduce((total, cur) => total + (Array.isArray(cur) ? cur.length : 0), 0), [filters]);
//   const hasFilters = activeFilterCount > 0;

//   const sortedProducts = useMemo(() => [...products], [products]);
//   const categoryFromLocation = useMemo(() => new URLSearchParams(location.search).get("category"), [location.search]);

//   /* ---------- Open Details Dialog ---------- */
//   useEffect(() => { if (productDetails) setOpenDetailsDialog(true); }, [productDetails]);

//   /* ---------- Render ---------- */
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
//       <div className="container mx-auto px-4 py-8">

//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">
//                 {categoryFromLocation ? `${categoryFromLocation.charAt(0).toUpperCase() + categoryFromLocation.slice(1)} Collection` : "All Products"}
//               </h1>
//               <p className="text-muted-foreground">{products.length} product{products.length !== 1 && "s"} found</p>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* View Toggle */}
//               <div className="flex items-center border rounded-lg overflow-hidden">
//                 <Button variant={gridView === "grid" ? "default" : "ghost"} size="icon" onClick={() => setGridView("grid")} className="rounded-none h-10 w-10">
//                   <Grid3X3 className="h-4 w-4" />
//                 </Button>
//                 <Button variant={gridView === "list" ? "default" : "ghost"} size="icon" onClick={() => setGridView("list")} className="rounded-none h-10 w-10">
//                   <Grid2X2 className="h-4 w-4" />
//                 </Button>
//               </div>

//               {/* Sort Dropdown */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" className="gap-2"><ArrowUpDown className="w-4 h-4" /> Sort</Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuRadioGroup value={sort} onValueChange={(value) => { setSort(value); sessionStorage.setItem("shop-sort", value); }}>
//                     {sortOptions.map((sortItem) => <DropdownMenuRadioItem key={sortItem.id} value={sortItem.id}>{sortItem.label}</DropdownMenuRadioItem>)}
//                   </DropdownMenuRadioGroup>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* Mobile Filter Button */}
//               <Button variant="outline" className="gap-2 lg:hidden" onClick={() => setShowMobileFilters(true)}>
//                 <Filter className="h-4 w-4" /> Filters
//                 {hasFilters && <Badge variant="default" className="ml-1 h-5 min-w-5 text-xs">{activeFilterCount}</Badge>}
//               </Button>
//             </div>
//           </div>

//           {/* Active Filters */}
//           {hasFilters && (
//             <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-muted/20 rounded-xl border">
//               <span className="text-sm font-medium">Active filters:</span>
//               {Object.entries(filters).map(([key, values]) =>
//                 Array.isArray(values) && values.map(value => (
//                   <Badge key={`${key}-${value}`} variant="secondary" className="gap-2 px-3 py-1.5">
//                     {key}: {value}
//                     <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilter(key, value)} />
//                   </Badge>
//                 ))
//               )}
//               <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto text-sm">Clear all</Button>
//             </div>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

//           {/* Desktop Filter */}
//           <div className="hidden lg:block">
//             <ProductFilter filters={filters} handleFilter={handleFilter} onClearFilters={handleClearFilters} />
//           </div>

//           {/* Products */}
//           <div>
//             {isLoading ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {[...Array(8)].map((_, i) => (
//                   <div key={i} className="space-y-3">
//                     <Skeleton className="h-64 w-full rounded-xl" />
//                     <Skeleton className="h-4 w-3/4" />
//                     <Skeleton className="h-4 w-1/2" />
//                     <Skeleton className="h-10 w-full" />
//                   </div>
//                 ))}
//               </div>
//             ) : sortedProducts.length > 0 ? (
//               gridView === "grid" ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {sortedProducts.map(p => (
//                     <ShoppingProductTile key={p._id} product={p} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {sortedProducts.map(p => (
//                     <div key={p._id} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
//                       <div className="flex gap-4">
//                         <div className="w-32 h-32 flex-shrink-0"><img src={p.image} alt={p.title} className="w-full h-full object-cover rounded-lg" loading="lazy" /></div>
//                         <div className="flex-1">
//                           <div className="flex justify-between">
//                             <h3 className="font-semibold text-lg">{p.title}</h3>
//                             <span className="text-xl font-bold">₵{p.salePrice || p.price}</span>
//                           </div>
//                           <p className="text-sm text-muted-foreground line-clamp-2 my-2">{p.description}</p>
//                           <div className="flex items-center gap-4">
//                             <Button onClick={() => handleAddtoCart(p)} className="gap-2">Add to Cart</Button>
//                             <Button variant="outline" onClick={() => handleGetProductDetails(p._id)}>View Details</Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )
//             ) : (
//               <div className="py-16">
//                 <Empty>
//                   <EmptyHeader>
//                     <EmptyMedia variant="icon"><PackageOpen className="h-12 w-12" /></EmptyMedia>
//                     <EmptyTitle>No products found</EmptyTitle>
//                     <EmptyDescription>{hasFilters ? "Try adjusting your filters or search criteria" : "Check back soon for new arrivals"}</EmptyDescription>
//                   </EmptyHeader>
//                   <div className="mt-6 space-x-3">
//                     {hasFilters && <Button onClick={handleClearFilters}>Clear Filters</Button>}
//                     <Button variant="outline" onClick={() => navigate("/shop/home")}>Continue Shopping</Button>
//                   </div>
//                 </Empty>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mobile Filter Sheet */}
//         {showMobileFilters && (
//           <div className="fixed inset-0 z-50 bg-background lg:hidden">
//             <div className="flex flex-col h-full">
//               <div className="sticky top-0 z-10 border-b bg-background px-4 py-3 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <Filter className="h-5 w-5" />
//                   <div>
//                     <h3 className="font-semibold">Filters</h3>
//                     {hasFilters && <p className="text-xs text-muted-foreground">{activeFilterCount} active filter{activeFilterCount !== 1 && "s"}</p>}
//                   </div>
//                 </div>
//                 <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5" /></Button>
//               </div>
//               <div className="flex-1 overflow-y-auto p-4">
//                 <ProductFilter filters={filters} handleFilter={handleFilter} onClearFilters={handleClearFilters} />
//               </div>
//               <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm p-4 grid grid-cols-2 gap-3">
//                 <Button variant="outline" onClick={handleClearFilters} disabled={!hasFilters}>Clear All</Button>
//                 <Button onClick={() => setShowMobileFilters(false)}>Apply Filters</Button>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>

//       {/* Product Details Dialog */}
//       <ProductDetailsDialog open={openDetailsDialog} setOpen={setOpenDetailsDialog} productDetails={productDetails} handleAddtoCart={handleAddtoCart} />
//     </div>
//   );
// }


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
import { ArrowUpDown, Filter, Grid2X2, Grid3X3, X, PackageOpen } from "lucide-react";
import { sortOptions } from "@/config";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

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

  /* ---------- Fetch Wishlist ---------- */
  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  /* ---------- Fetch Products ---------- */
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParam: sort }));
  }, [dispatch, filters, sort]);

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
  }, [searchParams]);

  /* ---------- Sync Filters to URL ---------- */
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setSearchParams(new URLSearchParams(createSearchParamsHelper(filters)));
    } else {
      setSearchParams(new URLSearchParams());
    }
  }, [filters, setSearchParams]);

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
      
      if (product.totalStock === 0) {
        toast.error("Product is out of stock");
        return;
      }

      dispatch(addToCart({ userId: user.id, productId: product._id, quantity: 1 }))
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
    sessionStorage.removeItem("shop-filters");
    setSearchParams(new URLSearchParams());
    toast.success("Filters cleared");
  }, [setSearchParams]);

  /* ---------- Active Filters ---------- */
  const activeFilterCount = useMemo(
    () =>
      Object.values(filters).reduce(
        (total, cur) => total + (Array.isArray(cur) ? cur.length : 0),
        0
      ),
    [filters]
  );

  const hasFilters = activeFilterCount > 0;
  const sortedProducts = useMemo(() => [...products], [products]);
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
          <p className="text-muted-foreground">
            {products.length} product{products.length !== 1 && "s"} found
            {hasFilters && (
              <span className="ml-2">
                • <Badge variant="secondary" className="ml-1">{activeFilterCount} filter{activeFilterCount !== 1 && 's'}</Badge>
              </span>
            )}
          </p>
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
              Filters {hasFilters && <Badge className="ml-2">{activeFilterCount}</Badge>}
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
            <ProductFilter
              filters={filters}
              handleFilter={handleFilter}
              onClearFilters={handleClearFilters}
            />
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
                    Clear Filters
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort: {sortOptions.find(opt => opt.value === sort)?.label || "Recommended"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
                      {sortOptions.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

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
                      isOutOfStock={p.totalStock === 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((p) => (
                    <div key={p._id} className="p-4 border rounded-xl">
                      <h3 className="font-semibold text-lg">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Available: {p.totalStock}
                      </p>
                      <Button
                        className="mt-2"
                        disabled={p.totalStock === 0}
                        onClick={() => handleAddtoCart(p)}
                      >
                        {p.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
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
                {hasFilters && (
                  <div className="mt-4">
                    <Button onClick={handleClearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
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
