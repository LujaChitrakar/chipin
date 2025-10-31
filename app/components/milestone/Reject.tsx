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

type RejectButtonProps = {
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
};

const RejectButton = ({
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: RejectButtonProps) => {
  const [isRejecting, setIsRejecting] = useState(false);

  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];
  if (!wallet) throw new Error("Please connect your wallet.");

  const { connection } = useMultisigData();
  const queryClient = useQueryClient();
  const validKinds = ["None", "Active", "Draft"];
  const isKindValid = validKinds.includes(proposalStatus);

  const rejectTransaction = async () => {
    let bigIntTransactionIndex = BigInt(transactionIndex);
    if (!isKindValid) {
      Alert.alert("Error", "You can't reject this proposal.");
      return;
    }
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
    const rejectProposalInstruction = multisig.instructions.proposalReject({
      multisigPda: new PublicKey(multisigPda),
      member: new PublicKey(wallet.publicKey),
      transactionIndex: bigIntTransactionIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    transaction.add(rejectProposalInstruction);

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

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectTransaction();
      Alert.alert("Success", "Transaction rejected.");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
      Alert.alert("Error", `Failed to reject: ${errorMessage}`);
    } finally {
      setIsRejecting(false);
    }
  };

  const isDisabled = !isKindValid || isRejecting;

  return (
    <TouchableOpacity onPress={handleReject} disabled={isDisabled}>
      {isRejecting ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text>Reject</Text>
      )}
    </TouchableOpacity>
  );
};

export default RejectButton;
