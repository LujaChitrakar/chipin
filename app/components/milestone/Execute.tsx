import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import { useState } from "react";
import { range } from "@/lib/utils";
import { useMultisigData } from "@/hooks/useMultisigData";
import { useQueryClient } from "@tanstack/react-query";
import { waitForConfirmation } from "../../lib/transactionConfirmation";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";

type WithALT = {
  instruction: TransactionInstruction;
  lookupTableAccounts: AddressLookupTableAccount[];
};

type ExecuteButtonProps = {
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
};

const ExecuteButton = ({
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: ExecuteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const closeDialog = () => setIsOpen(false);
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  if (!wallet) throw new Error("Please connect your wallet.");
  const [priorityFeeLamports, setPriorityFeeLamports] = useState<number>(5000);
  const [computeUnitBudget, setComputeUnitBudget] = useState<number>(200_000);

  const isTransactionReady = proposalStatus === "Approved";

  const { connection } = useMultisigData();
  const queryClient = useQueryClient();

  const executeTransaction = async () => {
    const member = new PublicKey(wallet.publicKey);
    let bigIntTransactionIndex = BigInt(transactionIndex);

    if (!isTransactionReady) {
      Alert.alert("Error", "Proposal has not reached threshold.");
      return;
    }

    console.log({
      multisigPda: multisigPda,
      connection,
      member: member,
      transactionIndex: bigIntTransactionIndex,
      programId: programId ? programId : multisig.PROGRAM_ID.toBase58(),
    });

    const [transactionPda] = multisig.getTransactionPda({
      multisigPda: new PublicKey(multisigPda),
      index: bigIntTransactionIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });

    let txData;
    let txType;
    try {
      await multisig.accounts.VaultTransaction.fromAccountAddress(
        // @ts-ignore
        connection,
        transactionPda
      );
      txType = "vault";
    } catch (error) {
      try {
        await multisig.accounts.ConfigTransaction.fromAccountAddress(
          // @ts-ignore
          connection,
          transactionPda
        );
        txType = "config";
      } catch (e) {
        txData = await multisig.accounts.Batch.fromAccountAddress(
          // @ts-ignore
          connection,
          transactionPda
        );
        txType = "batch";
      }
    }

    let transactions: VersionedTransaction[] = [];

    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFeeLamports,
    });
    const computeUnitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
      units: computeUnitBudget,
    });

    let blockhash = (await connection.getLatestBlockhash()).blockhash;

    if (txType == "vault") {
      const resp = await multisig.instructions.vaultTransactionExecute({
        multisigPda: new PublicKey(multisigPda),
        // @ts-ignore
        connection,
        member,
        transactionIndex: bigIntTransactionIndex,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      transactions.push(
        new VersionedTransaction(
          new TransactionMessage({
            instructions: [
              priorityFeeInstruction,
              computeUnitInstruction,
              resp.instruction,
            ],
            payerKey: member,
            recentBlockhash: blockhash,
          }).compileToV0Message(resp.lookupTableAccounts)
        )
      );
    } else if (txType == "config") {
      const executeIx = multisig.instructions.configTransactionExecute({
        multisigPda: new PublicKey(multisigPda),
        member,
        rentPayer: member,
        transactionIndex: bigIntTransactionIndex,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      transactions.push(
        new VersionedTransaction(
          new TransactionMessage({
            instructions: [
              priorityFeeInstruction,
              computeUnitInstruction,
              executeIx,
            ],
            payerKey: member,
            recentBlockhash: blockhash,
          }).compileToV0Message()
        )
      );
    } else if (txType == "batch" && txData) {
      const executedBatchIndex = txData.executedTransactionIndex;
      const batchSize = txData.size;

      if (executedBatchIndex === undefined || batchSize === undefined) {
        throw new Error(
          "executedBatchIndex or batchSize is undefined and can't execute the transaction"
        );
      }

      transactions.push(
        ...(await Promise.all(
          range(executedBatchIndex + 1, batchSize).map(async (batchIndex) => {
            const { instruction: transactionExecuteIx, lookupTableAccounts } =
              await multisig.instructions.batchExecuteTransaction({
                // @ts-ignore
                connection,
                member,
                batchIndex: bigIntTransactionIndex,
                transactionIndex: batchIndex,
                multisigPda: new PublicKey(multisigPda),
                programId: programId
                  ? new PublicKey(programId)
                  : multisig.PROGRAM_ID,
              });

            const message = new TransactionMessage({
              payerKey: member,
              recentBlockhash: blockhash,
              instructions: [
                priorityFeeInstruction,
                computeUnitInstruction,
                transactionExecuteIx,
              ],
            }).compileToV0Message(lookupTableAccounts);

            return new VersionedTransaction(message);
          })
        ))
      );
    }
    const provider = await wallet.getProvider?.();

    let signatures = [];
    for (const tx of transactions) {
      const legacyTx = Transaction.from(tx.serialize());

      const { signedTransaction } = await provider.request({
        method: "signTransaction",
        params: {
          transaction: legacyTx,
        },
      });

      const rawTx = signedTransaction.serialize();
      const sig = await connection.sendRawTransaction(rawTx, {
        skipPreflight: true,
      });

      signatures.push(sig);
      console.log("Transaction signature", sig);
    }
    for (const sig of signatures) {
      await connection.confirmTransaction(sig, "confirmed");
    }

    const sent = await waitForConfirmation(connection, signatures);
    console.log("sent", sent);
    if (!sent.every((sent) => !!sent)) {
      throw `Unable to confirm`;
    }
    closeDialog();
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await executeTransaction();
      Alert.alert("Success", "Transaction executed.");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
      Alert.alert("Error", "Failed to execute. Check console for info.");
      console.error(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        disabled={!isTransactionReady}
      >
        <Text>Execute</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDialog}
      >
        <View>
          <View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View>
                <Text>Execute Transaction</Text>
                <Text>
                  Select custom priority fees and compute unit limits and
                  execute transaction.
                </Text>
              </View>

              {/* Priority Fee Input */}
              <View>
                <Text>Priority Fee in lamports</Text>
                <TextInput
                  placeholder="Priority Fee"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={priorityFeeLamports.toString()}
                  onChangeText={(text) =>
                    setPriorityFeeLamports(Number(text) || 5000)
                  }
                  editable={!isExecuting}
                />
              </View>

              {/* Compute Unit Budget Input */}
              <View>
                <Text>Compute Unit Budget</Text>
                <TextInput
                  placeholder="Compute Unit Budget"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={computeUnitBudget.toString()}
                  onChangeText={(text) =>
                    setComputeUnitBudget(Number(text) || 200_000)
                  }
                  editable={!isExecuting}
                />
              </View>

              {/* Action Buttons */}
              <View>
                <TouchableOpacity
                  onPress={handleExecute}
                  disabled={!isTransactionReady || isExecuting}
                >
                  {isExecuting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text>Execute</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={closeDialog} disabled={isExecuting}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ExecuteButton;
