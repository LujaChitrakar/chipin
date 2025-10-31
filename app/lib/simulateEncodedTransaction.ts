"use client";
import { decodeAndDeserialize } from "./decodeAndDeserialize";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { getAccountsForSimulation } from "./getAccountsForSimulation";

export const simulateEncodedTransaction = async (
  tx: string,
  connection: Connection,
  wallet: any
) => {
  if (!wallet.publicKey) {
    throw "Please connect your wallet.";
  }
  try {
    const { message, version } = decodeAndDeserialize(tx);

    const transaction = new VersionedTransaction(message.compileToV0Message());

    const keys = await getAccountsForSimulation(
      connection,
      transaction,
      version === 0
    );

    const { value } = await connection.simulateTransaction(transaction, {
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: "confirmed",
      accounts: {
        encoding: "base64",
        addresses: keys,
      },
    });

    if (value.err) {
      console.error(value.err);
      throw "Simulation failed";
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
