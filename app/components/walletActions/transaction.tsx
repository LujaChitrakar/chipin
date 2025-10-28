import { RPC_URL } from "@/constants/WalletConfig";
import {
  TransactionMessage,
  PublicKey,
  VersionedTransaction,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";

// This function prepares and signs a sponsored transaction
export async function prepareSponsoredTransaction(
  provider: any,
  userPublickey: string | PublicKey,
  instructions: TransactionInstruction[],
  feePayerAddress: string | PublicKey
) {
  // Get the embedded wallet
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
  const serializeTx = Buffer.from(transaction.serialize()).toString("base64");

  // Get provider and sign
  const { signature: userSignatureBase64 } = await provider.request({
    method: "signTransaction",
    params: {
      transaction: serializeTx,
    },
  });

  return userSignatureBase64;
}
