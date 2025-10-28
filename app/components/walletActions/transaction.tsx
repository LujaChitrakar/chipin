import { RPC_URL } from "@/constants/WalletConfig";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import {
  TransactionMessage,
  PublicKey,
  VersionedTransaction,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";

// This function prepares and signs a sponsored transaction
async function prepareSponsoredTransaction(
  instructions: TransactionInstruction[],
  feePayerAddress: string | PublicKey
) {
  // Get the embedded wallet
  const { wallets } = useEmbeddedSolanaWallet();
  const embeddedWallet = wallets?.[0];

  if (!embeddedWallet?.getProvider) {
    throw new Error("No embedded wallet found");
  }
  // Create a connection to Solana
  const connection = new Connection(RPC_URL);
  const { blockhash } = await connection.getLatestBlockhash();

  // Create the transaction message with fee payer set to the backend wallet
  const message = new TransactionMessage({
    payerKey: new PublicKey(feePayerAddress),
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  // Create transaction
  const transaction = new VersionedTransaction(message);

  // Serialize message for signing
  const serializedMessage = Buffer.from(
    transaction.message.serialize()
  ).toString("base64");

  // Get provider and sign
  const provider = await embeddedWallet.getProvider();
  const { signature: serializedUserSignature } = await provider.request({
    method: "signMessage",
    params: {
      message: serializedMessage,
    },
  });

  // Add user signature to transaction
  const userSignature = Buffer.from(serializedUserSignature, "base64");
  transaction.addSignature(
    new PublicKey(embeddedWallet.address),
    userSignature
  );

  // Serialize the transaction to send to backend
  const serializedTransaction = Buffer.from(transaction.serialize()).toString(
    "base64"
  );

  // Send to your backend
  const response = await fetch("your-backend-endpoint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transaction: serializedTransaction }),
  });

  const { transactionHash } = await response.json();
  return transactionHash;
}
