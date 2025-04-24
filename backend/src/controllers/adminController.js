// controllers/adminController.js
const User = require("../models/User");
const blockchainService = require("../services/blockchainService");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -faceData");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign blockchain ID to user
exports.assignBlockchainId = async (req, res) => {
  try {
    const { userId, blockchainId } = req.body;

    // Validate blockchain ID with your blockchain service
    const isValidBlockchainId = await blockchainService.validateBlockchainId(
      blockchainId
    );

    if (!isValidBlockchainId) {
      return res.status(400).json({
        success: false,
        message: "Invalid blockchain ID",
      });
    }

    // Update user with blockchain ID
    const user = await User.findByIdAndUpdate(
      userId,
      { blockchainId },
      { new: true }
    ).select("-password -faceData");

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

// Get voting statistics
exports.getVotingStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get verified users count
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Get users with blockchain ID count
    const usersWithBlockchainId = await User.countDocuments({
      blockchainId: { $ne: null },
    });

    // Get voted users count
    const votedUsers = await User.countDocuments({ hasVoted: true });

    // Get blockchain stats from your blockchain service
    const blockchainStats = " ";
    // await blockchainService.getVotingStats();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        usersWithBlockchainId,
        votedUsers,
        blockchainStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
