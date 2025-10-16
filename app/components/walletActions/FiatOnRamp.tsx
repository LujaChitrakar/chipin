import React, { useState } from "react";
import { View, Text, Button, Linking } from "react-native";
import axios from "axios";
import { useEmbeddedSolanaWallet, usePrivy } from "@privy-io/expo"; // or "@privy-io/react"

export default function FiatOnRamp() {
  const { user, getAccessToken } = usePrivy();
  const [status, setStatus] = useState("");

  const fundWallet = async () => {
    if (!user) return console.log("User not logged in");

    const { wallets } = useEmbeddedSolanaWallet();
    const wallet = wallets?.[0];

    if (!wallet?.publicKey) return console.log("Wallet not available");

    const walletAddress = wallet.publicKey;
    const currentUrl = "myapp://redirect"; // deep link
    const authToken = await getAccessToken();

    // Send request to backend
    const response = await axios.post(
      "http://YOUR_SERVER:3000/api/onramp",
      { address: walletAddress, redirectUrl: currentUrl },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const onrampUrl = response.data.url;
    if (onrampUrl) {
      Linking.openURL(onrampUrl);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10 }}>Fund your wallet</Text>
      <Button title="Buy USDC / Fund Wallet" onPress={fundWallet} />
      {status ? <Text style={{ marginTop: 10 }}>{status}</Text> : null}
    </View>
  );
}
