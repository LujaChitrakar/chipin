import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import colors from '@/assets/colors';

interface EditExpenseModalProps {
  editModalVisible: boolean;
  setEditModalVisible: (visible: boolean) => void;
  expense_title: string;
  setExpenseTitle: (title: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  paid_by: string;
  split_between: string[];
  setSplitBetween: (split: string[]) => void;
  members: any[];
  editingExpenseId: string | null;
  canEditExpense: (expense: any) => boolean;
  handleUpdateExpenseSubmit: (formData: {
    expense_title: string;
    amount: string;
    paid_by: string;
    split_between: string[];
  }) => void;
  handleDeleteExpenseSubmit: (expenseId: string, expenseTitle: string) => void;
  resetForm: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  editModalVisible,
  setEditModalVisible,
  expense_title,
  setExpenseTitle,
  amount,
  setAmount,
  paid_by,
  split_between,
  setSplitBetween,
  members,
  editingExpenseId,
  canEditExpense,
  handleUpdateExpenseSubmit,
  handleDeleteExpenseSubmit,
  resetForm,
}) => {
  const canEdit = canEditExpense({ _id: editingExpenseId, paid_by });

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(!editModalVisible)}
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
              <Text style={{ color: 'white', textAlign: 'center' }}>Close</Text>
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
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.red[600],
                    padding: 10,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    handleDeleteExpenseSubmit(editingExpenseId!, expense_title);
                  }}
                >
                  <FontAwesome name='trash' size={20} color='white' />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditExpenseModal;
