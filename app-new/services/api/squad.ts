import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as web3 from '@solana/web3.js';
import * as multisig from '@sqds/multisig';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { isPublickey } from '@/lib/isPublickey';
import { createMultisig, Member } from '@/lib/createSquad';
import { importTransaction } from '@/lib/importTransaction';
import { simulateEncodedTransaction } from '@/lib/simulateEncodedTransaction';

// Query to fetch multisig squad details
export const useGetMultisigDetails = (
  connection: web3.Connection,
  multisigPda: string
) => {
  return useQuery({
    queryKey: ['multisigDetails', multisigPda],
    queryFn: async () => {
      if (!isPublickey(multisigPda)) {
        throw new Error('Invalid Multisig PDA');
      }
      const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
        connection,
        new PublicKey(multisigPda)
      );
      return {
        members: multisigInfo.members,
        threshold: Number(multisigInfo.threshold),
        transactionIndex: Number(multisigInfo.transactionIndex),
      };
    },
    enabled: !!multisigPda, // Only run if multisigPda is provided
  });
};

// Query to fetch vault balance
export const useGetVaultBalance = (
  connection: web3.Connection,
  multisigPda: string,
  vaultIndex: number
) => {
  return useQuery({
    queryKey: ['vaultBalance', multisigPda, vaultIndex],
    queryFn: async () => {
      if (!isPublickey(multisigPda)) {
        throw new Error('Invalid Multisig PDA');
      }
      const vaultPda = multisig.getVaultPda({
        multisigPda: new PublicKey(multisigPda),
        index: vaultIndex,
        programId: multisig.PROGRAM_ID,
      })[0];
      const balance = await connection.getBalance(vaultPda);
      return balance / web3.LAMPORTS_PER_SOL; // Convert lamports to SOL
    },
    enabled: !!multisigPda,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Query to fetch squad transactions
export const useGetSquadTransactions = (
  connection: web3.Connection,
  multisigPda: string
) => {
  return useQuery({
    queryKey: ['squadTransactions', multisigPda],
    queryFn: async () => {
      if (!isPublickey(multisigPda)) {
        throw new Error('Invalid Multisig PDA');
      }
      const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
        connection,
        new PublicKey(multisigPda)
      );
      const transactionIndex = Number(multisigInfo.transactionIndex);
      const transactions = [];

      // Fetch transactions up to transactionIndex
      for (let i = 1; i <= transactionIndex; i++) {
        try {
          const [transactionPda] = multisig.getTransactionPda({
            multisigPda: new PublicKey(multisigPda),
            index: BigInt(i),
            programId: multisig.PROGRAM_ID,
          });
          const transactionInfo =
            await multisig.accounts.VaultTransaction.fromAccountAddress(
              connection,
              transactionPda
            );
          transactions.push({
            index: i,
            pda: transactionPda.toBase58(),
            status: transactionInfo.status,
            approvals: transactionInfo.members
              .map((member: any, idx: number) => ({
                key: member.key.toBase58(),
                approved: transactionInfo.app[idx],
              }))
              .filter((m: any) => m.approved)
              .map((m: any) => m.key),
            threshold: Number(multisigInfo.threshold),
            creator: transactionInfo.creator.toBase58(),
          });
        } catch (error) {
          console.warn(`Failed to fetch transaction ${i}:`, error);
          continue;
        }
      }
      return transactions;
    },
    enabled: !!multisigPda,
  });
};

// Mutation to create a multisig squad
export const useCreateMultisig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      connection,
      user,
      members,
      threshold,
      createKey,
      rentCollector,
      configAuthority,
      programId,
    }: {
      connection: web3.Connection;
      user: PublicKey;
      members: Member[];
      threshold: number;
      createKey: PublicKey;
      rentCollector?: string;
      configAuthority?: string;
      programId?: string;
    }) => {
      const { transaction, multisig } = await createMultisig(
        connection,
        user,
        members,
        threshold,
        createKey,
        rentCollector,
        configAuthority,
        programId
      );
      const signature = await connection.sendTransaction(transaction, [], {
        skipPreflight: true,
      });
      const hasSent = await connection.confirmTransaction(signature);
      if (!hasSent.value) {
        throw new Error('Failed to confirm transaction');
      }
      return { multisigPda: multisig.toBase58(), signature };
    },
    onSuccess: ({ multisigPda }) => {
      queryClient.invalidateQueries({
        queryKey: ['multisigDetails', multisigPda],
      });
    },
    onError: (error) => {
      console.error('Failed to create multisig:', error);
    },
  });
};

// Mutation to contribute funds to the vault
export const useContributeToVault = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      connection,
      wallet,
      multisigPda,
      vaultIndex,
      amount,
    }: {
      connection: web3.Connection;
      wallet: any;
      multisigPda: string;
      vaultIndex: number;
      amount: number; // Amount in SOL
    }) => {
      if (!wallet?.address) throw new Error('Wallet not connected');
      if (!isPublickey(multisigPda)) throw new Error('Invalid Multisig PDA');

      const vaultPda = multisig.getVaultPda({
        multisigPda: new PublicKey(multisigPda),
        index: vaultIndex,
        programId: multisig.PROGRAM_ID,
      })[0];

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(wallet.address),
          toPubkey: vaultPda,
          lamports: Math.floor(amount * web3.LAMPORTS_PER_SOL),
        })
      );
      transaction.feePayer = new PublicKey(wallet.address);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signature = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: true,
        }
      );
      const hasSent = await connection.confirmTransaction(txid);
      if (!hasSent.value) {
        throw new Error('Failed to confirm contribution');
      }
      return { signature: txid, amount, contributor: wallet.address };
    },
    onSuccess: ({ multisigPda, vaultIndex }: any) => {
      queryClient.invalidateQueries({
        queryKey: ['vaultBalance', multisigPda, vaultIndex],
      });
    },
    onError: (error) => {
      console.error('Failed to contribute:', error);
    },
  });
};

// Mutation to propose a transaction
export const useProposeTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tx,
      connection,
      multisigPda,
      programId,
      vaultIndex,
      wallet,
    }: {
      tx: string;
      connection: web3.Connection;
      multisigPda: string;
      programId: string;
      vaultIndex: number;
      wallet: any;
    }) => {
      await importTransaction(
        tx,
        connection,
        multisigPda,
        programId,
        vaultIndex,
        wallet
      );
      return {
        multisigPda,
        transactionIndex:
          Number(
            (
              await multisig.accounts.Multisig.fromAccountAddress(
                connection,
                new PublicKey(multisigPda)
              )
            ).transactionIndex
          ) + 1,
      };
    },
    onSuccess: ({ multisigPda }) => {
      queryClient.invalidateQueries({
        queryKey: ['multisigDetails', multisigPda],
      });
      queryClient.invalidateQueries({
        queryKey: ['squadTransactions', multisigPda],
      });
    },
    onError: (error) => {
      console.error('Failed to propose transaction:', error);
    },
  });
};

// Mutation to approve a transaction
export const useApproveTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      connection,
      wallet,
      multisigPda,
      transactionIndex,
      programId,
    }: {
      connection: web3.Connection;
      wallet: any;
      multisigPda: string;
      transactionIndex: number;
      programId?: string;
    }) => {
      if (!wallet?.address) throw new Error('Wallet not connected');
      if (!isPublickey(multisigPda)) throw new Error('Invalid Multisig PDA');

      const approveIx = multisig.instructions.proposalApprove({
        multisigPda: new PublicKey(multisigPda),
        member: new PublicKey(wallet.address),
        transactionIndex: BigInt(transactionIndex),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });

      const transaction = new Transaction().add(approveIx);
      transaction.feePayer = new PublicKey(wallet.address);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: true,
        }
      );
      const hasSent = await connection.confirmTransaction(signature);
      if (!hasSent.value) {
        throw new Error('Failed to confirm approval');
      }
      return { signature, multisigPda, transactionIndex };
    },
    onSuccess: ({ multisigPda }) => {
      queryClient.invalidateQueries({
        queryKey: ['multisigDetails', multisigPda],
      });
      queryClient.invalidateQueries({
        queryKey: ['squadTransactions', multisigPda],
      });
    },
    onError: (error) => {
      console.error('Failed to approve transaction:', error);
    },
  });
};

// Mutation to execute a transaction
export const useExecuteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      connection,
      wallet,
      multisigPda,
      transactionIndex,
      programId,
    }: {
      connection: web3.Connection;
      wallet: any;
      multisigPda: string;
      transactionIndex: number;
      programId?: string;
    }) => {
      if (!wallet?.address) throw new Error('Wallet not connected');
      if (!isPublickey(multisigPda)) throw new Error('Invalid Multisig PDA');

      const [transactionPda] = multisig.getTransactionPda({
        multisigPda: new PublicKey(multisigPda),
        index: BigInt(transactionIndex),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });

      const executeIx = await multisig.instructions.vaultTransactionExecute({
        connection: connection,
        multisigPda: new PublicKey(multisigPda),
        transactionIndex: BigInt(transactionIndex),
        member: new PublicKey(wallet.address),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });

      const transaction = new Transaction().add(executeIx.instruction);
      transaction.feePayer = new PublicKey(wallet.address);
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: true,
        }
      );
      const hasSent = await connection.confirmTransaction(signature);
      if (!hasSent.value) {
        throw new Error('Failed to confirm execution');
      }
      return { signature, multisigPda, transactionIndex };
    },
    onSuccess: ({ multisigPda }) => {
      queryClient.invalidateQueries({
        queryKey: ['multisigDetails', multisigPda],
      });
      queryClient.invalidateQueries({
        queryKey: ['squadTransactions', multisigPda],
      });
      queryClient.invalidateQueries({
        queryKey: ['vaultBalance', multisigPda, 0],
      });
    },
    onError: (error) => {
      console.error('Failed to execute transaction:', error);
    },
  });
};

// Mutation to simulate a transaction
export const useSimulateTransaction = () => {
  return useMutation({
    mutationFn: async ({
      tx,
      connection,
      wallet,
    }: {
      tx: string;
      connection: web3.Connection;
      wallet: any;
    }) => {
      await simulateEncodedTransaction(tx, connection, wallet);
      return { success: true };
    },
    onError: (error) => {
      console.error('Failed to simulate transaction:', error);
    },
  });
};
