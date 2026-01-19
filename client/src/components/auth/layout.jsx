
// import { Outlet } from "react-router-dom";
// import { useEffect, useState } from "react";

// function AuthLayout() {
//   const [currentSlide, setCurrentSlide] = useState(0);
  
//   const slides = [
//     {
//       quote: "Elegance in Every Drop",
//       description: "Discover scents that tell your unique story",
//       imageAlt: "Luxury perfume bottle with golden accents"
//     },
//     {
//       quote: "Crafted with Passion",
//       description: "Artisan fragrances from world's finest perfumers",
//       imageAlt: "Perfumer crafting a signature scent"
//     },
//     {
//       quote: "Timeless Luxury",
//       description: "Scents that evolve beautifully with your skin",
//       imageAlt: "Elegant woman enjoying premium fragrance"
//     },
//     {
//       quote: "Signature Scents",
//       description: "Find your perfect match from our curated collection",
//       imageAlt: "Collection of designer perfume bottles"
//     }
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [slides.length]);

//   return (
//     <div className="flex min-h-dvh w-full bg-background">
//       {/* Hero Section - Left Panel */}
//       <div className="hidden lg:flex flex-col relative w-1/2 bg-gradient-to-br from-gray-900 via-black to-purple-950 overflow-hidden">
//         {/* Background Pattern */}
//         <div className="absolute inset-0 opacity-5">
//           <div className="absolute inset-0" style={{
//             backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 2px)`,
//             backgroundSize: '50px 50px'
//           }} />
//         </div>
        
//         {/* Branding */}
//         <div className="relative z-10 pt-8 pl-12">
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center">
//               <span className="text-white font-bold text-lg">A</span>
//             </div>
//             <span className="text-xl font-light tracking-widest text-white/90">ADEEB</span>
//           </div>
//         </div>

//         {/* Slideshow Content */}
//         <div className="flex-1 flex flex-col items-center justify-center px-12 relative z-10">
//           <div className="max-w-lg mx-auto text-center space-y-8">
//             {/* Slide Indicator */}
//             <div className="flex justify-center gap-2 mb-8">
//               {slides.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentSlide(index)}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${
//                     currentSlide === index 
//                       ? 'w-8 bg-gradient-to-r from-amber-400 to-rose-400' 
//                       : 'w-1.5 bg-white/30 hover:bg-white/50'
//                   }`}
//                   aria-label={`Go to slide ${index + 1}`}
//                 />
//               ))}
//             </div>

//             {/* Quote */}
//             <div className="relative h-48 overflow-hidden">
//               {slides.map((slide, index) => (
//                 <div
//                   key={index}
//                   className={`absolute inset-0 flex flex-col items-center justify-center space-y-6 transition-all duration-500 ${
//                     currentSlide === index 
//                       ? 'opacity-100 translate-y-0' 
//                       : 'opacity-0 translate-y-4'
//                   }`}
//                 >
//                   <div className="text-amber-400/20 text-9xl font-serif absolute -top-8 -left-8">"</div>
//                   <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight text-white relative z-10 px-4">
//                     {slide.quote}
//                   </h1>
//                   <div className="text-amber-400/20 text-9xl font-serif absolute -bottom-8 -right-8">"</div>
//                   <p className="text-white/70 text-lg font-light max-w-md">
//                     {slide.description}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {/* Trust Indicators */}
//             <div className="pt-12 border-t border-white/10">
//               <div className="grid grid-cols-3 gap-8 text-center">
//                 <div>
//                   <div className="text-2xl font-bold text-white mb-1">500+</div>
//                   <div className="text-sm text-white/60">Exclusive Scents</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-white mb-1">98%</div>
//                   <div className="text-sm text-white/60">Customer Satisfaction</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-white mb-1">24/7</div>
//                   <div className="text-sm text-white/60">Expert Support</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Decorative Elements */}
//         <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
//         <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
//         <div className="absolute bottom-1/3 -left-20 w-64 h-64 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-3xl" />
//       </div>

//       {/* Auth Form Section - Right Panel */}
//       <div className="flex flex-1 flex-col lg:flex-row">
//         {/* Mobile Header */}
//         <div className="lg:hidden px-6 py-4 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center">
//                 <span className="text-white font-bold text-sm">A</span>
//               </div>
//               <span className="text-lg font-light tracking-widest">ADEEB</span>
//             </div>
//             <div className="text-sm text-muted-foreground">
//               Luxury Scents
//             </div>
//           </div>
//         </div>

//         {/* Form Container */}
//         <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
//           {/* Desktop Back Button */}
//           <div className="hidden lg:block absolute top-8 right-8">
//             <a 
//               href="/" 
//               className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
//             >
//               <svg 
//                 className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" 
//                 fill="none" 
//                 stroke="currentColor" 
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//               Back to Home
//             </a>
//           </div>

//           <div className="w-full max-w-md space-y-8">
//             {/* Mobile Welcome */}
//             <div className="lg:hidden text-center mb-8">
//               <h1 className="text-2xl font-serif font-medium text-foreground mb-2">
//                 Welcome Back
//               </h1>
//               <p className="text-muted-foreground">
//                 Sign in to access your exclusive scents
//               </p>
//             </div>

//             {/* Form Content */}
//             <Outlet />

//             {/* Auth Footer */}
//             <div className="pt-8 border-t">
//               <div className="text-center text-sm text-muted-foreground">
//                 <p>By continuing, you agree to our</p>
//                 <p className="mt-1">
//                   <a href="/terms" className="text-foreground hover:text-amber-600 transition-colors font-medium">
//                     Terms of Service
//                   </a> 
//                   {" • "}
//                   <a href="/privacy" className="text-foreground hover:text-amber-600 transition-colors font-medium">
//                     Privacy Policy
//                   </a>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Mobile Trust Indicators */}
//           <div className="lg:hidden mt-12 pt-8 border-t w-full max-w-md">
//             <div className="grid grid-cols-3 gap-4 text-center">
//               <div className="space-y-1">
//                 <div className="h-8 w-8 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
//                   <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//                   </svg>
//                 </div>
//                 <div className="text-xs text-muted-foreground">Premium Quality</div>
//               </div>
//               <div className="space-y-1">
//                 <div className="h-8 w-8 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
//                   <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div className="text-xs text-muted-foreground">Fast Delivery</div>
//               </div>
//               <div className="space-y-1">
//                 <div className="h-8 w-8 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
//                   <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 </div>
//                 <div className="text-xs text-muted-foreground">24/7 Support</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Background Pattern for Auth Section */}
//         <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2 -z-10">
//           <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-50/30" />
//           <div className="absolute inset-0 opacity-[0.02]" style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//             backgroundSize: '60px 60px'
//           }} />
//         </div>
//       </div>

//       {/* Mobile Bottom Decoration */}
//       <div className="lg:hidden fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
//     </div>
//   );
// }

// export default AuthLayout;


import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
