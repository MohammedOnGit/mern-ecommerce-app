import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { performSearch } from "@/store/shop/search-slice";
import ShoppingProductTile from "@/components/shoping-view/product-tile";
import { Search, Filter, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [sortBy, setSortBy] = useState("relevance");
  const [filters, setFilters] = useState({
    category: categoryParam ? [categoryParam] : [],
    priceRange: { min: 0, max: 1000 },
    inStock: false,
  });

  const { items: searchResults = [], isLoading, error } = useSelector((state) => state.search);

  // Perform search whenever query, filters, or sort changes
  useEffect(() => {
    if (query || filters.category.length > 0) {
      dispatch(performSearch({ query, filters, sortBy }));
    }
  }, [dispatch, query, filters, sortBy]);

  // Handlers
  const handleSortChange = useCallback((value) => setSortBy(value), []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  }, []);

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Search Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => dispatch(performSearch({ query, filters, sortBy }))}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {query ? `Search results for "${query}"` : "All Products"}
            </h1>
            <p className="text-muted-foreground">
              {searchResults.length} {searchResults.length === 1 ? "product" : "products"} found
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span>
                    Sort by: {sortBy === "relevance" ? "Relevance" :
                              sortBy === "price-low" ? "Price: Low to High" :
                              sortBy === "price-high" ? "Price: High to Low" : "Newest"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSortChange("relevance")}>Relevance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("price-low")}>Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("price-high")}>Price: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("newest")}>Newest</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Button */}
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4 space-y-6">
          {/* Categories */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {["Men's Fragrance", "Women's Perfume", "Unisex", "Luxury", "Gift Sets"].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange("category", [...filters.category, cat]);
                      } else {
                        handleFilterChange("category", filters.category.filter(c => c !== cat));
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Price Range</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">₵{filters.priceRange.min}</span>
                <span className="text-sm">₵{filters.priceRange.max}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange("priceRange", { ...filters.priceRange, max: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* In Stock */}
          <div className="bg-card border rounded-lg p-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="font-semibold">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          {searchResults.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button asChild>
                <Link to="/shop/listing">Browse All Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(product => (
                <ShoppingProductTile
                  key={product._id || product.id}
                  product={product}
                  handleGetProductDetails={(id) => navigate(`/shop/product/${id}`)}
                  handleAddtoCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
