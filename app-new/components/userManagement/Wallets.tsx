import { useEmbeddedSolanaWallet, usePrivy } from "@privy-io/expo";
import { View, Text, Button } from "react-native";
import { useState } from "react";
import GlobalStyles from "@/assets/global.styles";

export default function Wallets() {
  const [error, setError] = useState<string | null>(null);
  const { user } = usePrivy();
  const { create: createSolanaWallet } = useEmbeddedSolanaWallet();

  type chainTypes = "solana";

  const ALL_CHAIN_TYPES: chainTypes[] = ["solana"];

  const createWallets = (chainType: chainTypes) => {
    return createSolanaWallet?.({
      createAdditional: true,
      recoveryMethod: "privy",
    });
  };
  return (
    <View
      style={GlobalStyles.screenContainer}
    >
      <Text>Wallets</Text>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {ALL_CHAIN_TYPES.map((chainType, i) => (
          <Button
            key={`create-wallet-${chainType}-${i}`}
            title={`Create ${chainType} Wallet`}
            onPress={() => createWallets(chainType)}
          />
        ))}
      </View>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
}
