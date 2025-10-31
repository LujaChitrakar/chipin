import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMultisigAddress } from "@/hooks/useMultisigAddress";

const MultisigInput = ({ onUpdate }: { onUpdate: () => void }) => {
  const { multisigAddress, setMultisigAddress } = useMultisigAddress();
  const [multisig, setMultisig] = useState(multisigAddress || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (multisig.trim().length > 0) {
      setIsSubmitting(true);
      try {
        await setMultisigAddress.mutateAsync(multisig); // Save using React Query
        onUpdate(); // Trigger any additional UI updates
        Alert.alert("Success", "Multisig address has been set.");
      } catch (error) {
        console.error("Failed to set multisig address:", error);
        Alert.alert(
          "Error",
          "Failed to set multisig address. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Alert.alert("Validation Error", "Multisig address cannot be empty.");
      console.error("Multisig address cannot be empty.");
    }
  };

  return (
    <View>
      <View>
        <Text>Enter Multisig Config Address</Text>
        <Text>
          There is no multisig set in Local Storage. Set it by entering its
          Public Key below.
        </Text>
        <TextInput
          placeholder="Multisig Address"
          placeholderTextColor="#9CA3AF"
          value={multisig}
          onChangeText={(text) => setMultisig(text.trim())}
          editable={!isSubmitting}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text>Set Multisig</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MultisigInput;
