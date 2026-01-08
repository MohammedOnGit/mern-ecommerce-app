const express = require("express");
const { 
  loginUser, 
  registerUser, 
  logoutUser, 
  authMiddleware,
  getCurrentUser,
  refreshAccessToken 
} = require('../../controllers/auth/auth-controller');

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

// Protected routes (require authentication)
router.get("/check-auth", authMiddleware, getCurrentUser);
router.get("/me", authMiddleware, getCurrentUser); // Alternative endpoint

module.exports = router;