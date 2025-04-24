import { useEffect, useState } from "react";
import Web3 from "web3";
import {
  TextRevealCard,
  TextRevealCardDescription,
  TextRevealCardTitle,
} from "../ui/text-reveal-card";
import { AnimatedListDemo } from "./notificationflow";

export const VoteHeadBlockId = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");

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
        } catch (error) {
          console.error("Error initializing blockchain connection", error);
        }
      } else {
        console.error("Ethereum provider not found. Please install MetaMask.");
      }
    };

    initBlockchain();
  }, []);
  return (
    <div>
      <TextRevealCard
        text="Your Blockchain ID"
        revealText={account || "Not connected"}
      >
        <TextRevealCardTitle>Your Connected Account</TextRevealCardTitle>
        <TextRevealCardDescription>blockchain secret</TextRevealCardDescription>
      </TextRevealCard>
    </div>
  );
};

export const VoteHeadInstruct = () => {
  return (
    <div className="flex w-full overflow-hidden">
      <AnimatedListDemo />
    </div>
  );
};
