import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import * as multisig from "@sqds/multisig";
import ApproveButton from "./Approve";
import ExecuteButton from "./Execute";
import RejectButton from "./Reject";
import { useExplorerUrl, useRpcUrl } from "@/hooks/useSettings";
import { useMultisig } from "@/hooks/useServices";

interface ActionButtonsProps {
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
}

export default function TransactionTable({
  multisigPda,
  transactions,
  programId,
}: {
  multisigPda: string;
  transactions: {
    transactionPda: string;
    proposal: multisig.generated.Proposal | null;
    index: bigint;
  }[];
  programId?: string;
}) {
  const { rpcUrl } = useRpcUrl();
  const { data: multisigConfig } = useMultisig();

  if (transactions.length === 0) {
    return (
      <View>
        <Text>No transactions found.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Table Header */}
        <View>
          <View>
            <Text>Index</Text>
          </View>
          <View>
            <Text>Transaction PDA</Text>
          </View>
          <View>
            <Text>Status</Text>
          </View>
          <View>
            <Text>Actions</Text>
          </View>
        </View>

        {/* Table Body */}
        {transactions.map((transaction, index) => {
          const stale =
            (multisigConfig &&
              Number(multisigConfig.staleTransactionIndex) >
                Number(transaction.index)) ||
            false;

          const explorerUrl = createSolanaExplorerUrl(
            transaction.transactionPda,
            rpcUrl!
          );

          return (
            <View key={index}>
              <View>
                <Text>{Number(transaction.index)}</Text>
              </View>
              <View>
                <TouchableOpacity onPress={() => Linking.openURL(explorerUrl)}>
                  <Text numberOfLines={1}>{transaction.transactionPda}</Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text>
                  {stale
                    ? "(stale)"
                    : transaction.proposal?.status.__kind || "None"}
                </Text>
              </View>
              <View>
                {!stale ? (
                  <ActionButtons
                    multisigPda={multisigPda!}
                    transactionIndex={Number(transaction.index)}
                    proposalStatus={
                      transaction.proposal?.status.__kind || "None"
                    }
                    programId={
                      programId ? programId : multisig.PROGRAM_ID.toBase58()
                    }
                  />
                ) : (
                  <Text>Stale</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function ActionButtons({
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: ActionButtonsProps) {
  return (
    <View>
      <ApproveButton
        multisigPda={multisigPda}
        transactionIndex={transactionIndex}
        proposalStatus={proposalStatus}
        programId={programId}
      />
      <RejectButton
        multisigPda={multisigPda}
        transactionIndex={transactionIndex}
        proposalStatus={proposalStatus}
        programId={programId}
      />
      <ExecuteButton
        multisigPda={multisigPda}
        transactionIndex={transactionIndex}
        proposalStatus={proposalStatus}
        programId={programId}
      />
    </View>
  );
}

function createSolanaExplorerUrl(publicKey: string, rpcUrl: string): string {
  const { explorerUrl } = useExplorerUrl();
  const baseUrl = `${explorerUrl}/address/`;
  const clusterQuery = "?cluster=custom&customUrl=";
  const encodedRpcUrl = encodeURIComponent(rpcUrl);
  return `${baseUrl}${publicKey}${clusterQuery}${encodedRpcUrl}`;
}
