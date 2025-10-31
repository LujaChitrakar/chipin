import { Member, createMultisig } from "../../lib/createSquad";
import { Keypair, PublicKey } from "@solana/web3.js";
import { isPublickey } from "../../lib/isPublickey";
import { ValidationRules, useSquadForm } from "@/hooks/useSquadForm";
import { useMultisigData } from "@/hooks/useMultisigData";
import { useMultisigAddress } from "@/hooks/useMultisigAddress";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";

export default function CreateSquadForm({}: {}) {
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];

  const { connection, programId } = useMultisigData();
  const { setMultisigAddress } = useMultisigAddress();
  const validationRules = getValidationRules();

  const { formState, handleChange, handleAddMember, onSubmit } = useSquadForm<{
    signature: string;
    multisig: string;
  }>(
    {
      threshold: 1,
      rentCollector: "",
      configAuthority: "",
      createKey: "",
      members: {
        count: 0,
        memberData: [],
      },
    },
    validationRules
  );

  async function submitHandler() {
    if (!wallet) throw new Error("Please connect your wallet.");
    try {
      const createKey = Keypair.generate();

      const { transaction, multisig } = await createMultisig(
        connection,
        new PublicKey(wallet.publicKey),
        formState.values.members.memberData,
        formState.values.threshold,
        createKey.publicKey,
        formState.values.rentCollector,
        formState.values.configAuthority,
        programId.toBase58()
      );

      const provider = await wallet.getProvider();

      const { signature } = await provider.request({
        method: "signAndSendTransaction",
        params: { transaction, connection },
      });

      console.log("Transaction signature", signature);

      let sent = false;
      const maxAttempts = 10;
      const delayMs = 1000;
      for (let attempt = 0; attempt <= maxAttempts && !sent; attempt++) {
        const status = await connection.getSignatureStatus(signature);
        if (status?.value?.confirmationStatus === "confirmed") {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          sent = true;
        } else {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      setMultisigAddress.mutate(multisig.toBase58());

      return { signature, multisig: multisig.toBase58() };
    } catch (error: any) {
      console.error(error);
      return error;
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  //For its usage take reference to
  // :https://github.com/Squads-Protocol/public-v4-client/blob/3a452c5699e3db4febc8d49fc71820dff6de39a5/src/components/CreateSquadForm.tsx#L109
}

function getValidationRules(): ValidationRules {
  return {
    threshold: async (value: number) => {
      if (value < 1) return "Threshold must be greater than 0";
      return null;
    },
    rentCollector: async (value: string) => {
      const valid = isPublickey(value);
      if (!valid) return "Rent collector must be a valid public key";
      return null;
    },
    configAuthority: async (value: string) => {
      const valid = isPublickey(value);
      if (!valid) return "Config authority must be a valid public key";
      return null;
    },
    members: async (value: { count: number; memberData: Member[] }) => {
      if (value.count < 1) return "At least one member is required";

      const valid = await Promise.all(
        value.memberData.map(async (member) => {
          if (member.key == null) return "Invalid Member Key";
          const valid = isPublickey(member.key.toBase58());
          if (!valid) return "Invalid Member Key";
          return null;
        })
      );

      if (valid.includes("Invalid Member Key")) {
        let index = valid.findIndex((v) => v === "Invalid Member Key");
        return `Member ${index + 1} is invalid`;
      }

      return null;
    },
  };
}
