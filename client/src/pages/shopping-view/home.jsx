import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSwipeable } from "react-swipeable";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BabyIcon,
  ShirtIcon,
  Venus,
  WatchIcon,
  UmbrellaIcon,
  TrophyIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Award,
  Shield,
  Truck,
  ShoppingBag,
  PackageOpen,
} from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import bannerOne from "../../assets/ban/b-1.webp";
import bannerTwo from "../../assets/ban/b-2.webp";
import bannerThree from "../../assets/ban/b-3.webp";

import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchWishlist } from "@/store/shop/wishlist-slice";

import ShoppingProductTile from "@/components/shoping-view/product-tile";
import ProductDetailsDialog from "@/components/shoping-view/product-details";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                    CONSTS                                  */
/* -------------------------------------------------------------------------- */

const AUTOPLAY_DELAY = 5000;
const MAX_FEATURED_PRODUCTS = 8;
const slides = [bannerOne, bannerTwo, bannerThree];

const categoriesWithIcons = [
  { id: "men", label: "Men", icon: ShirtIcon, color: "from-blue-500 to-cyan-500" },
  { id: "women", label: "Women", icon: Venus, color: "from-pink-500 to-rose-500" },
  { id: "kids", label: "Kids", icon: BabyIcon, color: "from-green-500 to-emerald-500" },
  { id: "footwear", label: "Footwear", icon: TrophyIcon, color: "from-amber-500 to-orange-500" },
  { id: "accessories", label: "Accessories", icon: WatchIcon, color: "from-purple-500 to-violet-500" },
];

const trustBadges = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over GHC 300", bg: "blue-50", color: "blue-600" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure & safe", bg: "green-50", color: "green-600" },
  { icon: Award, title: "Best Quality", desc: "Authentic products", bg: "purple-50", color: "purple-600" },
  { icon: Tag, title: "Best Price", desc: "Guaranteed lowest price", bg: "amber-50", color: "amber-600" },
];

const heroTitles = [
  "Premium Fragrances",
  "Luxury Scents",
  "Elegant Aromas",
];

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function ShoppingHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products = [], isLoading, error, productDetails } = useSelector(
    (state) => state.shopProducts || {}
  );
  const { user } = useSelector((state) => state.auth || {});
  const { items: wishlistItems } = useSelector(
    (state) => state.wishlist || { items: [] }
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const autoplayRef = useRef(null);

  /* ------------------------------ SIDE EFFECTS ----------------------------- */

  useEffect(() => {
    if (user?.id) dispatch(fetchWishlist());
  }, [dispatch, user?.id]);

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParam: null }));
  }, [dispatch]);

  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      if (!paused) setCurrentIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_DELAY);

    return () => clearInterval(autoplayRef.current);
  }, [paused]);

  /* ------------------------------ MEMO VALUES ------------------------------ */

  const featuredProducts = useMemo(
    () => products.slice(0, MAX_FEATURED_PRODUCTS),
    [products]
  );

  /* ------------------------------ HANDLERS -------------------------------- */

  const next = useCallback(
    () => setCurrentIndex((i) => (i + 1) % slides.length),
    []
  );

  const prev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + slides.length) % slides.length),
    []
  );

  const goToSlide = useCallback((index) => setCurrentIndex(index), []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    trackMouse: true,
  });

  const handleNavigateToListingPage = useCallback(
    (item, type) => {
      const params = new URLSearchParams();
      params.set(type, item.id);
      navigate(`/shop/listing?${params.toString()}`);
    },
    [navigate]
  );

  const handleGetProductDetails = useCallback(
    (productId) => {
      dispatch(fetchProductDetails({ productId })).then((res) => {
        if (res?.meta?.requestStatus === "fulfilled") {
          setOpenDetailsDialog(true);
        }
      });
    },
    [dispatch]
  );

  const handleAddtoCart = useCallback(
    (product) => {
      if (!user?.id || !product?._id) return;

      dispatch(
        addToCart({
          userId: user.id,
          productId: product._id,
          quantity: 1,
        })
      ).then((res) => {
        if (res?.meta?.requestStatus === "fulfilled") {
          dispatch(fetchCartItems(user.id));
          toast.success("", {
            description: `${product.title} added successfully`,
          });
        } else {
          toast.error("Failed to add to cart");
        }
      });
    },
    [dispatch, user?.id]
  );

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/10">

      {/* ============================== HERO ================================== */}
      <section
        {...swipeHandlers}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative h-[500px] md:h-[600px] overflow-hidden group"
      >
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 relative">
              <img src={src} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 max-w-xl space-y-4">
                  <Badge className="bg-white/20 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    New Collection
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold text-white">
                    {heroTitles[i]}
                  </h1>
                  <p className="text-white/90 text-lg">
                    Discover our exclusive collection of premium perfumes
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-black"
                    onClick={() => navigate("/shop/listing")}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={prev} size="icon" className="absolute left-4 top-1/2">
          <ChevronLeft />
        </Button>
        <Button onClick={next} size="icon" className="absolute right-4 top-1/2">
          <ChevronRight />
        </Button>
      </section>

      {/* ============================ TRUST =================================== */}
      <section className="py-8 border-y">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {trustBadges.map((b, i) => (
            <div key={i} className="space-y-3">
              <div className={`h-14 w-14 mx-auto rounded-full bg-${b.bg} flex items-center justify-center`}>
                <b.icon className={`h-7 w-7 text-${b.color}`} />
              </div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== CATEGORIES ================================ */}
      <section className="py-12">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
          {categoriesWithIcons.map((cat) => (
            <Card
              key={cat.id}
              onClick={() => handleNavigateToListingPage(cat, "category")}
              className="cursor-pointer hover:shadow-xl transition"
            >
              <CardContent className="flex flex-col items-center p-6">
                <div className={cn("h-16 w-16 rounded-full bg-gradient-to-br", cat.color, "flex items-center justify-center")}>
                  <cat.icon className="h-8 w-8 text-white" />
                </div>
                <span className="mt-4 font-semibold">{cat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ========================== FEATURED ================================ */}
      <section className="py-12">
        <div className="container mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))
            : featuredProducts.map((p) => (
                <ShoppingProductTile
                  key={p._id}
                  product={p}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
        handleAddtoCart={handleAddtoCart}
      />
    </div>
  );
}
