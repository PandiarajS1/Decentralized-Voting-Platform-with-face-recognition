import { useEffect, useState } from "react";
import Web3 from "web3";
import { InteractiveHoverButton } from "../magicui/interactive-hover-button";
import ElectionContract from "../../../../blockchain/build/contracts/Election.json";
import { AlertCircle, ThumbsUp, Vote } from "lucide-react";
// import { FollowerPointerCard } from "../ui/following-pointer";

const VoteBody = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const initBlockchain = async () => {
      if ((window as any).ethereum) {
        try {
          const web3Instance = new Web3((window as any).ethereum);
          await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });

          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            console.error("No accounts found");
          }

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = (ElectionContract.networks as any)[
            networkId.toString()
          ];

          if (!deployedNetwork) {
            console.error("Smart contract not deployed on this network.");
            return;
          }

          const electionInstance = new web3Instance.eth.Contract(
            ElectionContract.abi,
            deployedNetwork.address
          );

          setContract(electionInstance);
          loadCandidates(electionInstance);
        } catch (error) {
          console.error("Error initializing blockchain connection", error);
        }
      } else {
        console.error("Ethereum provider not found. Please install MetaMask.");
      }
    };

    const loadCandidates = async (electionInstance: any) => {
      try {
        const candidatesCount = await electionInstance.methods
          .candidatesCount()
          .call();
        const candidateList = [];
        let totalVotesCount = 0;

        for (let i = 1; i <= candidatesCount; i++) {
          const candidate = await electionInstance.methods.candidates(i).call();
          candidateList.push({
            id: candidate[0],
            name: candidate[1],
            party: candidate[2],
            voteCount: candidate[3],
          });
          totalVotesCount += parseInt(candidate[3]);
        }

        setCandidates(candidateList);
        setTotalVotes(totalVotesCount);
      } catch (error) {
        console.error("Error loading candidates", error);
      }
    };

    initBlockchain();
  }, []);

  const handleVote = async () => {
    if (!contract || selectedCandidate === null) return;

    try {
      await contract.methods.vote(selectedCandidate).send({ from: account });
      setMessage("Vote cast successfully!");
    } catch (error) {
      console.error("Error casting vote:", error);
      setMessage("Failed to cast vote.");
    }
  };

  return (
    <div>
      {/* <FollowerPointerCard
        title={<TitleComponent title={blogContent.content} />}
      > */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-3">Candidates</h2>
        <div className="w-full">
          <ul>
            {candidates.map((candidate) => (
              <li key={candidate.id} className="mb-2">
                <div className="flex justify-between p-4 hover:bg-secondary border rounded-md">
                  <label htmlFor={candidate.id}>
                    {candidate.name} - {candidate.party}
                  </label>
                  <input
                    className="scale-150 accent-slate-800"
                    type="radio"
                    name="candidate"
                    id={candidate.id}
                    value={candidate.id}
                    onChange={() => setSelectedCandidate(candidate.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <h2 className="mt-4 text-lg font-semibold">
          Total Votes Cast: {totalVotes}
        </h2>

        <button onClick={handleVote}>
          <InteractiveHoverButton>caste Vote</InteractiveHoverButton>
        </button>
      </div>

      {message && message == "Failed to cast vote." && (
        <p className="flex mt-4 text-red-700">
          <AlertCircle /> {message}
        </p>
      )}

      {message && message == "Vote cast successfully!" && (
        <p className="flex mt-4 text-green-400">
          <ThumbsUp /> {message}
        </p>
      )}
      {/* </FollowerPointerCard> */}
    </div>
  );
};

export default VoteBody;

// const blogContent = {
//   content: "cast vote",
// };

// const TitleComponent = ({ title }: { title: string }) => (
//   <div className="flex items-center space-x-2">
//     <Vote />
//     <p>{title}</p>
// //   </div>
// );
