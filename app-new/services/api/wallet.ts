import { transferUSDC } from '@/utils/transfer';
import { useMutation } from '@tanstack/react-query';

export const useSendUSDC = () => {
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
      if (!wallet?.getProvider) throw new Error('Wallet not found');
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
  });
};
