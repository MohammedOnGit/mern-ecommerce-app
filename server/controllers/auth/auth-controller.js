const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// ------------------ TOKEN HELPERS ------------------ //
const generateTokens = (userId, userRole) => {
  const accessToken = jwt.sign(
    { 
      id: userId, 
      role: userRole,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: "60m" }
  );

  const refreshToken = jwt.sign(
    { 
      id: userId, 
      role: userRole,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie (short-lived)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 60 minutes
  });
  
  // Set refresh token cookie (long-lived)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ------------------ AUTH CONTROLLERS ------------------ //

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    
    // Validate input
    if (!userName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username, email and password are required" 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({ 
      userName, 
      email, 
      password: hashedPassword,
      role: "customer" // Default role
    });
    
    await user.save();

    // Generate tokens for immediate login after registration
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully",
      token: accessToken, // Also send in response for frontend storage
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    setCookies(res, accessToken, refreshToken);

    // Return response
    res.json({
      success: true,
      message: "Login successful",
      token: accessToken, // For localStorage
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  try {
    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error during logout" 
    });
  }
};

// Refresh access token
exports.refreshAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: "No refresh token provided" 
      });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err || decoded.type !== 'refresh') {
        return res.status(403).json({ 
          success: false, 
          message: "Invalid refresh token" 
        });
      }

      try {
        // Verify user still exists
        const user = await User.findById(decoded.id).select("role");
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            message: "User not found" 
          });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
          decoded.id,
          user.role
        );

        setCookies(res, accessToken, newRefreshToken);

        res.json({ 
          success: true, 
          message: "Token refreshed",
          token: accessToken 
        });
      } catch (dbError) {
        console.error("Database error during token refresh:", dbError);
        res.status(500).json({ 
          success: false, 
          message: "Server error. Please try again." 
        });
      }
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};

// Authentication middleware
exports.authMiddleware = (req, res, next) => {
  try {
    // Check for token in cookies first, then Authorization header
    let token = req.cookies.accessToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: No token provided" 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err || decoded.type !== 'access') {
        return res.status(403).json({ 
          success: false, 
          message: "Invalid or expired token" 
        });
      }
      
      try {
        // Fetch user from database
        const user = await User.findById(decoded.id).select("-password -__v");
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            message: "User not found" 
          });
        }
        
        // Attach user info to request
        req.user = {
          id: user._id,
          userName: user.userName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        };
        
        next();
      } catch (dbError) {
        console.error("Database error in auth middleware:", dbError);
        return res.status(500).json({ 
          success: false, 
          message: "Server error" 
        });
      }
    });
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Get current user (for auth check)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user should already be populated by authMiddleware
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Authenticated", 
      user: req.user 
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Alternative: Get user details (more detailed)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -__v")
      .populate('wishlist cart addresses'); // Example of populated fields if you have them
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        // Add additional fields as needed
        // wishlist: user.wishlist,
        // cart: user.cart,
        // addresses: user.addresses
      }
    });
  } catch (err) {
    console.error("Get user details error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again." 
    });
  }
};