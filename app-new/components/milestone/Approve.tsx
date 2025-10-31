import { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { PublicKey, Transaction } from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import { useMultisigData } from "@/hooks/useMultisigData";
import { useQueryClient } from "@tanstack/react-query";
import { waitForConfirmation } from "../../lib/transactionConfirmation";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";

type ApproveButtonProps = {
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
};

const ApproveButton = ({
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: ApproveButtonProps) => {
  const [isApproving, setIsApproving] = useState(false);

  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];
  if (!wallet) throw new Error("Please connect your wallet.");

  const validKinds = [
    "Rejected",
    "Approved",
    "Executing",
    "Executed",
    "Cancelled",
  ];
  const isKindValid = validKinds.includes(proposalStatus || "None");
  const { connection } = useMultisigData();
  const queryClient = useQueryClient();

  const approveProposal = async () => {
    let bigIntTransactionIndex = BigInt(transactionIndex);
    const transaction = new Transaction();
    if (proposalStatus === "None") {
      const createProposalInstruction = multisig.instructions.proposalCreate({
        multisigPda: new PublicKey(multisigPda),
        creator: new PublicKey(wallet.publicKey),
        isDraft: false,
        transactionIndex: bigIntTransactionIndex,
        rentPayer: new PublicKey(wallet.publicKey),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      transaction.add(createProposalInstruction);
    }
    if (proposalStatus == "Draft") {
      const activateProposalInstruction =
        multisig.instructions.proposalActivate({
          multisigPda: new PublicKey(multisigPda),
          member: new PublicKey(wallet.publicKey),
          transactionIndex: bigIntTransactionIndex,
          programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
        });
      transaction.add(activateProposalInstruction);
    }
    const approveProposalInstruction = multisig.instructions.proposalApprove({
      multisigPda: new PublicKey(multisigPda),
      member: new PublicKey(wallet.publicKey),
      transactionIndex: bigIntTransactionIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    transaction.add(approveProposalInstruction);

    const provider = await wallet.getProvider();
    const { signature } = await provider.request({
      method: "signAndSendTransaction",
      params: { transaction, connection },
    });

    console.log("Transaction signature", signature);

    const sent = await waitForConfirmation(connection, [signature]);
    if (!sent[0]) {
      throw `Transaction failed or unable to confirm. Check ${signature}`;
    }
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveProposal();
      Alert.alert("Success", "Transaction approved.");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
      Alert.alert("Error", `Failed to approve: ${errorMessage}`);
    } finally {
      setIsApproving(false);
    }
  };

  const isDisabled = isKindValid || isApproving;

  return (
    <TouchableOpacity onPress={handleApprove} disabled={isDisabled}>
      {isApproving ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text>Approve</Text>
      )}
    </TouchableOpacity>
  );
};

export default ApproveButton;
