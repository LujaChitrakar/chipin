const FEE_PAYER_ADDRESS = "3SzstxZg8JafeitfvCqC9f1Ku9VRYk9SfKtPfp8kZghF"; // Your backend wallet address
const BACKEND_URL = "https://your-backend.com";

export async function rewardUSDC(
  recipientAddress: string,
  amount: number
): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/send-usdc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipientAddress,
      amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fund USDC");
  }

  const { transactionHash, amount: fundedAmount } = await response.json();
  return transactionHash;
}
