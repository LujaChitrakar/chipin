import { getAccount } from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

export const checkBalance = async (connection: any, ata: PublicKey) => {
  try {
    const account = await getAccount(connection, ata);
    return Number(account.amount.toString()) / 10 ** 6;
  } catch (error) {
    return 0;
  }
};

export const checkAndCreateATA = async (
  connection: any,
  wallet: any,
  usdcMint: PublicKey
) => {
  try {
    const walletPublicKey = new PublicKey(wallet.publicKey);
    const ata = await getAssociatedTokenAddress(usdcMint, walletPublicKey);
    const accountInfo = await connection.getAccountInfo(ata);
    if (!accountInfo) {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          walletPublicKey, // payer
          ata, // ATA address
          walletPublicKey, // owner
          usdcMint // token mint
        )
      );
      // Sign and send the transaction
      await wallet.signAndSendTransaction(transaction);
    }
    return ata;
  } catch (error) {
    console.log('CHECK AND CREAGE ATA ERROR:', error);
    return null;
  }
};

export const calculateGroupBalance = (groupData: any, userId: string) => {
  if (!groupData || !userId) {
    return {
      youAreOwed: 0,
      youOwe: 0,
      netBalance: 0,
    };
  }

  let youAreOwed = 0;
  let youOwe = 0;

  if (!groupData?.balances[userId]) {
    return {
      youAreOwed: 0,
      youOwe: 0,
      netBalance: 0,
    };
  }
  Object.values(groupData.balances[userId]).forEach((balance: any) => {
    if (balance > 0) {
      youAreOwed += balance;
    } else {
      youOwe += Math.abs(balance);
    }
  });

  const netBalance = youAreOwed - youOwe;

  return {
    youAreOwed: Number(youAreOwed.toFixed(2)),
    youOwe: Number(youOwe.toFixed(2)),
    netBalance: Number(netBalance.toFixed(2)),
  };
};

export const getNetBalanceFromIndividualBalances = (balances: any) => {
  let net = Object.values(balances).reduce((acc: number, curr: any) => {
    return acc + curr;
  }, 0);
  return net;
};
