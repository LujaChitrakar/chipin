import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import * as multisig from "@sqds/multisig";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useMultisig } from "../../hooks/useServices";
import invariant from "invariant";
import { types as multisigTypes } from "@sqds/multisig";
import { waitForConfirmation } from "../../lib/transactionConfirmation";
import { useQueryClient } from "@tanstack/react-query";
import { useMultisigData } from "../../hooks/useMultisigData";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";

type ChangeThresholdInputProps = {
  multisigPda: string;
  transactionIndex: number;
};

const ChangeThresholdInput = ({
  multisigPda,
  transactionIndex,
}: ChangeThresholdInputProps) => {
  const { data: multisigConfig } = useMultisig();
  const [threshold, setThreshold] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  if (!wallet) throw new Error("Please connect your wallet.");
  const queryClient = useQueryClient();

  const bigIntTransactionIndex = BigInt(transactionIndex);
  const { connection, programId } = useMultisigData();

  const countVoters = (members: multisig.types.Member[]) => {
    return members.filter(
      (member) =>
        (member.permissions.mask & multisigTypes.Permission.Vote) ===
        multisigTypes.Permission.Vote
    ).length;
  };

  const validateThreshold = () => {
    invariant(multisigConfig, "Invalid multisig conf loaded");
    const totalVoters = countVoters(multisigConfig.members);

    if (parseInt(threshold, 10) < 1) {
      return "Threshold must be at least 1.";
    }
    if (parseInt(threshold) > totalVoters) {
      return `Threshold cannot exceed ${totalVoters} (total voters).`;
    }
    return null; // Valid input
  };

  const changeThreshold = async () => {
    const validateError = validateThreshold();
    if (validateError) {
      throw validateError;
    }

    const changeThresholdIx = multisig.instructions.configTransactionCreate({
      multisigPda: new PublicKey(multisigPda),
      actions: [
        {
          __kind: "ChangeThreshold",
          newThreshold: parseInt(threshold),
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
      instructions: [changeThresholdIx, proposalIx, approveIx],
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

  const handleChangeThreshold = async () => {
    setIsLoading(true);
    try {
      await changeThreshold();
      Alert.alert("Success", "Threshold change proposed.");
      setThreshold("");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
      Alert.alert("Error", `Failed to propose: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled =
    !threshold ||
    (!!multisigConfig &&
      multisigConfig.threshold === parseInt(threshold, 10)) ||
    isLoading;

  return (
    <View>
      <TextInput
        placeholder={
          multisigConfig
            ? multisigConfig.threshold.toString()
            : "Enter threshold"
        }
        placeholderTextColor="#9CA3AF"
        value={threshold}
        onChangeText={(text) => setThreshold(text.trim())}
        keyboardType="numeric"
        editable={!isLoading}
      />
      <TouchableOpacity onPress={handleChangeThreshold} disabled={isDisabled}>
        {isLoading ? (
          <View>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text>Loading...</Text>
          </View>
        ) : (
          <Text>Change Threshold</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChangeThresholdInput;
