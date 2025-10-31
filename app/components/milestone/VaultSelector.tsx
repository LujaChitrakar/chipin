import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { useVaultIndex } from "@/hooks/useVaultIndex";

// Generate vault indices from 0 to 255
const vaultIndices = Array.from({ length: 256 }, (_, index) => ({
  value: index.toString(),
  label: `Vault ${index}`,
}));

export function VaultSelector() {
  const { vaultIndex, setVaultIndex } = useVaultIndex(); // Use React Query hook
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedValue = vaultIndex.toString(); // Ensure string comparison

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === selectedValue ? "0" : currentValue;
    setVaultIndex.mutate(parseInt(newValue, 10)); // Ensure numeric storage
    setOpen(false);
    setSearchQuery("");
  };

  // Filter vault indices based on search query
  const filteredVaultIndices = React.useMemo(() => {
    if (!searchQuery) return vaultIndices;
    const query = searchQuery.toLowerCase();
    return vaultIndices.filter(
      (vault) =>
        vault.label.toLowerCase().includes(query) || vault.value.includes(query)
    );
  }, [searchQuery]);

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)}>
        <Text numberOfLines={1}>
          {selectedValue ? `Vault ${selectedValue}` : "Select Vault Index..."}
        </Text>
        <Text>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <TextInput
              placeholder="Search Vault Index..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            {/* Vault List */}
            {filteredVaultIndices.length > 0 ? (
              <FlatList
                data={filteredVaultIndices}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelect(item.value)}>
                    <View>
                      <Text>✓</Text>
                      <Text>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View>
                <Text>No vault index found.</Text>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setOpen(false);
                setSearchQuery("");
              }}
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
