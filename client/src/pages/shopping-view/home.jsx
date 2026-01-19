// import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { useSwipeable } from "react-swipeable";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   BabyIcon,
//   ShirtIcon,
//   Venus,
//   WatchIcon,
//   UmbrellaIcon,
//   TrophyIcon,
//   ChevronLeft,
//   ChevronRight,
//   Sparkles,
//   Tag,
//   Award,
//   Shield,
//   Truck,
//   ShoppingBag,
//   Heart,
//   PackageOpen
// } from "lucide-react";

// import {
//   Empty,
//   EmptyContent,
//   EmptyDescription,
//   EmptyHeader,
//   EmptyMedia,
//   EmptyTitle,
// } from "@/components/ui/empty";

// import bannerOne from "../../assets/ban/b-1.webp";
// import bannerTwo from "../../assets/ban/b-2.webp";
// import bannerThree from "../../assets/ban/b-3.webp";


// import { fetchAllFilteredProducts, fetchProductDetails } from "@/store/shop/products-slice";
// import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
// import { fetchWishlist } from "@/store/shop/wishlist-slice";
// import ShoppingProductTile from "@/components/shoping-view/product-tile";
// import ProductDetailsDialog from "@/components/shoping-view/product-details";
// import { toast } from "sonner";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { cn } from "@/lib/utils";

// const AUTOPLAY_DELAY = 5000;
// const MAX_FEATURED_PRODUCTS = 8;
// const slides = [bannerOne, bannerTwo, bannerThree];

// const categoriesWithIcons = [
//   { id: "men", label: "Men", icon: ShirtIcon, color: "from-blue-500 to-cyan-500" },
//   { id: "women", label: "Women", icon: Venus, color: "from-pink-500 to-rose-500" },
//   { id: "kids", label: "Kids", icon: BabyIcon, color: "from-green-500 to-emerald-500" },
//   { id: "footwear", label: "Footwear", icon: TrophyIcon, color: "from-amber-500 to-orange-500" },
//   { id: "accessories", label: "Accessories", icon: WatchIcon, color: "from-purple-500 to-violet-500" },
// ];

// const brandWithIcons = [
//   { id: "nike", label: "Nike", icon: ShirtIcon, color: "bg-gradient-to-r from-black to-gray-800" },
//   { id: "adidas", label: "Adidas", icon: TrophyIcon, color: "bg-gradient-to-r from-blue-900 to-black" },
//   { id: "puma", label: "Puma", icon: ShirtIcon, color: "bg-gradient-to-r from-red-600 to-black" },
//   { id: "reebok", label: "Reebok", icon: ShirtIcon, color: "bg-gradient-to-r from-blue-500 to-red-500" },
//   { id: "gucci", label: "Gucci", icon: UmbrellaIcon, color: "bg-gradient-to-r from-red-800 to-amber-900" },
//   { id: "prada", label: "Prada", icon: UmbrellaIcon, color: "bg-gradient-to-r from-black to-gray-700" },
// ];

// export default function ShoppingHome() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { products = [], isLoading, error, productDetails } = useSelector(
//     (state) => state.shopProducts || {}
//   );
//   const { user } = useSelector((state) => state.auth || {});
//   const { items: wishlistItems } = useSelector((state) => state.wishlist || { items: [] });

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [paused, setPaused] = useState(false);
//   const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

//   const autoplayRef = useRef(null);

//   /* ---------- Fetch Wishlist ---------- */
//   useEffect(() => {
//     if (user?.id) dispatch(fetchWishlist());
//   }, [dispatch, user?.id]);

//   /* ---------- Slider Handlers ---------- */
//   const next = useCallback(() => setCurrentIndex((i) => (i + 1) % slides.length), []);
//   const prev = useCallback(() => setCurrentIndex((i) => (i - 1 + slides.length) % slides.length), []);
//   const goToSlide = useCallback((index) => setCurrentIndex(index), []);

//   useEffect(() => {
//     autoplayRef.current = setInterval(() => { if (!paused) next(); }, AUTOPLAY_DELAY);
//     return () => clearInterval(autoplayRef.current);
//   }, [paused, next]);

//   const swipeHandlers = useSwipeable({ onSwipedLeft: next, onSwipedRight: prev, trackMouse: true });

//   /* ---------- Fetch Products ---------- */
//   useEffect(() => {
//     dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParam: null }));
//   }, [dispatch]);

//   const featuredProducts = useMemo(() => (Array.isArray(products) ? products.slice(0, MAX_FEATURED_PRODUCTS) : []), [products]);

//   /* ---------- Navigation ---------- */
//   const handleNavigateToListingPage = useCallback((item, type) => {
//     const params = new URLSearchParams();
//     params.set(type, item.id);
//     navigate(`/shop/listing?${params.toString()}`);
//   }, [navigate]);

//   /* ---------- Product Details ---------- */
//   const handleGetProductDetails = useCallback((productId) => {
//     dispatch(fetchProductDetails({ productId })).then((res) => {
//       if (res?.meta?.requestStatus === "fulfilled") setOpenDetailsDialog(true);
//     });
//   }, [dispatch]);

//   /* ---------- Add to Cart ---------- */
//   const handleAddtoCart = useCallback((product) => {
//     if (!user?.id || !product?._id) return;
//     dispatch(addToCart({ userId: user.id, productId: product._id, quantity: 1 }))
//       .then((res) => {
//         if (res?.meta?.requestStatus === "fulfilled") {
//           dispatch(fetchCartItems(user.id));
//           toast.success("", { description: `${product.title} added successfully` });
//         } else toast.error("Failed to add to cart");
//       });
//   }, [dispatch, user?.id]);

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/10">

//       {/* -------------------- HERO BANNER -------------------- */}
//       <section {...swipeHandlers} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
//         className="relative h-[500px] md:h-[600px] overflow-hidden group">
//         <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
//           {slides.map((src, i) => (
//             <div key={i} className="w-full h-full flex-shrink-0 relative">
//               <img loading="lazy" src={src} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
//               <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
//               <div className="absolute inset-0 flex items-center">
//                 <div className="container mx-auto px-4 md:px-8 max-w-xl space-y-4">
//                   <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
//                     <Sparkles className="h-3 w-3 mr-1" /> New Collection
//                   </Badge>
//                   <h1 className="text-4xl md:text-6xl font-bold text-white">
//                     {i === 0 && "Premium Fragrances"}
//                     {i === 1 && "Luxury Scents"}
//                     {i === 2 && "Elegant Aromas"}
//                   </h1>
//                   <p className="text-white/90 text-lg md:text-xl">Discover our exclusive collection of premium perfumes</p>
//                   <Button size="lg" className="mt-4 bg-white text-black hover:bg-white/90 gap-2" onClick={() => navigate("/shop/listing")}>
//                     <ShoppingBag className="h-5 w-5" /> Shop Now
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <Button onClick={prev} className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white" size="icon">
//           <ChevronLeft className="h-6 w-6" />
//         </Button>
//         <Button onClick={next} className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white" size="icon">
//           <ChevronRight className="h-6 w-6" />
//         </Button>

//         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
//           {slides.map((_, i) => (
//             <button key={i} onClick={() => goToSlide(i)}
//               className={cn("h-2 w-2 rounded-full transition-all duration-300", currentIndex === i ? "bg-white w-8" : "bg-white/50 hover:bg-white/80")}
//               aria-label={`Go to slide ${i + 1}`} />
//           ))}
//         </div>
//       </section>

//       {/* -------------------- TRUST BADGES -------------------- */}
//       <section className="py-8 bg-background border-y">
//         <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
//           {[
//             {icon: Truck, title: "Free Shipping", desc: "On orders over GHC 300", bg:"blue-50", color:"blue-600"},
//             {icon: Shield, title:"Secure Payment", desc:"100% secure & safe", bg:"green-50", color:"green-600"},
//             {icon: Award, title:"Best Quality", desc:"Authentic products", bg:"purple-50", color:"purple-600"},
//             {icon: Tag, title:"Best Price", desc:"Guaranteed lowest price", bg:"amber-50", color:"amber-600"}
//           ].map((item, idx)=>(
//             <div key={idx} className="space-y-3">
//               <div className={cn(`h-14 w-14 rounded-full flex items-center justify-center mx-auto bg-${item.bg}`)}>
//                 <item.icon className={cn(`h-7 w-7 text-${item.color}`)} />
//               </div>
//               <div>
//                 <h3 className="font-semibold">{item.title}</h3>
//                 <p className="text-sm text-muted-foreground">{item.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* -------------------- SHOP BY CATEGORY -------------------- */}
//       <section className="py-12 md:py-16">
//         <div className="container mx-auto px-4 text-center mb-10">
//           <Badge className="mb-4 bg-primary/10 text-primary border-0">Categories</Badge>
//           <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
//           <p className="text-muted-foreground max-w-2xl mx-auto">Explore our wide range of premium fragrance categories</p>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mt-8">
//             {categoriesWithIcons.map((cat)=>(
//               <Card key={cat.id} onClick={()=>handleNavigateToListingPage(cat,"category")} className="cursor-pointer border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card overflow-hidden group">
//                 <CardContent className="flex flex-col items-center p-6 md:p-8">
//                   <div className={cn("h-16 w-16 rounded-full bg-gradient-to-br", cat.color,"flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300")}>
//                     <cat.icon className="h-8 w-8 text-white" />
//                   </div>
//                   <span className="font-semibold text-lg">{cat.label}</span>
//                   <span className="text-sm text-muted-foreground mt-2">Browse collection</span>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* -------------------- FEATURED PRODUCTS -------------------- */}
//       <section className="py-12 md:py-16">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-10">
//             <Badge className="mb-4 bg-primary/10 text-primary border-0">Featured</Badge>
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
//             <p className="text-muted-foreground max-w-2xl mx-auto">Handpicked selection of our most popular fragrances</p>
//           </div>

//           {isLoading ? (
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {[...Array(4)].map((_, i) => (
//                 <Card key={i} className="overflow-hidden">
//                   <Skeleton className="h-64 w-full" />
//                   <CardContent className="p-4 space-y-3">
//                     <Skeleton className="h-4 w-3/4" />
//                     <Skeleton className="h-4 w-1/2" />
//                     <Skeleton className="h-10 w-full" />
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           ) : error ? (
//             <div className="text-center py-12">
//               <PackageOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
//               <h3 className="text-xl font-semibold mb-2">Failed to load products</h3>
//               <p className="text-muted-foreground mb-6">{error}</p>
//               <Button onClick={() => window.location.reload()}>Try Again</Button>
//             </div>
//           ) : featuredProducts.length ? (
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {featuredProducts.map(p => (
//                 <ShoppingProductTile key={p._id} product={p} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
//               ))}
//             </div>
//           ) : (
//             <Empty>
//               <EmptyHeader>
//                 <EmptyMedia variant="icon"><PackageOpen size={48} /></EmptyMedia>
//                 <EmptyTitle>No products found</EmptyTitle>
//                 <EmptyDescription>Check back soon for new arrivals</EmptyDescription>
//               </EmptyHeader>
//               <EmptyContent>
//                 <Button variant="outline" onClick={()=>navigate("/shop/listing")}>Browse All Products</Button>
//               </EmptyContent>
//             </Empty>
//           )}
//         </div>
//       </section>

//       {/* -------------------- PRODUCT DETAILS DIALOG -------------------- */}
//       <ProductDetailsDialog open={openDetailsDialog} setOpen={setOpenDetailsDialog} productDetails={productDetails} handleAddtoCart={handleAddtoCart} />
//     </div>
//   );
// }


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
