import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '@/assets/colors';
import Button from '../common/Button';

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
  addingExpense?: boolean;
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
  addingExpense,
  resetForm,
}) => {
  const renderMember = (member: any) => {
    if (!member) return null;
    return (
      <TouchableOpacity
        key={member._id}
        style={styles.memberItem}
        onPress={() => {
          if (member._id !== paid_by) {
            setSplitBetween(
              split_between.includes(member._id)
                ? split_between.filter((id) => id !== member._id.toString())
                : [...split_between, member._id?.toString()]
            );
          }
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: split_between.includes(member._id)
              ? colors.primary.DEFAULT
              : colors.grayTextColor.dark,
            backgroundColor: split_between.includes(member._id)
              ? colors.primary.DEFAULT
              : 'transparent',
            marginRight: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {split_between.includes(member._id) && (
            <Feather name='check' size={16} color={colors.black} />
          )}
        </View>
        <View
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 16,
              marginBottom: 2,
            }}
          >
            {member.fullname || member.username}
          </Text>
          {paid_by === member._id && (
            <View
              style={{
                backgroundColor: colors.green[700],
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'nowrap',
              }}
            >
              <Text
                style={{
                  lineHeight: 20,
                  color: colors.white,
                  fontSize: 12,
                  flex: 1,
                  minWidth: 30,
                }}
              >
                Payer
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
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

          {/* Modal Content */}
          <View style={styles.modalContent}>
            {/* Expense Title */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Expense Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder='e.g., Dinner at restaurant'
                placeholderTextColor={colors.grayTextColor.dark}
                value={expense_title}
                onChangeText={setExpenseTitle}
              />
            </View>

            {/* Amount */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Amount *</Text>
              <TextInput
                style={styles.textInput}
                placeholder='$ 0.00'
                placeholderTextColor={colors.grayTextColor.dark}
                value={amount}
                onChangeText={setAmount}
                keyboardType='numeric'
              />
            </View>

            {/* Split Between */}
            <View style={{ marginBottom: 20 }}>
              <View style={styles.splitHeader}>
                <Text style={styles.inputLabel}>Split Between</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSplitBetween(members.map((m: any) => m._id))
                  }
                >
                  <Text style={styles.selectAllText}>Select all</Text>
                </TouchableOpacity>
              </View>
              {renderMember(members.find((member) => member._id === paid_by))}
              {members.map((member: any) =>
                paid_by === member._id ? null : renderMember(member)
              )}
            </View>
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <Button
              title='Cancel'
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              style={styles.cancelButton}
              textColor={colors.white}
            ></Button>
            <Button
              loading={addingExpense}
              title='Add Expense'
              onPress={() => {
                handleAddExpenseSubmit({
                  expense_title,
                  amount,
                  paid_by,
                  split_between,
                });
              }}
              style={{
                ...styles.confirmButton,
                ...((!expense_title.trim() || !amount.trim()) &&
                  styles.confirmButtonDisabled),
              }}
              disabled={
                !expense_title.trim() || !amount.trim() || addingExpense
              }
            />
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
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.textInputBackground.DEFAULT,
    color: colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.gray[600] || '#475569',
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 14,
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
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.white + '99',
  },
  confirmButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddExpenseModal;
