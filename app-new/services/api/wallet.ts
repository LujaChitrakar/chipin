import { RPC_URL, USDC_MINT } from "@/constants/WalletConfig";
import { checkAndCreateATA, checkBalance } from "@/utils/balance.utils";
import { transferUSDC } from "@/utils/transfer";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSendUSDC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      recipient,
      wallet,
    }: {
      amount: number;
      recipient: string;
      wallet: any;
    }) => {
      if (!wallet?.getProvider) throw new Error("Wallet not found");
      const provider = await wallet.getProvider();

      const fromPubkey = wallet.publicKey;
      const sig = await transferUSDC(provider, fromPubkey, recipient, amount);
      return {
        transactionId: sig,
        paid_by_address: fromPubkey,
        paid_to_address: recipient,
        amount,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wallet-balance"],
      });
    },
  });
};

export const useCreateWallet = () => {
  const { create: createSolanaWallet } = useEmbeddedSolanaWallet();

  const createWallets = () => {
    return createSolanaWallet?.({
      createAdditional: true,
      recoveryMethod: "privy",
    });
  };
  return useMutation({
    mutationFn: async () => {
      const newWallet = await createWallets();
    },
  });
};

export const useGetBalance = () => {
  const { wallets } = useEmbeddedSolanaWallet();
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const wallet = wallets?.[0];
      const connection = new Connection(RPC_URL);
      if (!wallet?.publicKey) {
        console.error("Wallet not connected");
        return 0;
      }

      const walletPubkey = new PublicKey(wallet.publicKey);
      const senderATA = await getAssociatedTokenAddress(
        USDC_MINT,
        walletPubkey
      );
      const bal = senderATA ? await checkBalance(connection, senderATA) : 0;
      console.log("BALANCE FROM QUERY::", bal);
      return bal || 0;
    },
  });
};
