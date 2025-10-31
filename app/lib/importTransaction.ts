"use client";
import * as multisig from "@sqds/multisig";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { decodeAndDeserialize } from "./decodeAndDeserialize";
import { loadLookupTables } from "./getAccountsForSimulation";
import { waitForConfirmation } from "./transactionConfirmation";

export const importTransaction = async (
  tx: string,
  connection: Connection,
  multisigPda: string,
  programId: string,
  vaultIndex: number,
  wallet: any
) => {
  if (!wallet.publicKey) {
    throw "Please connect your wallet.";
  }
  try {
    const { message, version } = decodeAndDeserialize(tx);

    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      // @ts-ignore
      connection,
      new PublicKey(multisigPda)
    );

    const transactionMessage = new TransactionMessage(message);

    const addressLookupTableAccounts =
      version === 0
        ? await loadLookupTables(
            connection,
            transactionMessage.compileToV0Message()
          )
        : [];

    const transactionIndex = Number(multisigInfo.transactionIndex) + 1;
    const transactionIndexBN = BigInt(transactionIndex);

    const multisigTransactionIx = multisig.instructions.vaultTransactionCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: new PublicKey(wallet.publicKey),
      ephemeralSigners: 0,
      // @ts-ignore
      transactionMessage: transactionMessage,
      transactionIndex: transactionIndexBN,
      addressLookupTableAccounts,
      rentPayer: new PublicKey(wallet.publicKey),
      vaultIndex: vaultIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const proposalIx = multisig.instructions.proposalCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: new PublicKey(wallet.publicKey),
      isDraft: false,
      transactionIndex: transactionIndexBN,
      rentPayer: new PublicKey(wallet.publicKey),
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const approveIx = multisig.instructions.proposalApprove({
      multisigPda: new PublicKey(multisigPda),
      member: new PublicKey(wallet.publicKey),
      transactionIndex: transactionIndexBN,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });

    const blockhash = (await connection.getLatestBlockhash()).blockhash;

    const wrappedMessage = new TransactionMessage({
      instructions: [multisigTransactionIx, proposalIx, approveIx],
      payerKey: new PublicKey(wallet.publicKey),
      recentBlockhash: blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(wrappedMessage);

    const signature = await wallet.sendTransaction(transaction, connection, {
      skipPreflight: true,
    });
    console.log("Transaction signature", signature);

    const hasSent = await waitForConfirmation(connection, [signature]);
    if (!hasSent.every((s) => !!s)) {
      throw `Unable to confirm transaction`;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
