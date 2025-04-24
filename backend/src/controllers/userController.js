// controllers/userController.js
const User = require("../models/User");
const blockchainService = require("../services/blockchainService");

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // User is already attached to req from auth middleware
    const user = await User.findById(req.user._id).select(
      "-password -faceData"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, mobileNumber } = req.body;

    // Only allow updating certain fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, mobileNumber },
      { new: true, runValidators: true }
    ).select("-password -faceData");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cast vote
exports.castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const user = req.user;

    // Check if user has blockchain ID
    if (!user.blockchainId) {
      return res.status(400).json({
        success: false,
        message: "You need a blockchain ID assigned by admin to vote",
      });
    }

    // Check if user has already voted
    if (user.hasVoted) {
      return res.status(400).json({
        success: false,
        message: "You have already cast your vote",
      });
    }

    // Record vote on blockchain
    const result = await blockchainService.recordVote(
      candidateId,
      user.blockchainId
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to record vote on blockchain",
        error: result.error,
      });
    }

    // Update user record
    await User.findByIdAndUpdate(user._id, { hasVoted: true }, { new: true });

    res.status(200).json({
      success: true,
      message: "Vote successfully cast",
      transactionHash: result.transactionHash,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
