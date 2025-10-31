import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';
import { WalletMinimal } from 'lucide-react-native';
import GroupMembersChain from './GroupMembersChain';

const ExpenseCard = ({
  expense,
  groupMembers,
  canEditExpense,
  handleEditExpense,
}: {
  expense: any;
  groupMembers: any;
  handleEditExpense: (expense: any) => void;
  canEditExpense: (expense: any) => boolean;
}) => {
  return (
    <View
      key={expense._id}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        paddingHorizontal: 0,
        borderRadius: 8,
        gap: 10,
      }}
    >
      <View
        style={{
          backgroundColor: colors.background.DEFAULT,
          borderRadius: 50,
          padding: 10,
        }}
      >
        <WalletMinimal color={colors.white + '88'} size={24} />
      </View>
      <TouchableOpacity
        onPress={() => {
          handleEditExpense(expense);
        }}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 16,
              fontWeight: '500',
            }}
          >
            {expense.expense_title}
          </Text>
          <GroupMembersChain
            members={expense.split_between
              .map((id: string) => groupMembers.find((m: any) => m._id === id))
              .filter((m: any) => m)}
            circleSize={18}
            spread={5}
            styles={{
              paddingVertical: 2,
            }}
          />
        </View>
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
              color: colors.grayTextColor.DEFAULT,
              textAlign: 'right',
            }}
          >
            Expense amt.
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
                fontSize: 16,
              }}
            >
              $
            </Text>
            <Text
              style={{
                color: colors.primary[300],
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              {expense.amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ExpenseCard;
