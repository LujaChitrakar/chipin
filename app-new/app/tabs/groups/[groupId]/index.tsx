import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { useAddExpense, useGetGroupById } from '@/services/api/groupApi';
import { useGetMyProfile } from '@/services/api/authApi';
import { useQueryClient } from '@tanstack/react-query';
import colors from '@/assets/colors';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import GroupMembersChain from '@/components/group/GroupMembersChain';
import Button from '@/components/common/Button';
import { PlusCircle, Settings } from 'lucide-react-native';
import GroupDetailsPageHeader from '@/components/group/GroupDetailsHeader';
import GroupQrButton from '@/components/group/GroupQrButton';
import AddExpenseModal from '@/components/group/AddExpenseModal';
import GroupDetailsTabs from '@/components/group/GroupDetailsTabs';
const { useNavigation } = require('@react-navigation/native');

const GroupDetailPage = () => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const queryClient = useQueryClient();
  const { data: groupData, isLoading: groupDataLoading } =
    useGetGroupById(groupId);
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const { mutate: addExpense, isPending: addingExpense } = useAddExpense();

  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [expense_title, setExpenseTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paid_by, setPaidBy] = useState('');
  const [split_between, setSplitBetween] = useState<string[]>([]);

  useEffect(() => {
    setPaidBy(myProfile?.data?._id);
    setSplitBetween([myProfile?.data?._id, ...split_between]);
  }, [myProfile?.data?._id]);

  const members = groupData?.data?.members || [];

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
          setAddExpenseModalVisible(false);
          resetForm();

          queryClient.invalidateQueries({
            queryKey: [groupId, 'groupById'],
          });
          queryClient.invalidateQueries({
            queryKey: ['user-by-id'],
          });
          queryClient.invalidateQueries({
            queryKey: ['recent-activities'],
          });
        },
        onError: (error: any) => {
          console.log('ERROR ADDING EXPENSE:', error?.response?.data);
          Alert.alert(
            'Error adding expense',
            error?.response?.message || 'Error adding expense'
          );
        },
      }
    );
  };

  const resetForm = () => {
    setExpenseTitle('');
    setAmount('');
    setPaidBy(myProfile?.data?._id);
    setSplitBetween([myProfile?.data?._id]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title={groupData?.data?.name || 'Group Details'}
        onBackPress={() => router.back()}
        rightElement={
          groupData?.data?._id && (
            <TouchableOpacity
              onPress={() => {
                router.push(`/tabs/groups/${groupData?.data?._id}/settings`);
              }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: colors.cardBackground.DEFAULT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={24} color={colors.cardBackground.light} />
            </TouchableOpacity>
          )
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: [groupId, 'groupById'],
              });
              queryClient.invalidateQueries({
                queryKey: ['wallet-balance'],
              });
            }}
            refreshing={groupDataLoading}
          />
        }
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <GroupMembersChain members={groupData?.data?.members || []} />
            <Text
              style={{
                color: colors.white,
                fontSize: 16,
                textDecorationLine: 'underline',
                marginLeft: 8,
              }}
            >
              {groupData?.data?.members?.length} members
            </Text>
            <View style={{ flex: 1 }}></View>
            <GroupQrButton groupData={groupData} />
          </View>
          <GroupDetailsPageHeader groupData={groupData} />
          <Button
            title='Add Expense'
            icon={<PlusCircle color={colors.white} size={18} />}
            style={{
              backgroundColor: colors.grayTextColor.DEFAULT,
            }}
            onPress={() => {
              setAddExpenseModalVisible(true);
            }}
            textColor={colors.white}
          />
          <View
            style={{
              width: '100%',
              height: 1.5,
              backgroundColor: colors.white + '11',
              marginVertical: 10,
            }}
          />

          <GroupDetailsTabs />
        </View>
      </ScrollView>
      <AddExpenseModal
        modalVisible={addExpenseModalVisible}
        setModalVisible={setAddExpenseModalVisible}
        expense_title={expense_title}
        setExpenseTitle={setExpenseTitle}
        amount={amount}
        setAmount={setAmount}
        paid_by={paid_by}
        split_between={split_between}
        setSplitBetween={setSplitBetween}
        members={members}
        handleAddExpenseSubmit={handleAddExpenseSubmit}
        addingExpense={addingExpense}
        resetForm={resetForm}
      />
    </ScreenContainer>
  );
};

export default GroupDetailPage;
