const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import routes
const authRouter = require("./routes/auth/auth-routes");
const adminProductRoutes = require("./routes/admin/product-routes");
const shopProductsRoutes = require("./routes/shop/products-routes");
const shopCartRoutes = require("./routes/shop/cart-routes");
const shopAddressRoutes = require("./routes/shop/address-routes");
const shopSearchRoutes = require("./routes/shop/search-routes");
const shopWishlistRoutes = require("./routes/shop/wishlist-routes");
const shopOrderRoutes = require("./routes/shop/order-routes");

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(helmet());

// CORS configuration - IMPORTANT: Allow Paystack redirects
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "https://checkout.paystack.com", // Allow Paystack checkout
      "https://standard.paystack.com"  // Allow Paystack redirect
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    exposedHeaders: ['Set-Cookie'] // Expose cookies for cross-origin
  })
);

// Rate limit configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  },
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
});

app.use("/api", limiter);

// Body parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- DATABASE -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/shop/products", shopProductsRoutes);
app.use("/api/shop/cart", shopCartRoutes);
app.use("/api/shop/address", shopAddressRoutes);
app.use("/api/shop/search", shopSearchRoutes);
app.use("/api/shop/wishlist", shopWishlistRoutes);
app.use("/api/shop/orders", shopOrderRoutes);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "API running...",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Server Error" 
  });
});

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Rate limit: 500 requests per 15 minutes`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
});