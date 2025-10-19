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
import { useState } from "react";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as multisig from "@sqds/multisig";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { isPublickey } from "@/lib/isPublickey";
import { useMultisigData } from "@/hooks/useMultisigData";
import { useQueryClient } from "@tanstack/react-query";
import { useAccess } from "@/hooks/useAccess";
import { waitForConfirmation } from "@/lib/transactionConfirmation";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";

type SendTokensProps = {
  tokenAccount: string;
  mint: string;
  decimals: number;
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
};

const SendTokens = ({
  tokenAccount,
  mint,
  decimals,
  multisigPda,
  vaultIndex,
  programId,
}: SendTokensProps) => {
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];
  if (!wallet) throw new Error("Please connect your wallet.");

  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const { connection } = useMultisigData();
  const queryClient = useQueryClient();
  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const isMember = useAccess();

  const closeDialog = () => setIsOpen(false);

  const transfer = async () => {
    if (!wallet.publicKey) {
      throw "Wallet not connected";
    }

    const mintAccountInfo = await connection.getAccountInfo(
      new PublicKey(mint)
    );
    const TOKEN_PROGRAM = mintAccountInfo?.owner || TOKEN_PROGRAM_ID;

    const recipientATA = getAssociatedTokenAddressSync(
      new PublicKey(mint),
      new PublicKey(recipient),
      true,
      TOKEN_PROGRAM
    );

    const vaultAddress = multisig
      .getVaultPda({
        index: vaultIndex,
        multisigPda: new PublicKey(multisigPda),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      })[0]
      .toBase58();

    const createRecipientATAInstruction =
      createAssociatedTokenAccountIdempotentInstruction(
        new PublicKey(vaultAddress),
        recipientATA,
        new PublicKey(recipient),
        new PublicKey(mint),
        TOKEN_PROGRAM
      );

    const transferInstruction = createTransferCheckedInstruction(
      new PublicKey(tokenAccount),
      new PublicKey(mint),
      recipientATA,
      new PublicKey(vaultAddress),
      parsedAmount * 10 ** decimals,
      decimals,
      [],
      TOKEN_PROGRAM
    );

    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      // @ts-ignore
      connection,
      new PublicKey(multisigPda)
    );

    const blockhash = (await connection.getLatestBlockhash()).blockhash;

    const transferMessage = new TransactionMessage({
      instructions: [createRecipientATAInstruction, transferInstruction],
      payerKey: new PublicKey(vaultAddress),
      recentBlockhash: blockhash,
    });

    const transactionIndex = Number(multisigInfo.transactionIndex) + 1;
    const transactionIndexBN = BigInt(transactionIndex);

    const multisigTransactionIx = multisig.instructions.vaultTransactionCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: new PublicKey(wallet.publicKey),
      ephemeralSigners: 0,
      // @ts-ignore
      transactionMessage: transferMessage,
      transactionIndex: transactionIndexBN,
      addressLookupTableAccounts: [],
      rentPayer: new PublicKey(wallet.publicKey),
      vaultIndex: vaultIndex,
    });
    const proposalIx = multisig.instructions.proposalCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: new PublicKey(wallet.publicKey),
      isDraft: false,
      transactionIndex: transactionIndexBN,
      rentPayer: new PublicKey(wallet.publicKey),
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    const approveIx = multisig.instructions.proposalApprove({
      multisigPda: new PublicKey(multisigPda),
      member: new PublicKey(wallet.publicKey),
      transactionIndex: transactionIndexBN,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });

    const message = new TransactionMessage({
      instructions: [multisigTransactionIx, proposalIx, approveIx],
      payerKey: new PublicKey(wallet.publicKey),
      recentBlockhash: blockhash,
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
    setAmount("");
    setRecipient("");
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    closeDialog();
  };

  const handleTransfer = async () => {
    setIsTransferring(true);
    try {
      await transfer();
      Alert.alert("Success", "Transfer proposed.");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
      Alert.alert("Error", `Failed to propose: ${errorMessage}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const isRecipientValid = isPublickey(recipient);
  const isTransferDisabled =
    !isRecipientValid || amount.length < 1 || !isAmountValid || isTransferring;

  return (
    <>
      <TouchableOpacity disabled={!isMember}>
        <Text>Send Tokens</Text>
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
                <Text>Transfer tokens</Text>
                <Text>
                  Create a proposal to transfer tokens to another address.
                </Text>
              </View>

              {/* Recipient Input */}
              <View>
                <TextInput
                  placeholder="Recipient"
                  placeholderTextColor="#9CA3AF"
                  value={recipient}
                  onChangeText={(text) => setRecipient(text.trim())}
                  editable={!isTransferring}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {recipient.length > 0 && !isRecipientValid && (
                  <Text>Invalid recipient address</Text>
                )}
              </View>

              {/* Amount Input */}
              <View>
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text) => setAmount(text.trim())}
                  editable={!isTransferring}
                />
                {!isAmountValid && amount.length > 0 && (
                  <Text>Invalid amount</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View>
                <TouchableOpacity
                  onPress={handleTransfer}
                  disabled={isTransferDisabled}
                >
                  {isTransferring ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text>Transfer</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={closeDialog}
                  disabled={isTransferring}
                >
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

export default SendTokens;
