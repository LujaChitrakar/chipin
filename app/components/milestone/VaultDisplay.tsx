import { View, Text, StyleSheet } from "react-native";
import { VaultSelector } from "./VaultSelector";
import { useMultisigData } from "@/hooks/useMultisigData";

type VaultDisplayerProps = {};

export function VaultDisplayer({}: VaultDisplayerProps) {
  const { multisigVault: vaultAddress } = useMultisigData();

  return (
    <View>
      <View>
        <Text>Squads Vault</Text>
      </View>
      <View>
        <Text>
          Address: <Text>{vaultAddress?.toBase58()}</Text>
        </Text>
        <View />
        <VaultSelector />
      </View>
    </View>
  );
}
