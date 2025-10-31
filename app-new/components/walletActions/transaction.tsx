import { RPC_URL } from '@/constants/WalletConfig';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

export async function prepareSponsoredTransaction(
  provider: any,
  userPublicKey: string,
  instructions: TransactionInstruction[],
  feePayerAddress: string
) {
  const connection = new Connection(RPC_URL);

  // Use regular Transaction
  const transaction = new Transaction();

  // Add all instructions
  transaction.add(...instructions);

  // Set fee payer and blockhash
  transaction.feePayer = new PublicKey(feePayerAddress);
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash('finalized')
  ).blockhash;

  try {
    // Sign the transaction
    const { signedTransaction } = await provider.request({
      method: 'signTransaction',
      params: { transaction },
    });

    console.log('Signed transaction:', signedTransaction);

    // ✅ The signedTransaction is a plain object with signatures
    // We need to reconstruct it as a Transaction
    const tx = new Transaction();
    tx.recentBlockhash = signedTransaction.recentBlockhash;
    tx.feePayer = new PublicKey(signedTransaction.feePayer);

    // Add instructions back
    if (
      signedTransaction.instructions &&
      Array.isArray(signedTransaction.instructions)
    ) {
      signedTransaction.instructions.forEach((ix: any) => {
        tx.add(ix);
      });
    }

    // Add signatures
    if (
      signedTransaction.signatures &&
      Array.isArray(signedTransaction.signatures)
    ) {
      signedTransaction.signatures.forEach((sig: any) => {
        if (sig.signature) {
          tx.addSignature(
            new PublicKey(sig.publicKey),
            Buffer.from(sig.signature)
          );
        }
      });
    }

    // Serialize to base64
    const serialized = tx
      .serialize({
        requireAllSignatures: false, // Don't require fee payer signature yet
        verifySignatures: false, // Don't verify yet (fee payer hasn't signed)
      })
      .toString('base64');

    console.log('Serialized (base64) length:', serialized.length);

    return serialized;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
}
