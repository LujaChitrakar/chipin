import * as multisig from "@sqds/multisig";
import { useMultisig } from "./useServices";
import { isMember } from "@/lib/utils";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { PublicKey } from "@solana/web3.js";

export const useAccess = () => {
  const { data: multisig } = useMultisig();
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];
  if (!wallet) throw new Error("Please connect your wallet.");

  const publicKey = new PublicKey(wallet.publicKey);
  if (!multisig || !publicKey) {
    return false;
  }
  // if the pubkeyKey is in members return true
  const memberExists = isMember(publicKey, multisig.members);
  // return true if found
  return !!memberExists;
};
