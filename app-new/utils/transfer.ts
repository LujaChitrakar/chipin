import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { RPC_URL, USDC_MINT } from "@/constants/WalletConfig";

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

  // Build transaction
  const tx = new Transaction().add(...instructions);
  tx.feePayer = fromKey;
  tx.recentBlockhash = (
    await connection.getLatestBlockhash('finalized')
  ).blockhash;

  const { signature } = await provider.request({
    method: 'signAndSendTransaction',
    params: { transaction: tx, connection },
  });

  return signature;
}
