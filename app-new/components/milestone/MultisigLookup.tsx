import { useState } from "react";
import { useMultisigData } from "@/hooks/useMultisigData";
import {
  AddressLookupTableAccount,
  AddressLookupTableAccountArgs,
  ConfirmedSignatureInfo,
  Connection,
  DecompileArgs,
  PublicKey,
  TransactionMessage,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { identifyInstructionByDiscriminator } from "../../lib/discriminator";
import { useMultisigAddress } from "@/hooks/useMultisigAddress";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MultisigLookupProps {
  onUpdate: () => void;
}

const MultisigLookup: React.FC<MultisigLookupProps> = ({ onUpdate }) => {
  const { connection, programId } = useMultisigData();
  const { setMultisigAddress } = useMultisigAddress();

  const [vaultAddress, setVaultAddress] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [foundMultisigs, setFoundMultisigs] = useState<Set<string>>(new Set());
  const [forceCancel, setForceCancel] = useState<boolean>(false);

  const search = async (): Promise<void> => {
    if (!vaultAddress) return;
    setSearching(true);
    setForceCancel(false);
    setStatusMessages([]);
    try {
      const vaultPubkey = new PublicKey(vaultAddress);

      const signatures: ConfirmedSignatureInfo[] =
        await connection.getSignaturesForAddress(vaultPubkey, { limit: 300 });
      if (signatures.length > 0) {
        setStatusMessages([`Found ${signatures.length} signatures`]);
      } else {
        setStatusMessages([
          `There was an issue retrieving the signatures, search again`,
        ]);
      }

      for (const signature of signatures) {
        if (forceCancel) {
          setSearching(false);
          break;
        }
        setStatusMessages((prev) => [
          ...prev,
          `Scanning signature ${signature.signature} - in progress`,
        ]);

        const tx: VersionedTransactionResponse | null =
          await connection.getTransaction(signature.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
          });

        if (tx) {
          const result = await processTransaction(tx, connection, programId);
          if (result) {
            if (result.decompiled) {
              for (let i = 0; i < result.decompiled.instructions.length; i++) {
                let identified = identifyInstructionByDiscriminator(
                  result.decompiled.instructions[i],
                  programId
                );
                if (identified) {
                  let msKey =
                    result.decompiled.instructions[i].keys[
                      identified.multisigAccountIndex
                    ].pubkey.toBase58();
                  setFoundMultisigs((prevState) => {
                    return prevState.add(msKey);
                  });
                }
              }
            }
          }
        }

        setStatusMessages((prev) =>
          prev.map((msg) =>
            msg.includes(signature.signature)
              ? `Scanning signature ${signature.signature} - done`
              : msg
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setSearching(false);
    } catch (e) {
      console.error(e);
      setSearching(false);
      throw e;
    }
  };

  const handleSearch = async () => {
    try {
      await search();
    } catch (e) {
      const errorMessage = typeof e === "string" ? e : String(e);
    }
  };

  return (
    <ScrollView>
      <Text>Search for Multisig Config Address</Text>
      <Text>
        If you can't access your settings in main Squads app UI to find the
        multisig config address, enter your vault address below to do a search
        via onchain call.
      </Text>

      <TextInput
        placeholder="Vault Address"
        placeholderTextColor="#9CA3AF"
        value={vaultAddress}
        onChangeText={(text) => setVaultAddress(text.trim())}
        editable={!searching}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity onPress={handleSearch} disabled={searching}>
        {searching ? (
          <View>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text>Searching...</Text>
          </View>
        ) : (
          <Text>Search</Text>
        )}
      </TouchableOpacity>

      {statusMessages.length > 0 && (
        <View>
          <ScrollView>
            {statusMessages.map((msg, index) => (
              <Text key={index}>{msg}</Text>
            ))}
          </ScrollView>
        </View>
      )}

      {foundMultisigs.size > 0 && (
        <View>
          <Text>Found Multisig Config Address!</Text>
          {[...foundMultisigs].map((msKey, index) => (
            <TouchableOpacity
              key={`ms-${index}`}
              onPress={async () => {
                setForceCancel(true);
                await setMultisigAddress.mutateAsync(msKey);
              }}
            >
              <Text numberOfLines={1}>Use {msKey}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const processTransaction = async (
  tx: VersionedTransactionResponse,
  connection: Connection,
  programId: PublicKey
) => {
  const includesSquadsProgram = tx.transaction.message.staticAccountKeys.find(
    (val) => val.equals(programId)
  );
  if (includesSquadsProgram) {
    const { addressTableLookups } = tx.transaction.message;
    const altAddresses = addressTableLookups.map((addressTableLookup) =>
      addressTableLookup.accountKey.toBase58()
    );
    const altArgsArray: AddressLookupTableAccountArgs[] = [];

    for (let i = 0; i < altAddresses.length; i++) {
      let altPubkey = new PublicKey(altAddresses[i]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // check previous state first to see if we already have it
      const alreadyCheckedState = altArgsArray.find((preAltArg) =>
        preAltArg.key.equals(altPubkey)
      );
      if (!alreadyCheckedState) {
        console.log("we dont have alt for this address, fetching", altPubkey);
        const altState = await connection.getAddressLookupTable(altPubkey);
        if (altState.value) {
          altArgsArray.push({
            key: altPubkey,
            state: altState.value.state,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const decompileArgs: DecompileArgs = {
      addressLookupTableAccounts: altArgsArray.map(
        (altArgs) => new AddressLookupTableAccount(altArgs)
      ),
    };
    const decompileTx = TransactionMessage.decompile(
      tx.transaction.message,
      decompileArgs
    );
    return { tx, decompiled: decompileTx };
  }
};

export default MultisigLookup;
