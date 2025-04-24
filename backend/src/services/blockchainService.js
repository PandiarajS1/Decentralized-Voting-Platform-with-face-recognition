// services/blockchainService.js
const Web3 = require("web3");
const VotingContractABI =
  require("../../../blockchain/build/contracts/Election.json").abi;

// Connect to local blockchain (Ganache)
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

// Contract address (from your deployed contract)
const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;

// Create contract instance
const votingContract = new web3.eth.Contract(
  VotingContractABI,
  contractAddress
);

// Validate blockchain ID
exports.validateBlockchainId = async (blockchainId) => {
  try {
    // Check if address is valid
    if (!web3.utils.isAddress(blockchainId)) {
      return false;
    }

    // Check if address has balance (optional)
    const balance = await web3.eth.getBalance(blockchainId);
    return parseInt(balance) > 0;
  } catch (error) {
    console.error("Blockchain ID validation error:", error);
    return false;
  }
};

// Get voting stats from blockchain
exports.getVotingStats = async () => {
  try {
    // Call your contract method to get voting stats
    // This depends on your specific contract implementation
    const totalVotes = await votingContract.methods.getTotalVotes().call();
    const candidates = await votingContract.methods.getCandidatesCount().call();

    // Get votes per candidate
    const candidateStats = [];
    for (let i = 1; i <= candidates; i++) {
      const candidate = await votingContract.methods
        .getCandidateDetails(i)
        .call();
      candidateStats.push({
        id: i,
        name: candidate.name,
        votes: candidate.voteCount,
      });
    }

    return {
      totalVotes,
      candidates: candidateStats,
    };
  } catch (error) {
    console.error("Error getting blockchain stats:", error);
    return {
      totalVotes: 0,
      candidates: [],
    };
  }
};

// Record vote on blockchain
exports.recordVote = async (candidateId, voterAddress) => {
  try {
    // Get admin address (first account from Ganache)
    const accounts = await web3.eth.getAccounts();
    const adminAddress = accounts[0];

    // Call vote function from contract
    const result = await votingContract.methods
      .vote(candidateId)
      .send({ from: voterAddress, gas: 3000000 });

    return {
      success: true,
      transactionHash: result.transactionHash,
    };
  } catch (error) {
    console.error("Error recording vote:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
