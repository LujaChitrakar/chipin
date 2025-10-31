import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from '@solana/web3.js';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useGetMultisigDetails,
  useGetVaultBalance,
  useContributeToVault,
  useProposeTransaction,
  useApproveTransaction,
  useExecuteTransaction,
  useSimulateTransaction,
  useGetSquadTransactions,
  useCreateMultisig,
} from '@/services/api/squad';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { RPC_URL } from '@/constants/WalletConfig';
import multisig from '@sqds/multisig';
import bs58 from 'bs58';

// Initialize QueryClient for TanStack Query
const queryClient = new QueryClient();

// Initialize Solana connection
const connection = new Connection(RPC_URL, 'confirmed');

// Query to fetch stored squad PDAs from AsyncStorage
const useGetUserSquads = () => {
  return useQuery({
    queryKey: ['userSquads'],
    queryFn: async () => {
      const pdas = await AsyncStorage.getItem('squadPdAs');
      return pdas ? JSON.parse(pdas) : [];
    },
  });
};

const TestingPage: React.FC = () => {
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0]; // Use the first wallet, as in ScreenHeader

  const [multisigPda, setMultisigPda] = useState<string>(''); // Input for Multisig PDA
  const [amount, setAmount] = useState<string>('0'); // Contribution amount in SOL
  const [encodedTx, setEncodedTx] = useState<string>(''); // Base58-encoded transaction
  const [transactionIndex, setTransactionIndex] = useState<string>('0'); // Transaction index for approval/execution

  // Fetch stored squads
  const {
    data: userSquads,
    isLoading: squadsLoading,
    error: squadsError,
  } = useGetUserSquads();

  // Fetch multisig details
  const {
    data: squad,
    isLoading: squadLoading,
    error: squadError,
  } = useGetMultisigDetails(connection, multisigPda);

  // Fetch vault balance
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useGetVaultBalance(
    connection,
    multisigPda,
    0 // Assuming vaultIndex 0
  );

  // Fetch squad transactions
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useGetSquadTransactions(connection, multisigPda);

  // Create multisig mutation
  const { mutate: createMultisig, isPending: isCreating } = useCreateMultisig();
  const handleCreateSquad = () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    const createKey = Keypair.generate().publicKey;
    createMultisig(
      {
        connection,
        user: new PublicKey(wallet.address),
        members: [
          {
            key: new PublicKey(wallet.address),
            permissions: multisig.generated.Permissions.ALLs,
          },
          {
            key: new PublicKey('G9M2RauXaz58dgr6yaw3fZD2KHCk89WzDfM83bPAkNWa'),
            permissions: multisig.generated.Permissions.ALL,},
        ],
        threshold: 1,
        createKey,
        programId: multisig.PROGRAM_ID.toBase58(),
      },
      {
        onSuccess: async ({ multisigPda }) => {
          // Save to AsyncStorage
          const existing = await AsyncStorage.getItem('squadPdAs');
          const pdas = existing ? JSON.parse(existing) : [];
          pdas.push(multisigPda);
          await AsyncStorage.setItem(
            'squadPdAs',
            JSON.stringify([...new Set(pdas)])
          );
          setMultisigPda(multisigPda);
          Alert.alert('Success', `Squad created: ${multisigPda}`);
        },
        onError: (error) =>
          Alert.alert('Error', `Failed to create squad: ${error.message}`),
      }
    );
  };

  // Contribute to vault mutation
  const { mutate: contribute, isPending: isContributing } =
    useContributeToVault();
  const handleContribute = () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    if (!multisigPda || !amount) {
      Alert.alert('Error', 'Please provide Multisig PDA and amount');
      return;
    }
    contribute(
      {
        connection,
        wallet,
        multisigPda,
        vaultIndex: 0,
        amount: Number(amount),
      },
      {
        onSuccess: () => Alert.alert('Success', 'Contribution sent'),
        onError: (error) =>
          Alert.alert('Error', `Failed to contribute: ${error.message}`),
      }
    );
  };

  // Propose transaction mutation
  const { mutate: propose, isPending: isProposing } = useProposeTransaction();
  const handlePropose = () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    if (!multisigPda || !encodedTx) {
      Alert.alert(
        'Error',
        'Please provide Multisig PDA and encoded transaction'
      );
      return;
    }
    propose(
      {
        tx: encodedTx,
        connection,
        multisigPda,
        programId: multisig.PROGRAM_ID.toBase58(),
        vaultIndex: 0,
        wallet,
      },
      {
        onSuccess: () => Alert.alert('Success', 'Transaction proposed'),
        onError: (error) =>
          Alert.alert('Error', `Failed to propose: ${error.message}`),
      }
    );
  };

  // Approve transaction mutation
  const { mutate: approve, isPending: isApproving } = useApproveTransaction();
  const handleApprove = (index: number) => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    if (!multisigPda) {
      Alert.alert('Error', 'Please provide Multisig PDA');
      return;
    }
    approve(
      {
        connection,
        wallet,
        multisigPda,
        transactionIndex: index,
        programId: multisig.PROGRAM_ID.toBase58(),
      },
      {
        onSuccess: () => Alert.alert('Success', 'Transaction approved'),
        onError: (error) =>
          Alert.alert('Error', `Failed to approve: ${error.message}`),
      }
    );
  };

  // Execute transaction mutation
  const { mutate: execute, isPending: isExecuting } = useExecuteTransaction();
  const handleExecute = (index: number) => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    if (!multisigPda) {
      Alert.alert('Error', 'Please provide Multisig PDA');
      return;
    }
    execute(
      {
        connection,
        wallet,
        multisigPda,
        transactionIndex: index,
        programId: multisig.PROGRAM_ID.toBase58(),
      },
      {
        onSuccess: () => Alert.alert('Success', 'Transaction executed'),
        onError: (error) =>
          Alert.alert('Error', `Failed to execute: ${error.message}`),
      }
    );
  };

  // Simulate transaction mutation
  const { mutate: simulate, isPending: isSimulating } =
    useSimulateTransaction();
  const handleSimulate = () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    if (!encodedTx) {
      Alert.alert('Error', 'Please provide encoded transaction');
      return;
    }
    simulate(
      {
        tx: encodedTx,
        connection,
        wallet,
      },
      {
        onSuccess: () =>
          Alert.alert('Success', 'Transaction simulation successful'),
        onError: (error) =>
          Alert.alert('Error', `Failed to simulate: ${error.message}`),
      }
    );
  };

  // Generate mock transaction for testing
  const generateMockTransaction = async () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(wallet.address),
        toPubkey: new PublicKey('11111111111111111111111111111111'),
        lamports: 1000000, // 0.001 SOL
      })
    );
    tx.feePayer = new PublicKey(wallet.address);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    setEncodedTx(bs58.encode(tx.serialize({ requireAllSignatures: false })));
    Alert.alert('Success', 'Mock transaction generated');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ScreenContainer>
        <ScreenHeader
          title='Savings'
          onBackPress={() => {}}
          backButton={false}
        />
        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            <Text style={styles.sectionTitle}>
              Test Multisig Functionalities
            </Text>

            {/* Wallet Status */}
            <Text style={styles.infoText}>
              Wallet: {wallet ? wallet.address : 'Not connected'}
            </Text>

            {/* Create Squad */}
            <Text style={styles.sectionTitle}>Create New Squad</Text>
            <Button
              title={isCreating ? 'Creating...' : 'Create Squad'}
              onPress={handleCreateSquad}
              disabled={isCreating || !wallet}
            />

            {/* Squad Selection */}
            <Text style={styles.sectionTitle}>Squad Selection</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter Multisig PDA'
              value={multisigPda}
              onChangeText={setMultisigPda}
              placeholderTextColor='#adababff'
            />
            {squadsLoading && (
              <Text style={styles.infoText}>Loading squads...</Text>
            )}
            {squadsError && (
              <Text style={styles.errorText}>
                Error: {(squadsError as Error).message}
              </Text>
            )}
            {userSquads && userSquads.length > 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Available Squads:</Text>
                {userSquads.map((pda: string) => (
                  <Button
                    key={pda}
                    title={`Select ${pda.slice(0, 8)}...`}
                    onPress={() => setMultisigPda(pda)}
                  />
                ))}
              </View>
            )}

            {/* Squad Details */}
            {squadLoading && (
              <Text style={styles.infoText}>Loading squad details...</Text>
            )}
            {squadError && (
              <Text style={styles.errorText}>
                Error: {(squadError as Error).message}
              </Text>
            )}
            {squad && (
              <View style={styles.infoContainer}>
                <Text style={styles.sectionTitle}>Squad Details</Text>
                <Text style={styles.infoText}>
                  Members:{' '}
                  {squad.members.map((m: any) => m.key.toBase58()).join(', ')}
                </Text>
                <Text style={styles.infoText}>
                  Threshold: {squad.threshold}
                </Text>
              </View>
            )}

            {/* Vault Balance */}
            {balanceLoading && (
              <Text style={styles.infoText}>Loading balance...</Text>
            )}
            {balanceError && (
              <Text style={styles.errorText}>
                Error: {(balanceError as Error).message}
              </Text>
            )}
            {balance && (
              <Text style={styles.infoText}>Vault Balance: {balance} SOL</Text>
            )}

            {/* Transactions */}
            <Text style={styles.sectionTitle}>Squad Transactions</Text>
            {transactionsLoading && (
              <Text style={styles.infoText}>Loading transactions...</Text>
            )}
            {transactionsError && (
              <Text style={styles.errorText}>
                Error: {(transactionsError as Error).message}
              </Text>
            )}
            {transactions && transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <View key={tx.index} style={styles.transactionContainer}>
                  <Text style={styles.infoText}>Transaction #{tx.index}</Text>
                  <Text style={styles.infoText}>
                    Status: {Object.keys(tx.status)[0]}
                  </Text>
                  <Text style={styles.infoText}>
                    Approvals: {tx.approvals.length}/{tx.threshold} (
                    {tx.approvals.join(', ')})
                  </Text>
                  <Text style={styles.infoText}>Creator: {tx.creator}</Text>
                  {tx.status.active && tx.approvals.length < tx.threshold && (
                    <Button
                      title={
                        isApproving ? 'Approving...' : `Approve #${tx.index}`
                      }
                      onPress={() => {
                        setTransactionIndex(tx.index.toString());
                        handleApprove(tx.index);
                      }}
                      disabled={isApproving || !wallet}
                    />
                  )}
                  {tx.status.active && tx.approvals.length >= tx.threshold && (
                    <Button
                      title={
                        isExecuting ? 'Executing...' : `Execute #${tx.index}`
                      }
                      onPress={() => {
                        setTransactionIndex(tx.index.toString());
                        handleExecute(tx.index);
                      }}
                      disabled={isExecuting || !wallet}
                    />
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>No transactions found</Text>
            )}

            {/* Contribute to Vault */}
            <Text style={styles.sectionTitle}>Contribute to Vault</Text>
            <TextInput
              style={styles.input}
              placeholder='Amount in SOL'
              value={amount}
              onChangeText={setAmount}
              keyboardType='numeric'
              placeholderTextColor='#adababff'
            />
            <Button
              title={isContributing ? 'Contributing...' : 'Contribute'}
              onPress={handleContribute}
              disabled={isContributing || !wallet}
            />

            {/* Propose Transaction */}
            <Text style={styles.sectionTitle}>Propose Transaction</Text>
            <TextInput
              style={styles.input}
              placeholder='Encoded Transaction (base58)'
              value={encodedTx}
              onChangeText={setEncodedTx}
              placeholderTextColor='#adababff'
            />
            <Button
              title='Generate Mock Transaction'
              onPress={generateMockTransaction}
              disabled={!wallet}
            />
            <Button
              title={isProposing ? 'Proposing...' : 'Propose Transaction'}
              onPress={handlePropose}
              disabled={isProposing || !wallet}
            />

            {/* Approve/Execute Transaction */}
            <Text style={styles.sectionTitle}>Approve/Execute Transaction</Text>
            <TextInput
              style={styles.input}
              placeholder='Transaction Index'
              value={transactionIndex}
              onChangeText={setTransactionIndex}
              keyboardType='numeric'
              placeholderTextColor='#adababff'
            />
            <Button
              title={isApproving ? 'Approving...' : 'Approve Transaction'}
              onPress={() => handleApprove(Number(transactionIndex))}
              disabled={isApproving || !wallet || !transactionIndex}
            />
            <Button
              title={isExecuting ? 'Executing...' : 'Execute Transaction'}
              onPress={() => handleExecute(Number(transactionIndex))}
              disabled={isExecuting || !wallet || !transactionIndex}
            />

            {/* Simulate Transaction */}
            <Text style={styles.sectionTitle}>Simulate Transaction</Text>
            <Button
              title={isSimulating ? 'Simulating...' : 'Simulate Transaction'}
              onPress={handleSimulate}
              disabled={isSimulating || !wallet}
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    marginBottom: 120,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#e8e8e8ff',
  },
  infoContainer: {
    marginVertical: 8,
  },
  transactionContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#cdcdcdff',
    marginVertical: 4,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    color: '#e8e8e8ff',
    marginVertical: 8,
    borderRadius: 5,
  },
});

export default TestingPage;
