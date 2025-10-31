import * as multisig from "@sqds/multisig";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";

const getRpcUrl = async (): Promise<string> => {
  try {
    const url = await AsyncStorage.getItem("x-rpc-url");
    return url || DEFAULT_RPC_URL;
  } catch (error) {
    console.error("Error reading RPC URL:", error);
    return DEFAULT_RPC_URL;
  }
};

export const useRpcUrl = () => {
  const queryClient = useQueryClient();

  const { data: rpcUrl } = useSuspenseQuery({
    queryKey: ["rpcUrl"],
    queryFn: getRpcUrl,
  });

  const setRpcUrl = useMutation({
    mutationFn: async (newRpcUrl: string) => {
      try {
        await AsyncStorage.setItem("x-rpc-url", newRpcUrl);
        return newRpcUrl;
      } catch (error) {
        console.error("Error saving RPC URL:", error);
        throw error;
      }
    },
    onSuccess: (newRpcUrl) => {
      queryClient.setQueryData(["rpcUrl"], newRpcUrl);
    },
  });

  return { rpcUrl, setRpcUrl };
};

const DEFAULT_PROGRAM_ID = multisig.PROGRAM_ID.toBase58();

const getProgramId = async (): Promise<string> => {
  try {
    const id = await AsyncStorage.getItem("x-program-id-v4");
    return id || DEFAULT_PROGRAM_ID;
  } catch (error) {
    console.error("Error reading Program ID:", error);
    return DEFAULT_PROGRAM_ID;
  }
};

export const useProgramId = () => {
  const queryClient = useQueryClient();

  const { data: programId } = useSuspenseQuery({
    queryKey: ["programId"],
    queryFn: getProgramId,
  });

  const setProgramId = useMutation({
    mutationFn: async (newProgramId: string) => {
      try {
        await AsyncStorage.setItem("x-program-id-v4", newProgramId);
        return newProgramId;
      } catch (error) {
        console.error("Error saving Program ID:", error);
        throw error;
      }
    },
    onSuccess: (newProgramId) => {
      queryClient.setQueryData(["programId"], newProgramId);
    },
  });

  return { programId, setProgramId };
};

const DEFAULT_EXPLORER_URL = "https://explorer.solana.com?cluster=devnet";

const getExplorerUrl = async (): Promise<string> => {
  try {
    const url = await AsyncStorage.getItem("x-explorer-url");
    return url || DEFAULT_EXPLORER_URL;
  } catch (error) {
    console.error("Error reading Explorer URL:", error);
    return DEFAULT_EXPLORER_URL;
  }
};

export const useExplorerUrl = () => {
  const queryClient = useQueryClient();

  const { data: explorerUrl } = useSuspenseQuery({
    queryKey: ["explorerUrl"],
    queryFn: getExplorerUrl,
  });

  const setExplorerUrl = useMutation({
    mutationFn: async (newExplorerUrl: string) => {
      try {
        await AsyncStorage.setItem("x-explorer-url", newExplorerUrl);
        return newExplorerUrl;
      } catch (error) {
        console.error("Error saving Explorer URL:", error);
        throw error;
      }
    },
    onSuccess: (newExplorerUrl) => {
      queryClient.setQueryData(["explorerUrl"], newExplorerUrl);
    },
  });

  return { explorerUrl, setExplorerUrl };
};
