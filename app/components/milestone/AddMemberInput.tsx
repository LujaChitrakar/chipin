import { useState } from "react";
import * as multisig from "@sqds/multisig";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { isPublickey } from "@/lib/isPublickey";
import { useMultisig } from "@/hooks/useServices";
import { useAccess } from "@/hooks/useAccess";
import { useMultisigData } from "@/hooks/useMultisigData";
import { isMember } from "../../lib/utils";
import invariant from "invariant";
import { waitForConfirmation } from "../../lib/transactionConfirmation";
import { useQueryClient } from "@tanstack/react-query";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type AddMemberInputProps = {
  multisigPda: string;
  transactionIndex: number;
  programId: string;
};

const AddMemberInput = ({
  multisigPda,
  transactionIndex,
  programId,
}: AddMemberInputProps) => {
  const [member, setMember] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  if (!wallet) throw new Error("Please connect your wallet.");

  const { data: multisigConfig } = useMultisig();
  const bigIntTransactionIndex = BigInt(transactionIndex);
  const { connection } = useMultisigData();
  const queryClient = useQueryClient();
  const hasAccess = useAccess();

  const addMember = async () => {
    invariant(multisigConfig, "invalid multisig conf data");

    const newMemberKey = new PublicKey(member);
    const memberExists = isMember(newMemberKey, multisigConfig.members);
    if (memberExists) {
      throw "Member already exists";
    }
    const addMemberIx = multisig.instructions.configTransactionCreate({
      multisigPda: new PublicKey(multisigPda),
      actions: [
        {
          __kind: "AddMember",
          newMember: {
            key: newMemberKey,
            permissions: {
              mask: 7,
            },
          },
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
      instructions: [addMemberIx, proposalIx, approveIx],
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

  const handleAddMember = async () => {
    setIsLoading(true);
    try {
      await addMember();
      setMember("");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !isPublickey(member) || !hasAccess || isLoading;

  return (
    <TouchableOpacity onPress={handleAddMember} disabled={isDisabled}>
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

export default AddMemberInput;
