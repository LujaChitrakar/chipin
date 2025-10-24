import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';

const ExpenseCard = ({
  expense,
  groupMembers,
  canEditExpense,
  handleEditExpense,
}: {
  expense: any;
  groupMembers: any;
  canEditExpense: any;
  handleEditExpense: any;
}) => {
  return (
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
            {groupMembers.find((m: any) => m._id === expense.paid_by)
              ?.fullname ||
              groupMembers.find((m: any) => m._id === expense.paid_by)
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
  );
};

export default ExpenseCard;
