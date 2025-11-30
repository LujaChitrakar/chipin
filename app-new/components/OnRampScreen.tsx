import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useMoonPaySdk } from "@moonpay/react-native-moonpay-sdk";
import { useEmbeddedSolanaWallet, usePrivy } from "@privy-io/expo";

export default function OnRampScreen() {
  const { user } = usePrivy();
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  const userWalletAddress = wallet?.address;

  // 2. Configure the MoonPay SDK
  const { MoonPayWebViewComponent } = useMoonPaySdk({
    sdkConfig: {
      flow: "buy",
      environment: "sandbox", // Change to 'production' when ready
      params: {
        apiKey: "pk_test_YOUR_MOONPAY_PUBLIC_KEY", // Public Key is safe here
        currencyCode: "ETH", // Default currency
        baseCurrencyCode: "USD",

        walletAddress: userWalletAddress,
      },
    },
    // 4. Handle URL Signing
    onUrlSignatureRequested: async (url: any) => {
      try {
        const response = await fetch(
          "https://your-express-api.com/sign-moonpay-url",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Add your auth headers here (e.g., Bearer token from Privy)
            },
            body: JSON.stringify({ url }),
          }
        );

        const data = await response.json();
        return data.signature;
      } catch (error) {
        console.error("Signing failed", error);
        return "";
      }
    },
  });

  if (!userWalletAddress) {
    return (
      <View style={styles.center}>
        <Text>Loading Wallet...</Text>
      </View>
    );
  }

  // 5. Render the Widget
  return (
    <View style={styles.container}>
      <MoonPayWebViewComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
