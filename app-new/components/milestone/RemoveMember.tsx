import { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
} from "react-native";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import { useAccess } from "../../hooks/useAccess";
import { waitForConfirmation } from "../../lib/transactionConfirmation";
import { useQueryClient } from "@tanstack/react-query";
import { useMultisigData } from "../../hooks/useMultisigData";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";

type RemoveMemberButtonProps = {
  multisigPda: string;
  transactionIndex: number;
  memberKey: string;
  programId: string;
};

const RemoveMemberButton = ({
  multisigPda,
  transactionIndex,
  memberKey,
  programId,
}: RemoveMemberButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  if (!wallet) throw new Error("Please connect your wallet.");
  const isMember = useAccess();
  const member = new PublicKey(memberKey);
  const queryClient = useQueryClient();
  const { connection } = useMultisigData();

  const removeMember = async () => {
    let bigIntTransactionIndex = BigInt(transactionIndex);
    const removeMemberIx = multisig.instructions.configTransactionCreate({
      multisigPda: new PublicKey(multisigPda),
      actions: [
        {
          __kind: "RemoveMember",
          oldMember: member,
        },
      ],
      creator: new PublicKey(wallet.publicKey),
      transactionIndex: bigIntTransactionIndex,
      rentPayer: new PublicKey(wallet.publicKey),
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const proposalIx = multisig.instructions.proposalCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: new PublicKey(wallet.publicKey),
      isDraft: false,
      transactionIndex: bigIntTransactionIndex,
      rentPayer: new PublicKey(wallet.publicKey),
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const approveIx = multisig.instructions.proposalApprove({
      multisigPda: new PublicKey(multisigPda),
      member: new PublicKey(wallet.publicKey),
      transactionIndex: bigIntTransactionIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const message = new TransactionMessage({
      instructions: [removeMemberIx, proposalIx, approveIx],
      payerKey: new PublicKey(wallet.publicKey),
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(message);

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

  const handleRemoveMember = async () => {
    setIsLoading(true);
    try {
      await removeMember();
      Alert.alert("Success", "Remove Member action proposed.");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
      Alert.alert("Error", `Failed to propose: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !isMember || isLoading;

  return (
    <TouchableOpacity onPress={handleRemoveMember} disabled={isDisabled}>
      {isLoading ? (
        <View>
          <ActivityIndicator color="#FFFFFF" size="small" />
          <Text>Submitting...</Text>
        </View>
      ) : (
        <Text>Remove</Text>
      )}
    </TouchableOpacity>
  );
};

export default RemoveMemberButton;
