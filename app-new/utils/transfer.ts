import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { RPC_URL, USDC_MINT } from "@/constants/WalletConfig";
import { prepareSponsoredTransaction } from "@/components/walletActions/transaction";
import { apiBaseUrl } from "@/services/api/apiConstants";

const FEE_PAYER_ADDRESS = "3SzstxZg8JafeitfvCqC9f1Ku9VRYk9SfKtPfp8kZghF"; // Your backend wallet address
const BACKEND_URL = apiBaseUrl;

export async function transferUSDC(
  provider: any,
  fromPubkey: string,
  toPubkey: string,
  amount: number
) {
  const connection = new Connection(RPC_URL);
  const fromKey = new PublicKey(fromPubkey);
  const toKey = new PublicKey(toPubkey);

  // Get ATA
  const fromATA = await getAssociatedTokenAddress(USDC_MINT, fromKey);
  const toATA = await getAssociatedTokenAddress(USDC_MINT, toKey);

  const instructions = [];

  const toAccountInfo = await connection.getAccountInfo(toATA);
  if (!toAccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(fromKey, toATA, toKey, USDC_MINT)
    );
  }

  const amountInUnits = amount * 10 ** 6;
  instructions.push(
    createTransferInstruction(fromATA, toATA, fromKey, amountInUnits)
  );

  const signedTransaction = await prepareSponsoredTransaction(
    provider,
    fromPubkey,
    instructions,
    FEE_PAYER_ADDRESS
  );

  const response = await fetch(`${BACKEND_URL}/sponsor-transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction: signedTransaction,
      userPublicKey: fromPubkey,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send transaction");
  }

  const { transactionHash } = await response.json();
  return transactionHash;
}
