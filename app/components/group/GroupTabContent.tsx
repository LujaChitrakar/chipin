import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import colors from '@/assets/colors';
import { transferUSDC } from '@/utils/transfer';
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import { useSendUSDC } from '@/services/api/wallet';
import { useQueryClient } from "@tanstack/react-query";

interface GroupTabContentProps {
  activeTab: string;
  expenses: any[];
  members: any[];
  allBalances: any;
  myProfile: any;
  handleEditExpense: (expense: any) => void;
  canEditExpense: (expense: any) => boolean;
  addPayment: (
    data: {
      groupId: string;
      paymentData: {
        amount: number;
        transactionId: string;
        paid_by: string;
        paid_to: string;
        paid_by_address: string;
        paid_to_address: string;
      };
    },
    options: { onSuccess: () => void; onError: (error: any) => void }
  ) => void;
  groupId: string;
}

const GroupTabContent: React.FC<GroupTabContentProps> = ({
  activeTab,
  expenses,
  members,
  allBalances,
  myProfile,
  handleEditExpense,
  canEditExpense,
  addPayment,
  groupId,
}) => {
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];
  const {
    mutate: sendUSDC,
    isPending: isSending,
    error: sendError,
  } = useSendUSDC();
  const queryClient = useQueryClient();
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [settlingMemberId, setSettlingMemberId] = useState('');

  const handleSettle = async (member: any, amount: number) => {
    setSettlingMemberId(member?._id);
    sendUSDC(
      {
        amount: amount,
        recipient: member.wallet_public_key,
        wallet,
      },
      {
        onSuccess: (response) => {
          console.log('TRANSFERED USDC:::', response);
          addPayment(
            {
              groupId,
              paymentData: {
                ...response,
                paid_by: myProfile?.data?._id,
                paid_to: member._id,
              },
            },
            {
              onSuccess: () => {
                Alert.alert('Success', 'Payment settled successfully.');
                setSettlingMemberId(member?._id);
                queryClient.invalidateQueries({
                  queryKey: [groupId],
                });
              },
              onError: (error: any) => {
                console.log('ERROR ADDING PAYMENT:', error?.response?.data);
                setErrorMessage(
                  error?.response?.data?.message || 'Failed to record payment.'
                );
                setErrorModalVisible(true);
                setSettlingMemberId(member?._id);
              },
            }
          );
        },
        onError: (err) => {
          console.error('TRANSFERED USDC ERROR:::', err);
          setErrorMessage(err.message || 'Failed to process payment.');
          setErrorModalVisible(true);
          setSettlingMemberId(member?._id);
        },
      }
    );
  };

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        paddingHorizontal: 8,
        paddingVertical: 16,
      }}
    >
      {/* Error Modal */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#2a3b4d',
              borderRadius: 10,
              padding: 20,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#ff4444',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 10,
              }}
            >
              Error
            </Text>
            <Text
              style={{
                color: '#ffffff',
                fontSize: 16,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary.DEFAULT,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
              }}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {activeTab === 'Expenses' && (
        <>
          {expenses.length === 0 ? (
            <Text style={{ color: '#a0b0c0', textAlign: 'center' }}>
              No expenses found.
            </Text>
          ) : (
            expenses.map((expense: any) => (
              <View
                key={expense._id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#2a3b4d',
                  padding: 12,
                  borderRadius: 8,
                  opacity: canEditExpense(expense) ? 1 : 0.6,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleEditExpense(expense)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: '#ffffff',
                        fontSize: 16,
                        fontWeight: '500',
                      }}
                    >
                      {expense.expense_title}
                    </Text>
                    <Text style={{ color: '#a0b0c0', fontSize: 14 }}>
                      Paid by:{' '}
                      {members.find((m: any) => m._id === expense.paid_by)
                        ?.fullname ||
                        members.find((m: any) => m._id === expense.paid_by)
                          ?.username}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                    <Text
                      style={{
                        color: colors.primary[300],
                        fontSize: 18,
                        fontWeight: '700',
                      }}
                    >
                      ${expense.amount.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
      )}
      {activeTab === 'Balances' && (
        <>
          {members.map((member: any) => {
            const balance = allBalances[member._id] || 0;
            if (balance === 0) return null;
            if (member._id === myProfile?.data?._id) return null;
            const balanceText =
              balance === 0
                ? `Net balance $${Math.abs(balance).toFixed(2)}`
                : balance < 0
                ? `You owe $${Math.abs(balance).toFixed(2)}`
                : `$${balance.toFixed(2)} owes you`;

            return (
              <View
                key={member._id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#2a3b4d',
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 25,
                      backgroundColor: colors.primary.DEFAULT,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 18,
                        fontWeight: '600',
                      }}
                    >
                      {(member.fullname || member.username)
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        color: '#ffffff',
                        fontSize: 16,
                        fontWeight: '500',
                      }}
                    >
                      {member.fullname || member.username}
                    </Text>
                    <Text style={{ color: '#a0b0c0', fontSize: 14 }}>
                      {member.email}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Text
                    style={{
                      color: balance < 0 ? '#ff4444' : '#1a9b8e',
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    {balanceText}
                  </Text>
                  {balance < 0 && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.primary.DEFAULT,
                        padding: 8,
                        borderRadius: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 80,
                      }}
                      onPress={() => handleSettle(member, Math.abs(balance))}
                      disabled={isSending && settlingMemberId === member._id}
                    >
                      {(isSending && settlingMemberId === member._id) ? (
                        <ActivityIndicator size='small' color='#ffffff' />
                      ) : (
                        <Text style={{ color: 'white', fontWeight: '600' }}>
                          Settle
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </>
      )}
      {activeTab === 'Members' && (
        <>
          {members.map((member: any) => (
            <View
              key={member._id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#2a3b4d',
                padding: 12,
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#1a9b8e',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: '600',
                    }}
                  >
                    {(member.fullname || member.username)
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    {member.fullname || member.username}
                  </Text>
                  <Text style={{ color: '#a0b0c0', fontSize: 14 }}>
                    {member.email}
                  </Text>
                  {member.phone_number && (
                    <Text style={{ color: '#a0b0c0', fontSize: 14 }}>
                      {member.phone_number}
                    </Text>
                  )}
                </View>
              </View>
              {member._id === myProfile?.data?._id && (
                <Text
                  style={{
                    color: '#1a9b8e',
                    fontSize: 14,
                    fontWeight: '600',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    backgroundColor: 'rgba(26, 155, 142, 0.2)',
                    borderRadius: 4,
                  }}
                >
                  Admin
                </Text>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
};

export default GroupTabContent;
