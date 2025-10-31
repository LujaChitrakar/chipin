import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MULTISIG_STORAGE_KEY = "x-multisig-v4";

const getMultisigAddress = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(MULTISIG_STORAGE_KEY);
  } catch (error) {
    console.error("Error reading multisig address:", error);
    return null;
  }
};

export const useMultisigAddress = () => {
  const queryClient = useQueryClient();

  const { data: multisigAddress } = useSuspenseQuery({
    queryKey: [MULTISIG_STORAGE_KEY],
    queryFn: getMultisigAddress,
  });

  const setMultisigAddress = useMutation({
    mutationFn: async (newAddress: string | null) => {
      try {
        if (newAddress) {
          await AsyncStorage.setItem(MULTISIG_STORAGE_KEY, newAddress);
        } else {
          await AsyncStorage.removeItem(MULTISIG_STORAGE_KEY);
        }
        return newAddress;
      } catch (error) {
        console.error("Error saving multisig address:", error);
        throw error;
      }
    },
    onSuccess: (newAddress) => {
      queryClient.setQueryData([MULTISIG_STORAGE_KEY], newAddress);
    },
  });

  return { multisigAddress, setMultisigAddress };
};
