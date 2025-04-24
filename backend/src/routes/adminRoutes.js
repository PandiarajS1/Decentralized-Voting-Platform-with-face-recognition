const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  assignBlockchainId,
  getVotingStats,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

router.get("/users", getAllUsers);
router.post("/assign-blockchain-id", assignBlockchainId);
router.get("/voting-stats", getVotingStats);

module.exports = router;
