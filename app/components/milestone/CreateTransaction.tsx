import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as bs58 from "bs58";
import { useState } from "react";
import * as multisig from "@sqds/multisig";
import { Message, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { simulateEncodedTransaction } from "../../lib/simulateEncodedTransaction";
import { importTransaction } from "@/lib/importTransaction";
import { useMultisigData } from "@/hooks/useMultisigData";
import invariant from "invariant";
import { VaultSelector } from "./VaultSelector";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";

const CreateTransaction = () => {
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  if (!wallet) throw new Error("Please connect your wallet.");

  const [tx, setTx] = useState("");
  const [open, setOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { connection, multisigAddress, vaultIndex, programId } =
    useMultisigData();

  const getSampleMessage = async () => {
    invariant(programId, "Program ID not found");
    invariant(
      multisigAddress,
      "Multisig address not found. Please create a multisig first."
    );
    invariant(wallet.publicKey, "Wallet ID not found");
    let memo = "Hello from Solana land!";
    const vaultAddress = multisig.getVaultPda({
      index: vaultIndex,
      multisigPda: new PublicKey(multisigAddress),
      programId: programId,
    })[0];

    const dummyMessage = Message.compile({
      instructions: [
        new TransactionInstruction({
          keys: [
            {
              pubkey: new PublicKey(wallet.publicKey),
              isSigner: true,
              isWritable: true,
            },
          ],
          data: Buffer.from(memo, "utf-8"),
          programId: new PublicKey(
            "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
          ),
        }),
      ],
      payerKey: vaultAddress,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    });

    const encoded = bs58.encode(new Uint8Array(dummyMessage.serialize()));

    setTx(encoded);
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await simulateEncodedTransaction(tx, connection, wallet);
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleImport = async () => {
    if (!multisigAddress) return;

    setIsImporting(true);
    try {
      await importTransaction(
        tx,
        connection,
        multisigAddress,
        programId.toBase58(),
        vaultIndex,
        wallet
      );
      setOpen(false);
      setTx("");
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
    } finally {
      setIsImporting(false);
    }
  };

  const isWalletConnected = wallet && wallet.publicKey;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        disabled={!isWalletConnected}
      >
        <Text>Import Transaction</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOpen(false)}
      >
        <View>
          <View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View>
                <Text>Import Transaction</Text>
                <Text>
                  Propose a transaction from a base58 encoded transaction
                  message (not a transaction).
                </Text>
              </View>

              {/* Vault Selector */}
              <View>
                <Text>Using Vault Index:</Text>
                <VaultSelector />
              </View>

              {/* Input */}
              <TextInput
                placeholder="Paste base58 encoded transaction..."
                placeholderTextColor="#9CA3AF"
                value={tx}
                onChangeText={(text) => setTx(text.trim())}
                multiline
                numberOfLines={4}
                editable={!isSimulating && !isImporting}
              />

              {/* Action Buttons */}
              <View>
                <TouchableOpacity
                  onPress={handleSimulate}
                  disabled={isSimulating || isImporting || !tx}
                >
                  {isSimulating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text>Simulate</Text>
                  )}
                </TouchableOpacity>

                {multisigAddress && (
                  <TouchableOpacity
                    onPress={handleImport}
                    disabled={isSimulating || isImporting || !tx}
                  >
                    {isImporting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text>Import</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Sample Message Button */}
              <TouchableOpacity
                onPress={getSampleMessage}
                disabled={!isWalletConnected || isSimulating || isImporting}
              >
                <Text>Click to use a sample memo for testing</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setOpen(false)}
                disabled={isSimulating || isImporting}
              >
                <Text>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CreateTransaction;
