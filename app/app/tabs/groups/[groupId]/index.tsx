import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  ToastAndroid,
  Alert,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import GroupHeader from '@/components/group/GroupHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useAddExpense,
  useDeleteExpense,
  useGetGroupById,
  useUpdateExpense,
  useUpdateGroup,
} from '@/services/api/groupApi';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import colors from '@/assets/colors';
import { useGetMyProfile } from '@/services/api/authApi';
import { useQueryClient } from '@tanstack/react-query';
import { calculateGroupBalance } from '@/utils/balance.utils';

const GroupDetailPage = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const { data: groupData, isLoading: groupDataLoading } =
    useGetGroupById(groupId);
  const { mutate: updateGroup, isPending: updatingGroup } = useUpdateGroup();
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const { mutate: addExpense, isPending: addingExpense } = useAddExpense();
  const { mutate: updateExpense, isPending: updatingExpense } =
    useUpdateExpense();
  const { mutate: deleteExpense, isPending: deletingExpense } =
    useDeleteExpense();

  const { allBalances } = calculateGroupBalance(
    groupData?.data,
    myProfile?.data?._id
  );

  console.log('All Balances:', JSON.stringify(allBalances, null, 2));

  const [activeTab, setActiveTab] = useState('Members');
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [expense_title, setExpenseTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paid_by, setPaidBy] = useState('');
  const [split_between, setSplitBetween] = useState<string[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  useEffect(() => {
    setPaidBy(myProfile?.data?._id);
    setSplitBetween([myProfile?.data?._id, ...split_between]);
  }, [myProfile?.data?._id]);

  const members = groupData?.data?.members || [];
  const expenses = groupData?.data?.expenses || [];
  const isAdmin = groupData?.data?.member_admins.includes(myProfile?.data?._id);

  const handleAddExpenseSubmit = (formData: {
    expense_title: string;
    amount: string;
    paid_by: string;
    split_between: string[];
  }) => {
    addExpense(
      {
        groupId,
        expenseData: {
          ...formData,
          amount: Number(formData.amount),
        },
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          resetForm();
          queryClient.invalidateQueries({
            queryKey: ['group', groupId],
          });
        },
        onError: (error: any) => {
          console.log('ERROR ADDING EXPENSE:', error?.response?.data);
          Alert.alert('Error adding expense', 'Error adding expense');
        },
      }
    );
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
            queryKey: ['group', groupId],
          });
          ToastAndroid.showWithGravity(
            'Expense updated successfully',
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
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
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expenseTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(
              { groupId, expenseId },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ['group', groupId],
                  });
                  ToastAndroid.show('Expense deleted', ToastAndroid.SHORT);
                  setEditModalVisible(false);
                  resetForm();
                },
                onError: (error: any) => {
                  console.log('ERROR DELETING EXPENSE:', error?.response?.data);
                  Alert.alert(
                    'Error deleting expense',
                    'Error deleting expense'
                  );
                },
              }
            );
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setExpenseTitle('');
    setAmount('');
    setPaidBy(myProfile?.data?._id);
    setSplitBetween([myProfile?.data?._id]);
    setEditingExpenseId(null);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpenseId(expense._id);
    setExpenseTitle(expense.expense_title);
    setAmount(expense.amount.toString());
    setPaidBy(expense.paid_by);
    setSplitBetween(expense.split_between);
    setEditModalVisible(true);
  };

  const canEditExpense = (expense: any) => {
    return isAdmin || expense.paid_by === myProfile?.data?._id;
  };

  return (
    <ScreenContainer>
      <GroupHeader
        title={groupData?.data?.name || groupId}
        backButton={true}
        groupData={groupData}
        onBackPress={() => {
          router.back();
        }}
        showQr={true}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: ['group', groupId],
              });
            }}
            refreshing={groupDataLoading}
          ></RefreshControl>
        }
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 16,
            marginHorizontal: 8,
            padding: 12,
            borderRadius: 8,
            borderColor: colors.white + 'aa',
            borderWidth: 1,
            backgroundColor: colors.white + '11',
          }}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name='plus' size={18} color='white' />
          <Text style={{ color: 'white', marginLeft: 8 }}>Add Expense</Text>
        </TouchableOpacity>
        {/* Tab bar and tab content */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#1a252f',
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#2a3b4d',
            }}
          >
            {['Expenses', 'Balances', 'Members'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 8,
                  backgroundColor:
                    activeTab === tab ? '#1a9b8e' : 'transparent',
                  borderRadius: 4,
                  marginHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: activeTab === tab ? '600' : '400',
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              paddingHorizontal: 8,
              paddingVertical: 16,
            }}
          >
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
                              members.find(
                                (m: any) => m._id === expense.paid_by
                              )?.username}
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
                  const isLoggedInUser = member._id === myProfile?.data?._id;
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
                      <Text
                        style={{
                          color: balance < 0 ? '#ff4444' : '#1a9b8e',
                          fontSize: 16,
                          fontWeight: '600',
                        }}
                      >
                        {balanceText}
                      </Text>
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
                            fontWeight: '500',
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
                    {groupData?.data?.member_admins.includes(member._id) && (
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
        </View>
      </ScrollView>
      {/* Add Expense Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.black + 'aa',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background.light,
              padding: 20,
              borderRadius: 10,
              width: '80%',
              gap: 10,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 10,
              }}
            >
              Add Expense
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 10,
                color: 'white',
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              placeholder='e.g., Dinner at restaurant'
              placeholderTextColor={colors.gray.DEFAULT}
              value={expense_title}
              onChangeText={setExpenseTitle}
            />
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 10,
                color: 'white',
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              placeholder='$ 0.00'
              placeholderTextColor={colors.gray.DEFAULT}
              value={amount}
              onChangeText={setAmount}
              keyboardType='numeric'
            />
            <View style={{ marginBottom: 10 }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.gray.DEFAULT,
                    fontSize: 16,
                  }}
                >
                  Split between
                </Text>
                <TouchableOpacity
                  style={{
                    marginLeft: 'auto',
                  }}
                  onPress={() =>
                    setSplitBetween(members.map((m: any) => m._id))
                  }
                >
                  <Text
                    style={{
                      color: colors.primary.DEFAULT,
                    }}
                  >
                    Select all
                  </Text>
                </TouchableOpacity>
              </View>
              {members.map((member: any) => (
                <TouchableOpacity
                  key={member._id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                  onPress={() => {
                    if (member._id !== paid_by) {
                      setSplitBetween((prev) =>
                        prev.includes(member._id)
                          ? prev.filter((id) => id !== member._id)
                          : [...prev, member._id]
                      );
                    }
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: colors.gray.DEFAULT,
                      marginRight: 10,
                      backgroundColor: split_between.includes(member._id)
                        ? colors.primary.DEFAULT
                        : 'transparent',
                    }}
                  />
                  <Text style={{ color: 'white' }}>
                    {member.fullname || member.username}
                  </Text>
                  {paid_by === member._id && (
                    <View
                      style={{
                        backgroundColor: colors.green[700],
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 1,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.transparent,
                        }}
                      >
                        Payer
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: colors.gray[600],
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 5,
                }}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                }}
                onPress={() => {
                  handleAddExpenseSubmit({
                    expense_title,
                    amount,
                    paid_by,
                    split_between,
                  });
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>
                  Add Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Edit Expense Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}
      >
        {(() => {
          const canEdit = canEditExpense({ _id: editingExpenseId, paid_by });
          return (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.black + 'aa',
              }}
            >
              <View
                style={{
                  backgroundColor: colors.background.light,
                  padding: 20,
                  borderRadius: 10,
                  width: '80%',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: '600',
                      marginBottom: 10,
                    }}
                  >
                    {canEdit ? 'Edit Expense' : 'Expense Details'}
                  </Text>
                </View>
                {canEdit ? (
                  <>
                    <TextInput
                      style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        marginBottom: 10,
                        color: 'white',
                        borderRadius: 5,
                        paddingHorizontal: 10,
                      }}
                      placeholder='e.g., Dinner at restaurant'
                      placeholderTextColor={colors.gray.DEFAULT}
                      value={expense_title}
                      onChangeText={setExpenseTitle}
                    />
                    <TextInput
                      style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        marginBottom: 10,
                        color: 'white',
                        borderRadius: 5,
                        paddingHorizontal: 10,
                      }}
                      placeholder='$ 0.00'
                      placeholderTextColor={colors.gray.DEFAULT}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType='numeric'
                    />
                    <View style={{ marginBottom: 10 }}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.gray.DEFAULT,
                            fontSize: 16,
                          }}
                        >
                          Split Between
                        </Text>
                        <TouchableOpacity
                          style={{
                            marginLeft: 'auto',
                          }}
                          onPress={() =>
                            setSplitBetween(members.map((m: any) => m._id))
                          }
                        >
                          <Text
                            style={{
                              color: colors.primary.DEFAULT,
                            }}
                          >
                            Select all
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {members.map((member: any) => (
                        <TouchableOpacity
                          key={member._id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 5,
                          }}
                          onPress={() => {
                            if (member._id !== paid_by) {
                              setSplitBetween((prev) =>
                                prev.includes(member._id)
                                  ? prev.filter((id) => id !== member._id)
                                  : [...prev, member._id]
                              );
                            }
                          }}
                        >
                          <View
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              borderWidth: 2,
                              borderColor: colors.gray.DEFAULT,
                              marginRight: 10,
                              backgroundColor: split_between.includes(
                                member._id
                              )
                                ? colors.primary.DEFAULT
                                : 'transparent',
                            }}
                          />
                          <Text style={{ color: 'white' }}>
                            {member.fullname || member.username}
                          </Text>
                          {paid_by === member._id && (
                            <View
                              style={{
                                backgroundColor: colors.green[700],
                                borderRadius: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 1,
                                marginLeft: 8,
                              }}
                            >
                              <Text
                                style={{
                                  color: colors.transparent,
                                }}
                              >
                                Payer
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ color: 'white', marginBottom: 10 }}>
                      Title: {expense_title}
                    </Text>
                    <Text style={{ color: 'white', marginBottom: 10 }}>
                      Amount: ${Number(amount).toFixed(2)}
                    </Text>
                    <Text style={{ color: 'white', marginBottom: 10 }}>
                      Paid by:{' '}
                      {members.find((m: any) => m._id === paid_by)?.fullname ||
                        members.find((m: any) => m._id === paid_by)?.username}
                    </Text>
                    <Text style={{ color: 'white', marginBottom: 10 }}>
                      Split between:{' '}
                      {split_between
                        .map(
                          (id: string) =>
                            members.find((m: any) => m._id === id)?.fullname ||
                            members.find((m: any) => m._id === id)?.username
                        )
                        .join(', ')}
                    </Text>
                  </>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.gray[600],
                      padding: 10,
                      borderRadius: 5,
                      flex: 1,
                      marginRight: 5,
                    }}
                    onPress={() => {
                      setEditModalVisible(false);
                      resetForm();
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                  {canEdit && (
                    <>
                      <TouchableOpacity
                        style={{
                          backgroundColor: colors.primary.DEFAULT,
                          padding: 10,
                          borderRadius: 5,
                          flex: 1,
                          marginRight: 5,
                        }}
                        onPress={() => {
                          handleUpdateExpenseSubmit({
                            expense_title,
                            amount,
                            paid_by,
                            split_between,
                          });
                        }}
                      >
                        <Text style={{ color: 'white', textAlign: 'center' }}>
                          Update
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {canEdit && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.red[600],
                        padding: 10,
                        borderRadius: 5,
                      }}
                      onPress={() => {
                        handleDeleteExpenseSubmit(
                          editingExpenseId!,
                          expense_title
                        );
                      }}
                    >
                      <FontAwesome name='trash' size={20} color='white' />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })()}
      </Modal>
    </ScreenContainer>
  );
};

export default GroupDetailPage;
