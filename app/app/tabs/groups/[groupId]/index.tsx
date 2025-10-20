import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  ToastAndroid,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useAddExpense,
  useAddGroupPayment,
  useDeleteExpense,
  useGetGroupById,
  useUpdateExpense,
} from '@/services/api/groupApi';
import { useGetMyProfile } from '@/services/api/authApi';
import { useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/expo';
import GroupTabBar from '@/components/group/GroupTabBar';
import GroupTabContent from '@/components/group/GroupTabContent';
import AddExpenseModal from '@/components/group/AddExpenseModal';
import EditExpenseModal from '@/components/group/EditExpenseModal';
import GroupHeader from '@/components/group/GroupHeader';
import { AntDesign } from '@expo/vector-icons';
import colors from '@/assets/colors';

const GroupDetailPage = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const { data: groupData, isLoading: groupDataLoading } =
    useGetGroupById(groupId);
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const { mutate: addExpense, isPending: addingExpense } = useAddExpense();
  const { mutate: addPayment, isPending: addingPayment } = useAddGroupPayment();
  /*
  add payment should be passed the follwing type of data:

  {
    groupId:string,
    paymentData: {
      amount: number,
      transactionId: string, // some unique id for the wallet transaction
      paid_by:  string, the user id of the paid by user (_id)
      paid_to:  string, the user id of the paid by user (_id)

      paid_by_address: string, // wallet address
      paid_to_address: string, // wallet address
    }
  }
  */
  const { mutate: updateExpense, isPending: updatingExpense } =
    useUpdateExpense();
  const { mutate: deleteExpense, isPending: deletingExpense } =
    useDeleteExpense();
  const { user } = usePrivy();

  const [activeTab, setActiveTab] = useState('Expenses');
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

  console.log('GROUP DATA:::', JSON.stringify(groupData, null, 2));
  console.log('PRIVY USER:::', JSON.stringify(user, null, 2));
  const allBalances =
    (groupData?.data?.balances &&
      groupData?.data?.balances[myProfile?.data?._id || '--']) ||
    {};

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
        backButton={true}
        title={groupData?.data?.name || groupId}
        groupData={groupData}
        onBackPress={() => router.back()}
        showQr={true}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: [groupId],
              });
            }}
            refreshing={groupDataLoading}
          />
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
        <View>
          <GroupTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
          <GroupTabContent
            activeTab={activeTab}
            expenses={expenses}
            members={members}
            allBalances={allBalances}
            myProfile={myProfile}
            handleEditExpense={handleEditExpense}
            canEditExpense={canEditExpense}
            addPayment={addPayment}
            groupId={groupId}
          />
        </View>
      </ScrollView>
      <AddExpenseModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        expense_title={expense_title}
        setExpenseTitle={setExpenseTitle}
        amount={amount}
        setAmount={setAmount}
        paid_by={paid_by}
        split_between={split_between}
        setSplitBetween={setSplitBetween}
        members={members}
        handleAddExpenseSubmit={handleAddExpenseSubmit}
        resetForm={resetForm}
      />
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
        handleDeleteExpenseSubmit={handleDeleteExpenseSubmit}
        resetForm={resetForm}
      />
    </ScreenContainer>
  );
};

export default GroupDetailPage;
