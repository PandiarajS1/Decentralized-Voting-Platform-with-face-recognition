// middleware/faceRecognition.js
const faceDataConverter = require("../utils/faceDataConverter");
const User = require("../models/User");
const Admin = require("../models/Admin");

exports.processFaceData = async (req, res, next) => {
  try {
    if (
      !req.body.faceFrames ||
      !Array.isArray(req.body.faceFrames) ||
      req.body.faceFrames.length < 10
    ) {
      return res.status(400).json({
        success: false,
        message: "At least 10 face frames are required for registration",
      });
    }

    if (!req.body.aadharNumber) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number is required for face data processing",
      });
    }

    // Process face frames to extract features
    const processedFaceData =
      await faceDataConverter.convertFaceFramesToFeatures(req.body.faceFrames);

    // Map with Aadhar number using mathematical expression
    const faceDataHash = faceDataConverter.mapWithAadhar(
      processedFaceData,
      req.body.aadharNumber
    );

    // Add processed face data to the request
    req.faceData = faceDataHash;
    next();
  } catch (error) {
    console.error("Face processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Face processing failed",
      error: error.message,
    });
  }
};

exports.verifyFace = async (req, res, next) => {
  try {
    if (!req.body.faceFrames || !Array.isArray(req.body.faceFrames)) {
      return res.status(400).json({
        success: false,
        message: "Face data required for verification",
      });
    }

    if (!req.body.email && !req.body.aadharNumber) {
      return res.status(400).json({
        success: false,
        message: "Email or Aadhar number is required for verification",
      });
    }

    // Find user by email or Aadhar
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { aadharNumber: req.body.aadharNumber }],
    });

    // If no user found, check if this is an admin
    let isAdmin = false;
    let entity = user;

    if (!entity) {
      const admin = await Admin.findOne({
        $or: [
          { email: req.body.email },
          { aadharNumber: req.body.aadharNumber },
        ],
      });

      if (admin) {
        isAdmin = true;
        entity = admin;
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    // Process login face data
    const processedFaceData =
      await faceDataConverter.convertFaceFramesToFeatures(req.body.faceFrames);
    processedFaceData.aadharNumber = entity.aadharNumber;

    // Compare with stored face data
    const isFaceMatch = await faceDataConverter.compareFaceData(
      processedFaceData,
      entity.faceData
    );

    if (!isFaceMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Face verification failed. Please try again with better lighting and positioning.",
      });
    }

    // If verification passes, add entity to request
    if (isAdmin) {
      req.verifiedAdmin = entity;
    } else {
      req.verifiedUser = entity;
    }

    next();
  } catch (error) {
    console.error("Face verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Face verification failed",
      error: error.message,
    });
  }
};
