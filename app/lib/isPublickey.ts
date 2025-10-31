import { PublicKey } from "@solana/web3.js";

export function isPublickey(key: string): boolean {
  try {
    const pk = new PublicKey(key);
    return !!pk;
  } catch (err) {
    return false;
  }
}
