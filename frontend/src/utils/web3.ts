import Web3 from "web3";

let web3: Web3;

if (typeof window !== "undefined" && (window as any).ethereum) {
  // Modern dapp browsers
  web3 = new Web3((window as any).ethereum);
  (window as any).ethereum.request({ method: "eth_requestAccounts" }); // Request wallet connection
} else {
  // Fallback: Use Infura or local provider
  const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545"); // Ganache
  web3 = new Web3(provider);
}

export default web3;
