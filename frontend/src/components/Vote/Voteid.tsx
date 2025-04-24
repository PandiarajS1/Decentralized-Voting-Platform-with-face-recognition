// // // import { useEffect, useState } from "react";
// // // import {
// // //   initWeb3,
// // //   loadBlockchainData,
// // //   getAccounts,
// // //   castVote,
// // //   listenForEvents,
// // // } from "../../utils/contracts";

// // // const Voteid = () => {
// // //   const [account, setAccount] = useState<string>("");
// // //   const [candidates, setCandidates] = useState<any[]>([]);
// // //   const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
// // //     null
// // //   );
// // //   const [message, setMessage] = useState<string>("");

// // //   useEffect(() => {
// // //     const loadData = async () => {
// // //       try {
// // //         await initWeb3();
// // //         await loadBlockchainData();
// // //         const accounts = getAccounts();
// // //         setAccount(accounts[0]);
// // //       } catch (error) {
// // //         console.error("Error loading blockchain data:", error);
// // //       }
// // //     };

// // //     loadData();
// // //   }, []);

// // //   useEffect(() => {
// // //     listenForEvents((event) => {
// // //       console.log("Vote Event:", event);
// // //       setMessage(
// // //         `New vote received for candidate ID ${event.returnValues._candidateId}`
// // //       );
// // //     });
// // //   }, []);

// // //   const handleVote = async () => {
// // //     if (selectedCandidate === null) return;
// // //     try {
// // //       await castVote(selectedCandidate);
// // //       setMessage("Vote cast successfully!");
// // //     } catch (error) {
// // //       console.error("Voting error:", error);
// // //       setMessage("Failed to cast vote.");
// // //     }
// // //   };

// // //   return (
// // //     <div className="p-5">
// // //       <h1 className="text-2xl font-bold mb-4">Blockchain Voting System</h1>
// // //       <p>
// // //         <strong>Account:</strong> {account || "Not connected"}
// // //       </p>

// // //       <div className="mt-4">
// // //         <h2 className="text-lg font-semibold">Candidates</h2>
// // //         <ul>
// // //           {candidates.map((candidate) => (
// // //             <li key={candidate.id} className="mb-2">
// // //               <input
// // //                 type="radio"
// // //                 name="candidate"
// // //                 value={candidate.id}
// // //                 onChange={() => setSelectedCandidate(candidate.id)}
// // //               />
// // //               {candidate.name} - {candidate.party} (Votes: {candidate.voteCount}
// // //               )
// // //             </li>
// // //           ))}
// // //         </ul>
// // //       </div>

// // //       <button
// // //         onClick={handleVote}
// // //         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
// // //       >
// // //         Vote
// // //       </button>

// // //       {message && <p className="mt-4 text-green-500">{message}</p>}
// // //     </div>
// // //   );
// // // };

// // // export default Voteid;

// // import { useEffect, useState } from "react";
// // import {
// //   initWeb3,
// //   loadBlockchainData,
// //   getAccounts,
// //   castVote,
// //   listenForEvents,
// //   getCandidates, // We'll implement this below
// // } from "../../utils/contracts";

// // const Voteid = () => {
// //   const [account, setAccount] = useState<string>("");
// //   const [candidates, setCandidates] = useState<any[]>([]);
// //   const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
// //     null
// //   );
// //   const [message, setMessage] = useState<string>("");

// //   useEffect(() => {
// //     const loadData = async () => {
// //       try {
// //         await initWeb3();
// //         await loadBlockchainData();
// //         const accounts = await getAccounts(); // Ensure async fetching
// //         if (accounts.length > 0) {
// //           setAccount(accounts[0]);
// //         } else {
// //           console.error("No accounts found.");
// //         }

// //         const candidateList = await getCandidates();
// //         setCandidates(candidateList);
// //       } catch (error) {
// //         console.error("Error loading blockchain data:", error);
// //       }
// //     };

// //     loadData();
// //   }, []);

// //   useEffect(() => {
// //     listenForEvents((event) => {
// //       console.log("Vote Event:", event);
// //       setMessage(
// //         `New vote received for candidate ID ${event.returnValues._candidateId}`
// //       );
// //     });
// //   }, []);

// //   const handleVote = async () => {
// //     if (selectedCandidate === null) return;
// //     try {
// //       await castVote(selectedCandidate);
// //       setMessage("Vote cast successfully!");
// //     } catch (error) {
// //       console.error("Voting error:", error);
// //       setMessage("Failed to cast vote.");
// //     }
// //   };

// //   return (
// //     <div className="p-5">
// //       <h1 className="text-2xl font-bold mb-4">Blockchain Voting System</h1>
// //       <p>
// //         <strong>Account:</strong> {account || "Not connected"}
// //       </p>

// //       <div className="mt-4">
// //         <h2 className="text-lg font-semibold">Candidates</h2>
// //         <ul>
// //           {candidates.length > 0 ? (
// //             candidates.map((candidate) => (
// //               <li key={candidate.id} className="mb-2">
// //                 <input
// //                   type="radio"
// //                   name="candidate"
// //                   value={candidate.id}
// //                   onChange={() => setSelectedCandidate(candidate.id)}
// //                 />
// //                 {candidate.name} - {candidate.party} (Votes:{" "}
// //                 {candidate.voteCount})
// //               </li>
// //             ))
// //           ) : (
// //             <p>No candidates available.</p>
// //           )}
// //         </ul>
// //       </div>

// //       <button
// //         onClick={handleVote}
// //         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
// //       >
// //         Vote
// //       </button>

// //       {message && <p className="mt-4 text-green-500">{message}</p>}
// //     </div>
// //   );
// // };

// // export default Voteid;

// import { useEffect, useState } from "react";
// import Web3 from "web3";
// import ElectionContract from "../../../../blockchain/build/contracts/Election.json";

// const VotePage = () => {
//   const [web3, setWeb3] = useState<Web3 | null>(null);
//   const [account, setAccount] = useState<string>("");
//   const [contract, setContract] = useState<any>(null);
//   const [candidates, setCandidates] = useState<any[]>([]);
//   const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
//     null
//   );
//   const [message, setMessage] = useState<string>("");

//   useEffect(() => {
//     const initBlockchain = async () => {
//       if ((window as any).ethereum) {
//         try {
//           const web3Instance = new Web3((window as any).ethereum);
//           await (window as any).ethereum.request({
//             method: "eth_requestAccounts",
//           });

//           setWeb3(web3Instance);

//           const accounts = await web3Instance.eth.getAccounts();
//           if (accounts.length > 0) {
//             setAccount(accounts[0]);
//           } else {
//             console.error("No accounts found");
//           }

//           const networkId = await web3Instance.eth.net.getId();
//           const deployedNetwork = (ElectionContract.networks as any)[networkId];

//           if (!deployedNetwork) {
//             console.error("Smart contract not deployed on this network.");
//             return;
//           }

//           const electionInstance = new web3Instance.eth.Contract(
//             ElectionContract.abi,
//             deployedNetwork.address
//           );

//           setContract(electionInstance);
//           loadCandidates(electionInstance);
//         } catch (error) {
//           console.error("Error initializing blockchain connection", error);
//         }
//       } else {
//         console.error("Ethereum provider not found. Please install MetaMask.");
//       }
//     };

//     const loadCandidates = async (electionInstance: any) => {
//       try {
//         const candidatesCount = await electionInstance.methods
//           .candidatesCount()
//           .call();
//         const candidateList = [];

//         for (let i = 1; i <= candidatesCount; i++) {
//           const candidate = await electionInstance.methods.candidates(i).call();
//           candidateList.push({
//             id: candidate[0],
//             name: candidate[1],
//             party: candidate[2],
//             voteCount: candidate[3],
//           });
//         }

//         setCandidates(candidateList);
//       } catch (error) {
//         console.error("Error loading candidates", error);
//       }
//     };

//     initBlockchain();
//   }, []);

//   const handleVote = async () => {
//     if (!contract || selectedCandidate === null) return;

//     try {
//       await contract.methods.vote(selectedCandidate).send({ from: account });
//       setMessage("Vote cast successfully!");
//     } catch (error) {
//       console.error("Error casting vote:", error);
//       setMessage("Failed to cast vote.");
//     }
//   };

//   return (
//     <div className="p-5">
//       <h1 className="text-2xl font-bold mb-4">Blockchain Voting System</h1>
//       <p>
//         <strong>Connected Account:</strong> {account || "Not connected"}
//       </p>

//       <div className="mt-4">
//         <h2 className="text-lg font-semibold">Candidates</h2>
//         <ul>
//           {candidates.map((candidate) => (
//             <li key={candidate.id} className="mb-2">
//               <input
//                 type="radio"
//                 name="candidate"
//                 value={candidate.id}
//                 onChange={() => setSelectedCandidate(candidate.id)}
//               />
//               {candidate.name} - {candidate.party} (Votes: {candidate.voteCount}
//               )
//             </li>
//           ))}
//         </ul>
//       </div>

//       <button
//         onClick={handleVote}
//         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//       >
//         Vote
//       </button>

//       {message && <p className="mt-4 text-green-500">{message}</p>}
//     </div>
//   );
// };

// export default VotePage;

// import { cn } from "@/lib/utils";
// import { AnimatedGridPattern } from "../magicui/animated-grid-pattern";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import VoteBody from "./VoteBody";
// import {
//   IconClipboardCopy,
//   IconFileBroken,
//   IconSignature,
// } from "@tabler/icons-react";
import { VoteHeadBlockId, VoteHeadInstruct } from "./VoteHead";

const VotePage = () => {
  return (
    <div className="relative flex flex-col h-[100vh] w-[full] items-center justify-center overflow-hidden rounded-lg bg-background p-20">
      {/* <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      /> */}

      <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            className={item.className}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </div>
  );
};

export default VotePage;

const items = [
  {
    title: "",
    description: "",
    header: <VoteHeadBlockId />,
    className: "sm:hidden md:block",
    icon: "",
  },

  {
    title: "",
    description: "",
    header: <VoteBody />,
    className: "md:row-span-2",
    icon: "",
  },
  {
    title: "",
    description: "",
    header: <VoteHeadInstruct />,
    className: "sm:hidden md:block",
    icon: "",
  },
];
