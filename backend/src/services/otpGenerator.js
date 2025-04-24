// services/otpGenerator.js
const crypto = require("crypto");

// Generate numeric OTP of specified length
exports.generateOTP = (length = 6) => {
  // Generate a random number and pad with leading zeros if needed
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

// Generate alphanumeric OTP (more secure)
exports.generateAlphanumericOTP = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
};

// Verify OTP (with expiry)
exports.verifyOTP = (storedOTP, providedOTP, expiryTime) => {
  // Check if OTP has expired
  if (Date.now() > expiryTime) {
    return {
      valid: false,
      message: "OTP has expired",
    };
  }

  // Check if OTP matches
  if (storedOTP !== providedOTP) {
    return {
      valid: false,
      message: "Invalid OTP",
    };
  }

  return {
    valid: true,
    message: "OTP verified successfully",
  };
};

// Generate OTP with expiry time
exports.generateOTPWithExpiry = (length = 6, expiryMinutes = 10) => {
  const otp = exports.generateOTP(length);
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;

  return {
    otp,
    expiryTime,
  };
};
