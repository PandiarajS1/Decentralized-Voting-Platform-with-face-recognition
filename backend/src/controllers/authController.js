// controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const emailService = require("../services/emailService");
const otpGenerator = require("../services/otpGenerator");
const smsService = require("../services/smsService");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, mobileNumber, aadharNumber, voterId } =
      req.body;

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, { aadharNumber }, { voterId }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email, Aadhar, or Voter ID",
      });
    }

    // Get face data from middleware
    const faceData = req.faceData;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      mobileNumber,
      aadharNumber,
      voterId,
      faceData,
    });

    // Generate OTP
    const { otp, expiryTime } = otpGenerator.generateOTPWithExpiry(6, 10);

    // Store OTP in session or Redis for verification
    // For simplicity, I'll use a timeout to simulate OTP expiry
    req.session = req.session || {};
    req.session[email] = {
      otp,
      expires: expiryTime, // 10 minutes
    };

    console.log("Session after storing OTP:", req.session);

    // Send OTP via email
    const emailResult = await emailService.sendOTP(email, otp);

    // Alternatively, send OTP via SMS
    // await smsService.sendOTP(mobileNumber, otp);
    const token = generateToken(user._id, "user");

    res.status(201).json({
      success: true,
      message: "User registered. Please verify with OTP sent to your email.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        aadharNumber: user.aadharNumber,
        voterId: user.voterId,
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified,
        blockchainId: user.blockchainId,
        hasVoted: user.hasVoted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Session before response:", req.session);

    // Check if OTP exists
    if (!req.session || !req.session[email]) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this email" });
    }

    // Verify OTP
    const verification = otpGenerator.verifyOTP(
      req.session[email].otp.toString(),
      otp.toString(),
      req.session[email].expires
    );

    if (!verification.valid) {
      return res
        .status(400)
        .json({ success: false, message: verification.message });
    }

    // Update user verification status
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Clear OTP session
    delete req.session[email];

    // Generate token
    const token = generateToken(user._id, "user");

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        blockchainId: user.blockchainId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User login with face verification
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Face verification happens in middleware
    // If it passes, req.verifiedUser will be set
    const user = req.verifiedUser;

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if user is verified via OTP
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your account with OTP first",
      });
    }

    // Generate OTP
    const { otp, expiryTime } = otpGenerator.generateOTPWithExpiry(6, 10);

    // Store OTP in session or Redis for verification
    // For simplicity, I'll use a timeout to simulate OTP expiry
    req.session = req.session || {};
    req.session[email] = {
      otp,
      expires: expiryTime, // 10 minutes
    };

    console.log("Session after storing OTP:", req.session);

    // Send OTP via email
    const emailResult = await emailService.sendOTP(email, otp);

    // Generate token
    const token = generateToken(user._id, "user");

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        aadharNumber: user.aadharNumber,
        voterId: user.voterId,
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified,
        blockchainId: user.blockchainId,
        hasVoted: user.hasVoted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin registration (similar to user registration)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, mobileNumber, aadharNumber } = req.body;

    const adminExists = await Admin.findOne({
      $or: [{ email }, { aadharNumber }],
    });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email or Aadhar",
      });
    }

    // Get face data from middleware
    const faceData = req.faceData;

    const admin = await Admin.create({
      name,
      email,
      password,
      mobileNumber,
      aadharNumber,
      faceData,
    });

    // Generate OTP for verification
    // (similar to user OTP process)
    const { otp, expiryTime } = otpGenerator.generateOTPWithExpiry(6, 10);

    // Store OTP in session or Redis for verification
    // For simplicity, I'll use a timeout to simulate OTP expiry
    req.session = req.session || {};
    req.session[email] = {
      otp,
      expires: expiryTime, // 10 minutes
    };

    console.log("Session after storing OTP:", req.session);

    // Send OTP via email
    const emailResult = await emailService.sendOTP(email, otp);

    // Alternatively, send OTP via SMS
    // await smsService.sendOTP(mobileNumber, otp);

    res.status(201).json({
      success: true,
      message: "Admin registered. Please verify with OTP.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Face verification happens in middleware
    // If it passes, req.verifiedAdmin will be set
    const admin = req.verifiedAdmin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Face verification failed or admin not found",
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(admin._id, "admin");

    res.status(200).json({
      success: true,
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isVerified: admin.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin verify OTP
exports.verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists
    if (!req.session || !req.session[email]) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email",
      });
    }

    // Verify OTP using the service
    const verification = otpGenerator.verifyOTP(
      req.session[email].otp.toString(),
      otp.toString(),
      req.session[email].expires
    );

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    // Update admin verification status
    const admin = await Admin.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Clear OTP session
    delete req.session[email];

    // Generate token
    const token = generateToken(admin._id, "admin");

    res.status(200).json({
      success: true,
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isVerified: admin.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
