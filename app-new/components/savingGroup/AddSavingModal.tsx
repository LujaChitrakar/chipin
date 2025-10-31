import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '@/assets/colors';
import { DollarSign, Eye, EyeOff, TextQuote } from 'lucide-react-native';
import { Connection } from '@solana/web3.js';
import { checkAndCreateATA, checkBalance } from '@/utils/balance.utils';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { RPC_URL, USDC_MINT } from '@/constants/WalletConfig';
import { useAddSavingGroupTransaction } from '@/services/api/savingGroupApi';
import { useSendUSDC } from '@/services/api/wallet';
import { useQueryClient } from '@tanstack/react-query';

interface AddSavingModalProps {
  savingGroupData: any;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const AddSavingModal: React.FC<AddSavingModalProps> = ({
  savingGroupData,
  modalVisible,
  setModalVisible,
}) => {
  const queryClient = useQueryClient();
  const { wallets } = useEmbeddedSolanaWallet();

  const loadWalletBalance = async () => {
    const wallet = wallets?.[0];
    if (!wallet) return;
    const connection = new Connection(RPC_URL);
    const senderATA = await checkAndCreateATA(connection, wallet, USDC_MINT);
    const bal = senderATA ? await checkBalance(connection, senderATA) : 0;
    setBalance(bal);
    setPrimaryWallet(wallet);
  };

  const [balance, setBalance] = useState(0);
  const [primaryWallet, setPrimaryWallet] = useState<any>(null);
  useEffect(() => {
    loadWalletBalance();
  }, [wallets]);

  const [amount, setAmount] = React.useState('');
  const [balanceShow, setBalanceShow] = React.useState(false);

  const {
    mutate: addSavingGroupTransaction,
    isPending: addingSavingGroupTransaction,
  } = useAddSavingGroupTransaction();

  const { mutate: sendUSDC, isPending: sendingUSDC } = useSendUSDC();

  const handleAddSaving = () => {
    if (!primaryWallet) {
      ToastAndroid.showWithGravity(
        'No wallet connected.',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM+20
      );
      return;
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return;
    }

    sendUSDC(
      {
        amount: amt,
        recipient: savingGroupData?.data?.saving_address,
        wallet: primaryWallet,
      },
      {
        onSuccess: (data) => {
          addSavingGroupTransaction(
            {
              savingGroup: savingGroupData?.data?._id,
              transaction_type: 'SAVE',
              amount: amt,
              transactionId: data.transactionId,
            },
            {
              onSuccess: () => {
                setAmount('');
                setModalVisible(false);
                loadWalletBalance();
                ToastAndroid.showWithGravity(
                  'Saving added successfully.',
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM+20
                );
                queryClient.invalidateQueries({
                  queryKey: ['wallet-balance'],
                });
                queryClient.invalidateQueries({
                  queryKey: [savingGroupData?.data?._id, 'savingGroupById'],
                });
              },
              onError: (error: any) => {
                ToastAndroid.showWithGravity(
                  error?.response?.data?.message || 'Failed to add saving.',
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM+20
                );
              },
            }
          );
        },
        onError: (error: any) => {
          ToastAndroid.showWithGravity(
            error?.message || 'Failed to send USDC.',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM+20
          );
        },
      }
    );
  };

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Savings</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
              }}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Feather
                name='x'
                size={24}
                color={colors.grayTextColor.DEFAULT}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              paddingVertical: 20,
              paddingHorizontal: 15,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: colors.cardBackground.dark,
              borderRadius: 15,
            }}
          >
            <Text
              style={{
                color: colors.grayTextColor.DEFAULT,
                fontSize: 12,
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              YOUR BALANCE
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: colors.grayTextColor.dark,
                  fontSize: 24,
                  fontWeight: '400',
                }}
              >
                $
              </Text>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 32,
                  fontWeight: '400',
                }}
              >
                {balanceShow ? 'XXX' : balance.toFixed(2)}
              </Text>
              {balanceShow ? (
                <Eye
                  size={24}
                  color={colors.white}
                  onPress={() => {
                    setBalanceShow(!balanceShow);
                  }}
                />
              ) : (
                <EyeOff
                  size={24}
                  color={colors.white}
                  onPress={() => {
                    setBalanceShow(!balanceShow);
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <DollarSign size={24} color={colors.grayTextColor.DEFAULT} />
              <TextInput
                style={styles.input}
                placeholder='Saving Amount'
                placeholderTextColor={colors.grayTextColor.dark}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                }}
              />
            </View>
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
              }}
              style={styles.cancelButton}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleAddSaving();
              }}
              activeOpacity={0.8}
              style={{
                ...styles.confirmButton,
                backgroundColor:
                  amount.length === 0 ||
                  isNaN(Number(amount)) ||
                  addingSavingGroupTransaction
                    ? colors.white + '88'
                    : colors.white,
              }}
              disabled={amount.length === 0 || isNaN(Number(amount))}
            >
              <Text style={styles.confirmButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.cardBackground.DEFAULT,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground.DEFAULT,
  },
  modalTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    color: colors.grayTextColor.DEFAULT,
    fontWeight: '500',
    fontSize: 14,
  },

  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.textInputBackground.DEFAULT,
  },
  input: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 8,
    padding: 10,
    color: colors.white,
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  textInput: {
    backgroundColor: colors.textInputBackground.DEFAULT,
    color: colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllText: {
    color: colors.primary.DEFAULT,
    fontSize: 14,
    fontWeight: '500',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  modalActions: {
    display: 'flex',
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.grayTextColor.DEFAULT,
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddSavingModal;
