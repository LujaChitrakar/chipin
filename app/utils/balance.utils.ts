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
  const ata = await getAssociatedTokenAddress(
    usdcMint,
    new PublicKey(wallet.publicKey)
  );
  const accountInfo = await connection.getAccountInfo(ata);
  if (!accountInfo) {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        ata, // ATA address
        wallet.publicKey, // owner
        usdcMint // token mint
      )
    );
    // Sign and send the transaction
    await wallet.signAndSendTransaction(transaction);
  }
  return ata;
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

  // Calculate total owed and owed to user
  groupData.expenses.forEach((expense: any) => {
    const splitAmount = expense.amount / expense.split_between.length;
    const paidBy = expense.paid_by;
    const isUserPaid = paidBy === userId;
    const userInSplit = expense.split_between.includes(userId);
    if (expense.paid_by === userId) {
      // User paid, others owe user
      expense.split_between.forEach((memberId: string) => {
        if (memberId !== userId) {
          youAreOwed += splitAmount;
        }
      });
    } else if (userInSplit) {
      youOwe += splitAmount;
    }
  });

  // Calculate net balance
  const netBalance = youAreOwed - youOwe;

  return {
    youAreOwed: Number(youAreOwed.toFixed(2)),
    youOwe: Number(youOwe.toFixed(2)),
    netBalance: Number(netBalance.toFixed(2)),
  };
};
