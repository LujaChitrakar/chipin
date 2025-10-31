import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ToastAndroid,
  Image,
} from 'react-native';
import colors from '@/assets/colors';
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import { useSendUSDC } from '@/services/api/wallet';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAddGroupPayment,
  useDeleteExpense,
  useGetGroupById,
  useUpdateExpense,
} from '@/services/api/groupApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetMyProfile } from '@/services/api/authApi';
import EditExpenseModal from './EditExpenseModal';
import ExpenseCard from './ExpenseCard';
import Button from '../common/Button';
import { MoveUpRight } from 'lucide-react-native';

const GroupTabContent = ({ activeTab }: { activeTab: string }) => {
  const router = useRouter();
  const { wallets } = useEmbeddedSolanaWallet();
  const wallet = wallets?.[0];
  const {
    mutate: sendUSDC,
    isPending: isSending,
    error: sendError,
  } = useSendUSDC();

  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: groupData, isLoading: groupDataLoading } =
    useGetGroupById(groupId);
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();

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
                ToastAndroid.showWithGravity('Payment settled successfully.', ToastAndroid.LONG, ToastAndroid.BOTTOM + 20);
                setSettlingMemberId(member?._id);
                queryClient.invalidateQueries({
                  queryKey: [groupId, 'groupById'],
                });
                queryClient.invalidateQueries({
                  queryKey: ['wallet-balance'],
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
          console.error('TRANSFERED USDC ERROR:::', err.name);
          setErrorMessage(err.message || 'Failed to process payment.');
          setErrorModalVisible(true);
          setSettlingMemberId(member?._id);
        },
      }
    );
  };

  const { mutate: addPayment, isPending: addingPayment } = useAddGroupPayment();

  const { mutate: updateExpense, isPending: updatingExpense } =
    useUpdateExpense();
  const { mutate: deleteExpense, isPending: deletingExpense } =
    useDeleteExpense();

  const [editModalVisible, setEditModalVisible] = useState(false);

  const allBalances =
    (groupData?.data?.balances &&
      groupData?.data?.balances[myProfile?.data?._id || '--']) ||
    {};

  const expenses = groupData?.data?.expenses || [];
  const isAdmin = groupData?.data?.member_admins.includes(myProfile?.data?._id);

  const canEditExpense = (expense: any) => {
    return isAdmin || expense.paid_by === myProfile?.data?._id;
  };

  const resetForm = () => {
    setExpenseTitle('');
    setAmount('');
    setPaidBy(myProfile?.data?._id);
    setSplitBetween([myProfile?.data?._id]);
    setEditingExpenseId(null);
  };

  const handleUpdateExpenseSubmit = (formData: {
    expense_title: string;
    amount: string;
    paid_by: string;
    split_between: string[];
  }) => {
    if (!editingExpenseId) return;
    updateExpense(
      {
        groupId,
        expenseId: editingExpenseId,
        expenseData: {
          ...formData,
          amount: Number(formData.amount),
        },
      },
      {
        onSuccess: () => {
          setEditModalVisible(false);
          resetForm();
          queryClient.invalidateQueries({
            queryKey: [groupId, 'groupById'],
          });
          ToastAndroid.showWithGravity(
            'Expense updated successfully',
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM + 10
          );
        },
        onError: (error: any) => {
          console.log('ERROR UPDATING EXPENSE:', error?.response?.data);
          Alert.alert('Error updating expense', 'Error updating expense');
        },
      }
    );
  };

  const handleDeleteExpenseSubmit = (
    expenseId: string,
    expenseTitle: string
  ) => {
    deleteExpense(
      { groupId, expenseId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [groupId, 'groupById'],
          });
          ToastAndroid.show('Expense deleted', ToastAndroid.SHORT);
          setEditModalVisible(false);
          resetForm();
        },
        onError: (error: any) => {
          console.log('ERROR DELETING EXPENSE:', error?.response?.data);
          Alert.alert('Error deleting expense', 'Error deleting expense');
        },
      }
    );
  };

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expense_title, setExpenseTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paid_by, setPaidBy] = useState('');
  const [split_between, setSplitBetween] = useState<string[]>([]);

  const handleEditExpense = (expense: any) => {
    setEditingExpenseId(expense._id);
    setExpenseTitle(expense.expense_title);
    setAmount(expense.amount.toString());
    setPaidBy(expense.paid_by);
    setSplitBetween(expense.split_between);
    setEditModalVisible(true);
  };

  const members = groupData?.data?.members || [];

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 16,
      }}
    >
      <EditExpenseModal
        editModalVisible={editModalVisible}
        setEditModalVisible={setEditModalVisible}
        expense_title={expense_title}
        setExpenseTitle={setExpenseTitle}
        amount={amount}
        setAmount={setAmount}
        paid_by={paid_by}
        split_between={split_between}
        setSplitBetween={setSplitBetween}
        members={members}
        editingExpenseId={editingExpenseId}
        canEditExpense={canEditExpense}
        handleUpdateExpenseSubmit={handleUpdateExpenseSubmit}
        editingExpense={updatingExpense}
        handleDeleteExpenseSubmit={handleDeleteExpenseSubmit}
        deletingExpense={deletingExpense}
        resetForm={resetForm}
      />
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
              backgroundColor: colors.background.DEFAULT,
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
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                backgroundColor: colors.white,
              }}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text
                style={{
                  color: colors.black,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {activeTab === 'expenses' && (
        <View key={'expenses'}>
          {expenses.length === 0 ? (
            <Text
              style={{
                color: colors.grayTextColor.DEFAULT,
                textAlign: 'center',
              }}
            >
              No expenses found.
            </Text>
          ) : (
            expenses.map((expense: any) => (
              <View key={expense._id}>
                <ExpenseCard
                  expense={expense}
                  groupMembers={members}
                  handleEditExpense={handleEditExpense}
                  canEditExpense={canEditExpense}
                />
                <View
                  style={{
                    width: '100%',
                    height: 1.5,
                    backgroundColor: colors.white + '11',
                  }}
                ></View>
              </View>
            ))
          )}
        </View>
      )}
      {activeTab === 'balances' && (
        <View key={'balances'}>
          {members?.length === 1 && members[0]._id === myProfile?.data?._id ? (
            <Text
              style={{
                color: colors.grayTextColor.DEFAULT,
                textAlign: 'center',
              }}
            >
              You are the only member in this group.
            </Text>
          ) : null}
          {members.map((member: any) => {
            const balance = allBalances[member._id] || 0;
            if (member._id === myProfile?.data?._id) return null;

            return (
              <View key={member._id}>
                <View
                  key={member._id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    {member?.profile_picture ? (
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 20,
                          overflow: 'hidden',
                          backgroundColor: colors.cardBackground.light,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image
                          source={{ uri: member.profile_picture }}
                          style={{ width: 36, height: 36 }}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 20,
                          backgroundColor: colors.cardBackground.light, // Blue avatar background
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 16,
                            fontWeight: '600',
                          }}
                        >
                          {(member.fullname || member.username)
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 16,
                          fontWeight: '500',
                        }}
                      >
                        {member.fullname || member.username}
                      </Text>
                      <Text
                        style={{
                          color: colors.grayTextColor.dark,
                          fontSize: 14,
                        }}
                      >
                        {member.email}
                      </Text>
                    </View>
                  </View>
                  {balance < 0 && (
                    <Button
                      style={{
                        height: 38,
                        paddingHorizontal: 16,
                        marginLeft: 'auto',
                        marginRight: 12,
                      }}
                      textStyle={{
                        fontSize: 12,
                      }}
                      onPress={() => handleSettle(member, Math.abs(balance))}
                      title='Settle'
                      loading={settlingMemberId === member._id && isSending}
                    />
                  )}

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color:
                          balance > 0
                            ? colors.green[500] + '99'
                            : balance < 0
                            ? colors.red[500] + '99'
                            : colors.green[500],
                        textAlign: 'right',
                      }}
                    >
                      {balance === 0
                        ? 'Settled'
                        : balance < 0
                        ? `You Owe`
                        : `Owes You`}
                    </Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.grayTextColor.dark,
                          fontSize: 14,
                        }}
                      >
                        $
                      </Text>
                      <Text
                        style={{
                          color: colors.white,
                          fontSize: 14,
                          fontWeight: '700',
                        }}
                      >
                        {Math.abs(balance).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    height: 1.5,
                    backgroundColor: colors.white + '11',
                  }}
                ></View>
              </View>
            );
          })}
        </View>
      )}
      {activeTab === 'members' && (
        <View key={'members'}>
          {members.map((member: any) => (
            <View key={member._id}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                }}
                onPress={() => {
                  if (member._id !== myProfile?.data?._id) {
                    router.push(`/tabs/friends/${member._id}`);
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {member?.profile_picture ? (
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        overflow: 'hidden',
                        backgroundColor: colors.cardBackground.light,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image
                        source={{ uri: member.profile_picture }}
                        style={{ width: 40, height: 40 }}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.cardBackground.light, // Blue avatar background
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: colors.white,
                          fontSize: 16,
                          fontWeight: '600',
                        }}
                      >
                        {(member.fullname || member.username)
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 16,
                        fontWeight: '500',
                      }}
                    >
                      {member.fullname || member.username}

                      <Text
                        style={{
                          color: colors.cardBackground.light,
                        }}
                      >
                        {member._id === myProfile?.data?._id && '  (You)'}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        color: colors.grayTextColor.dark,
                        fontSize: 14,
                      }}
                    >
                      {member.email}
                    </Text>
                  </View>
                </View>

                {member._id !== myProfile?.data?._id && (
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      backgroundColor: colors.white,
                      padding: 6,
                      borderRadius: 50,
                    }}
                  >
                    <MoveUpRight size={24} />
                  </View>
                )}
              </TouchableOpacity>
              <View
                style={{
                  width: '100%',
                  height: 1.5,
                  backgroundColor: colors.white + '11',
                }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default GroupTabContent;
