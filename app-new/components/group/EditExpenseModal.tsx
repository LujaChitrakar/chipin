import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
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
      animationType='fade'
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(!editModalVisible)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {canEdit ? 'Edit Expense' : 'Expense Details'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditModalVisible(false);
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
            {canEdit ? (
              <>
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
                  {members.map((member: any) => (
                    <TouchableOpacity
                      key={member._id}
                      style={styles.memberItem}
                      onPress={() => {
                        if (member._id !== paid_by) {
                          setSplitBetween(
                            split_between.includes(member._id)
                              ? split_between.filter((id) => id !== member._id)
                              : [...split_between, member._id]
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
                          <Feather
                            name='check'
                            size={16}
                            color={colors.black}
                          />
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
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text
                  style={{
                    color: colors.white,
                    marginBottom: 10,
                    fontSize: 16,
                  }}
                >
                  Title: {expense_title}
                </Text>
                <Text
                  style={{
                    color: colors.white,
                    marginBottom: 10,
                    fontSize: 16,
                  }}
                >
                  Amount: ${Number(amount).toFixed(2)}
                </Text>
                <Text
                  style={{
                    color: colors.white,
                    marginBottom: 10,
                    fontSize: 16,
                  }}
                >
                  Paid by:{' '}
                  {members.find((m: any) => m._id === paid_by)?.fullname ||
                    members.find((m: any) => m._id === paid_by)?.username}
                </Text>
                <Text
                  style={{
                    color: colors.white,
                    marginBottom: 10,
                    fontSize: 16,
                  }}
                >
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
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => {
                setEditModalVisible(false);
                resetForm();
              }}
              style={styles.cancelButton}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            {canEdit && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    handleUpdateExpenseSubmit({
                      expense_title,
                      amount,
                      paid_by,
                      split_between,
                    });
                  }}
                  style={[
                    styles.confirmButton,
                    (!expense_title.trim() || !amount.trim()) &&
                      styles.confirmButtonDisabled,
                  ]}
                  activeOpacity={0.8}
                  disabled={!expense_title.trim() || !amount.trim()}
                >
                  <Text style={styles.confirmButtonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    handleDeleteExpenseSubmit(editingExpenseId!, expense_title);
                  }}
                  activeOpacity={0.8}
                >
                  <FontAwesome name='trash' size={20} color={colors.white} />
                </TouchableOpacity>
              </>
            )}
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
    backgroundColor: colors.textInputBackground.DEFAULT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray.DEFAULT,
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.grayTextColor.DEFAULT,
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: colors.red[600],
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EditExpenseModal;
