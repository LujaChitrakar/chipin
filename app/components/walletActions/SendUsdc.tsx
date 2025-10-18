import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { transferUSDC } from "@/utils/transfer";

export default function SendUSDC() {
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];
  const [status, setStatus] = useState<string>("");

  const handleSend = async () => {
    try {
      if (!wallet?.getProvider) throw new Error("Wallet not found");
      const provider = await wallet.getProvider();

      const fromPubkey = wallet.publicKey;
      const recipient = "BEL7ZKzg3rYrUL2hRaK2WocpxCc6QeBtArJwLiYWGyY6";
      const amount = 100;

      setStatus(" Sending 1 USDC...");
      const sig = await transferUSDC(provider, fromPubkey, recipient, amount);

      setStatus(`Sent! Signature: ${sig}`);
    } catch (err: any) {
      setStatus(` ${err?.message ?? String(err)}`);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Transfer USDC</Text>
      <Button title="Send 1 USDC" onPress={handleSend} />
      <Text style={{ marginTop: 10 }}>{status}</Text>
    </View>
  );
}
