import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRpcUrl, useProgramId } from "./useSettings";

const DEFAULT_VAULT_INDEX = 0;

const getVaultIndex = async (): Promise<number> => {
  try {
    const storedValue = await AsyncStorage.getItem("x-vault-index");
    return storedValue ? parseInt(storedValue, 10) : DEFAULT_VAULT_INDEX;
  } catch (error) {
    console.error("Error reading vault index:", error);
    return DEFAULT_VAULT_INDEX;
  }
};

export const useVaultIndex = () => {
  const queryClient = useQueryClient();
  const { rpcUrl } = useRpcUrl();
  const { programId } = useProgramId();

  const { data: vaultIndex } = useSuspenseQuery({
    queryKey: ["vaultIndex", rpcUrl, programId],
    queryFn: async () => {
      if (!rpcUrl || !programId) {
        return null;
      }
      return getVaultIndex();
    },
  });

  const setVaultIndex = useMutation({
    mutationFn: async (newIndex: number) => {
      try {
        if (newIndex !== null && newIndex !== undefined) {
          await AsyncStorage.setItem("x-vault-index", newIndex.toString());
        } else {
          await AsyncStorage.removeItem("x-vault-index");
        }
        return newIndex;
      } catch (error) {
        console.error("Error saving vault index:", error);
        throw error;
      }
    },
    onSuccess: (newIndex) => {
      queryClient.setQueryData(["vaultIndex", rpcUrl, programId], newIndex);
    },
  });

  return { vaultIndex: vaultIndex ?? DEFAULT_VAULT_INDEX, setVaultIndex };
};
