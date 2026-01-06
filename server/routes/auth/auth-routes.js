const express = require("express");

const { loginUser, registerUser, logoutUser, authMiddleware } = require('../../controllers/auth/auth-controller');


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  res.status(200).json({ success: true, message: "Authenticated", user: req.user });
});


module.exports = router;