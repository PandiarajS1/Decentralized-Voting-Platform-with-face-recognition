// import Web3 from "web3";
// import web3 from "./web3";
// import ElectionArtifact from "../../../blockchain/build/contracts/Election.json";

// declare global {
//   interface Window {
//     ethereum?: any;
//     web3?: any;
//   }
// }

// interface Candidate {
//   id: number;
//   name: string;
//   party: string;
//   votes: number;
// }

// interface VotedEvent {
//   _candidateId: string;
// }

// let electionInstance: any = null;

// // Initialize Web3 & Contract
// export const initWeb3 = async (): Promise<any> => {
//   try {
//     // Request account access
//     await window.ethereum.request({ method: "eth_requestAccounts" });

//     // Get network ID & contract address
//     const networkId = await web3.eth.net.getId();
//     const deployedNetwork = ElectionArtifact.networks[networkId];

//     if (!deployedNetwork) {
//       throw new Error("Contract not deployed on this network!");
//     }

//     // Create contract instance
//     electionInstance = new web3.eth.Contract(
//       ElectionArtifact.abi,
//       deployedNetwork.address
//     );

//     console.log("Contract loaded at:", deployedNetwork.address);
//     return electionInstance;
//   } catch (error) {
//     console.error("Web3 initialization error:", error);
//   }
// };

// // Load connected account
// export const loadAccount = async (): Promise<string> => {
//   const accounts = await web3.eth.getAccounts();
//   return accounts[0]; // Return first account
// };

// // Load candidate data
// export const loadCandidates = async (): Promise<Candidate[]> => {
//   if (!electionInstance) await initWeb3();

//   const candidatesCount = await electionInstance.methods
//     .candidatesCount()
//     .call();
//   const candidates: Candidate[] = [];

//   for (let i = 1; i <= candidatesCount; i++) {
//     const candidate = await electionInstance.methods.candidates(i).call();
//     candidates.push({
//       id: Number(candidate[0]),
//       name: candidate[1],
//       party: candidate[2],
//       votes: Number(candidate[3]),
//     });
//   }
//   return candidates;
// };

// // Cast a vote
// export const castVote = async (candidateId: number): Promise<void> => {
//   const account = await loadAccount();
//   if (!electionInstance) await initWeb3();

//   await electionInstance.methods.vote(candidateId).send({ from: account });

//   console.log(`Vote casted for candidate ${candidateId}`);
// };

// // Listen for vote events
// export const listenForEvents = async (
//   callback: (event: VotedEvent) => void
// ): Promise<void> => {
//   if (!electionInstance) await initWeb3();

//   electionInstance.events.votedEvent({}, (error: any, event: any) => {
//     if (!error) {
//       console.log("Vote event detected:", event);
//       callback(event.returnValues);
//     } else {
//       console.error("Error in event listener:", error);
//     }
//   });
// };

import Web3 from "web3";
import ElectionContract from "../../../blockchain/build/contracts/Election.json"; // Adjust path as needed

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

let web3: Web3;
let contract: any;
let accounts: string[] = [];

export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error("User denied account access", error);
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    console.warn("No Ethereum provider detected. Using fallback.");
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545")); // Ganache
  }
};

export const loadBlockchainData = async () => {
  if (!web3) await initWeb3();

  accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const networkData = (ElectionContract.networks as any)[networkId.toString()];

  if (networkData) {
    contract = new web3.eth.Contract(ElectionContract.abi, networkData.address);
  } else {
    console.error("Smart contract not deployed on this network.");
  }
};

export const getAccounts = (): string[] => accounts;

export const castVote = async (candidateId: number) => {
  if (!contract) await loadBlockchainData();
  return contract.methods.vote(candidateId).send({ from: accounts[0] });
};

export const listenForEvents = (callback: (event: any) => void) => {
  if (!contract) return;
  contract.events.votedEvent({}, (error: any, event: any) => {
    if (!error) callback(event);
  });
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%

export const getCandidates = async () => {
  if (!contract) await loadBlockchainData();
  const candidateCount = await contract.methods.candidatesCount().call();
  let candidates = [];

  for (let i = 1; i <= candidateCount; i++) {
    const candidate = await contract.methods.candidates(i).call();
    candidates.push({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      voteCount: candidate.voteCount,
    });
  }

  return candidates;
};
