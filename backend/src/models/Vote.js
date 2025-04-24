// models/Vote.js
const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  candidateId: {
    type: Number,
    required: true,
  },
  blockchainId: {
    type: String,
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one vote per user
VoteSchema.index({ voter: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);
