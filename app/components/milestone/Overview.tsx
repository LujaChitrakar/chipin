import { View, Text, StyleSheet, ScrollView } from "react-native";

import { VaultDisplayer } from "./VaultDisplay";
import { useMultisigData } from "@/hooks/useMultisigData";
import { ChangeMultisig } from "./ChangeMultisig";

export default function Overview() {
  const { multisigAddress } = useMultisigData();

  return (
    <ScrollView>
      <View>
        <Text>Overview</Text>
        {multisigAddress && <VaultDisplayer />}
        {multisigAddress && <ChangeMultisig />}
      </View>
    </ScrollView>
  );
}
