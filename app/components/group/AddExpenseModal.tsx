import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import colors from '@/assets/colors';

interface AddExpenseModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  expense_title: string;
  setExpenseTitle: (title: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  paid_by: string;
  split_between: string[];
  setSplitBetween: (split: string[]) => void;
  members: any[];
  handleAddExpenseSubmit: (formData: {
    expense_title: string;
    amount: string;
    paid_by: string;
    split_between: string[];
  }) => void;
  resetForm: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  modalVisible,
  setModalVisible,
  expense_title,
  setExpenseTitle,
  amount,
  setAmount,
  paid_by,
  split_between,
  setSplitBetween,
  members,
  handleAddExpenseSubmit,
  resetForm,
}) => {
  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
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
                onPress={() => setSplitBetween(members.map((m: any) => m._id))}
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
  );
};

export default AddExpenseModal;
