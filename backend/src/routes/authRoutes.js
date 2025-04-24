// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyOTP,
  loginUser,
  registerAdmin,
  loginAdmin,
  verifyAdminOTP,
} = require("../controllers/authController");
const {
  processFaceData,
  verifyFace,
} = require("../middleware/faceRecognition");

// User routes
router.post("/register/user", processFaceData, registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login/user", verifyFace, loginUser);

// Admin routes
router.post("/register/admin", processFaceData, registerAdmin);
router.post("/login/admin", verifyFace, loginAdmin);
router.post("/verify-admin-otp", verifyAdminOTP);

module.exports = router;
