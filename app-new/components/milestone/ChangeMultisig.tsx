import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useMultisigAddress } from "@/hooks/useMultisigAddress";

export function ChangeMultisig() {
  const { setMultisigAddress } = useMultisigAddress(); // Use React Query hook

  const handleChangeMultisig = () => {
    setMultisigAddress.mutate(null); // Wipes out the stored multisig address
  };

  return (
    <View>
      <View>
        <Text>Switch to a different Squad</Text>
        <TouchableOpacity onPress={handleChangeMultisig}>
          <Text>Change</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
