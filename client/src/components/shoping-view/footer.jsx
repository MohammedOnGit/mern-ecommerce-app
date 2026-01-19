// import { Instagram, Facebook, Twitter, Heart } from "lucide-react";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { useState } from "react";

// export function ShoppingFooter() {
//   const currentYear = new Date().getFullYear();
//   const [email, setEmail] = useState("");

//   const handleSubscribe = (e) => {
//     e.preventDefault();
//     if (!email) return;
//     setEmail("");
//   };

//   return (
//     <footer className="border-t bg-background">
//       {/* Newsletter */}
//       <div className="bg-primary/5 py-8">
//         <div className="container mx-auto px-4">
//           <div className="max-w-md mx-auto text-center space-y-4">
//             <h3 className="text-lg font-semibold">Join Our Fragrance Family</h3>
//             <p className="text-sm text-muted-foreground">
//               Get exclusive offers and new scent alerts
//             </p>
//             <form onSubmit={handleSubscribe} className="flex gap-2">
//               <Input
//                 type="email"
//                 placeholder="Your email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <Button type="submit" size="sm">
//                 Subscribe
//               </Button>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Main Footer */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* Brand */}
//           <div className="md:col-span-2 space-y-3">
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold">
//                 A
//               </div>
//               <div>
//                 <h2 className="font-serif text-xl font-bold">adeeB</h2>
//                 <p className="text-sm text-muted-foreground">
//                   Luxury Fragrances
//                 </p>
//               </div>
//             </div>
//             <p className="text-sm text-muted-foreground">
//               Crafting signature scents that tell your unique story since 2023.
//             </p>
//           </div>

//           {/* Shop */}
//           <div>
//             <h3 className="font-semibold mb-3">Shop</h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li><Link to="/shop/men" className="hover:text-primary">Men</Link></li>
//               <li><Link to="/shop/women" className="hover:text-primary">Women</Link></li>
//               <li><Link to="/shop/unisex" className="hover:text-primary">Unisex</Link></li>
//               <li><Link to="/shop/new-arrivals" className="hover:text-primary">New Arrivals</Link></li>
//             </ul>
//           </div>

//           {/* Support */}
//           <div>
//             <h3 className="font-semibold mb-3">Support</h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
//               <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
//               <li><Link to="/shipping" className="hover:text-primary">Shipping</Link></li>
//               <li><Link to="/returns" className="hover:text-primary">Returns</Link></li>
//             </ul>
//           </div>
//         </div>

//         <Separator className="my-6" />

//         {/* Bottom Bar */}
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="text-center sm:text-left">
//             <p className="text-sm text-muted-foreground">
//               © {currentYear} adeeB Perfumes
//             </p>
//             <p className="text-xs text-muted-foreground">
//               Made with <Heart className="inline h-3 w-3 text-red-500" /> in Ghana
//             </p>
//           </div>

//           <div className="flex gap-2">
//             <Button variant="ghost" size="icon">
//               <Instagram className="h-4 w-4" />
//             </Button>
//             <Button variant="ghost" size="icon">
//               <Facebook className="h-4 w-4" />
//             </Button>
//             <Button variant="ghost" size="icon">
//               <Twitter className="h-4 w-4" />
//             </Button>
//           </div>

//           <div className="flex gap-3 text-xs text-muted-foreground">
//             <Link to="/privacy" className="hover:text-primary">Privacy</Link>
//             <Link to="/terms" className="hover:text-primary">Terms</Link>
//             <Link to="/cookies" className="hover:text-primary">Cookies</Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

// export function CompactFooter() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="border-t bg-background mt-8">
//       <div className="container mx-auto px-4 py-6 text-center space-y-3">
//         <div className="flex items-center justify-center gap-2">
//           <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold">
//             A
//           </div>
//           <span className="font-serif font-bold">adeeB</span>
//         </div>

//         <p className="text-sm text-muted-foreground">
//           © {currentYear} adeeB Perfumes. All rights reserved.
//         </p>

//         <div className="flex justify-center gap-4 text-xs text-muted-foreground">
//           <Link to="/privacy" className="hover:text-primary">Privacy</Link>
//           <Link to="/terms" className="hover:text-primary">Terms</Link>
//           <Link to="/contact" className="hover:text-primary">Contact</Link>
//         </div>
//       </div>
//     </footer>
//   );
// }


import { Instagram, Facebook, Twitter, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export function ShoppingFooter() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // placeholder for API integration
    setTimeout(() => {
      setEmail("");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <footer className="border-t bg-background">
      {/* Newsletter */}
      <div className="bg-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h3 className="text-lg font-semibold">
              Join Our Fragrance Family
            </h3>
            <p className="text-sm text-muted-foreground">
              Get exclusive offers and new scent alerts
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex gap-2"
              aria-label="Newsletter subscription form"
            >
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">adeeB</h2>
                <p className="text-sm text-muted-foreground">
                  Luxury Fragrances
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground max-w-sm">
              Crafting signature scents that tell your unique story since 2023.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/shop/men" className="hover:text-primary">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/shop/women" className="hover:text-primary">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/shop/unisex" className="hover:text-primary">
                  Unisex
                </Link>
              </li>
              <li>
                <Link to="/shop/new-arrivals" className="hover:text-primary">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-primary">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-primary">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} adeeB Perfumes
            </p>
            <p className="text-xs text-muted-foreground">
              Made with{" "}
              <Heart className="inline h-3 w-3 text-red-500" /> in Ghana
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-3 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link to="/cookies" className="hover:text-primary">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CompactFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background mt-8">
      <div className="container mx-auto px-4 py-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-serif font-bold">adeeB</span>
        </div>

        <p className="text-sm text-muted-foreground">
          © {currentYear} adeeB Perfumes. All rights reserved.
        </p>

        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link to="/contact" className="hover:text-primary">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
