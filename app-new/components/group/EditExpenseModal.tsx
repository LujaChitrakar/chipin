import React, { useState } from 'react';
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
import Button from '../common/Button';

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
  editingExpense?: boolean;
  handleDeleteExpenseSubmit: (expenseId: string, expenseTitle: string) => void;
  deletingExpense?: boolean;
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
  editingExpense,
  handleDeleteExpenseSubmit,
  deletingExpense,
  resetForm,
}) => {
  const canEdit = canEditExpense({ _id: editingExpenseId, paid_by });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const onDeletePress = () => setShowDeleteConfirm(true);
  const onCancelDelete = () => setShowDeleteConfirm(false);
  const onConfirmDelete = () => {
    setShowDeleteConfirm(false);
    handleDeleteExpenseSubmit(editingExpenseId!, expense_title);
  };

  return (
    <>
      {/* ---------- MAIN EDIT / VIEW MODAL ---------- */}
      <Modal
        animationType='fade'
        transparent
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
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

            {/* Content */}
            <View style={styles.modalContent}>
              {canEdit ? (
                <>
                  {/* Title */}
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
                          setSplitBetween(members.map((m) => m._id))
                        }
                      >
                        <Text style={styles.selectAllText}>Select all</Text>
                      </TouchableOpacity>
                    </View>

                    {members.map((member) => (
                      <TouchableOpacity
                        key={member._id}
                        style={styles.memberItem}
                        onPress={() => {
                          if (member._id !== paid_by) {
                            setSplitBetween(
                              split_between.includes(member._id)
                                ? split_between.filter(
                                    (id) => id !== member._id
                                  )
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
                            flexDirection: 'row',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: colors.white, fontSize: 16 }}>
                            {member.fullname || member.username}
                          </Text>
                          {paid_by === member._id && (
                            <View
                              style={{
                                backgroundColor: colors.green[700],
                                borderRadius: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 1,
                              }}
                            >
                              <Text
                                style={{ color: colors.white, fontSize: 12 }}
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
                /* ---------- READ-ONLY VIEW ---------- */
                <>
                  <Text style={styles.readOnlyLine}>
                    Title: {expense_title}
                  </Text>
                  <Text style={styles.readOnlyLine}>
                    Amount: ${Number(amount).toFixed(2)}
                  </Text>
                  <Text style={styles.readOnlyLine}>
                    Paid by:{' '}
                    {members.find((m) => m._id === paid_by)?.fullname ||
                      members.find((m) => m._id === paid_by)?.username}
                  </Text>
                  <Text style={styles.readOnlyLine}>
                    Split between:{' '}
                    {split_between
                      .map(
                        (id) =>
                          members.find((m) => m._id === id)?.fullname ||
                          members.find((m) => m._id === id)?.username
                      )
                      .join(', ')}
                  </Text>
                </>
              )}
            </View>

            {/* Footer Actions */}
            <View style={styles.modalActions}>
              <Button
                title='Close'
                onPress={() => {
                  setEditModalVisible(false);
                  resetForm();
                }}
                style={styles.cancelButton}
                textColor={colors.white}
              />

              {canEdit && (
                <>
                  <Button
                    loading={editingExpense}
                    title='Update'
                    onPress={() =>
                      handleUpdateExpenseSubmit({
                        expense_title,
                        amount,
                        paid_by,
                        split_between,
                      })
                    }
                    style={{
                      ...styles.confirmButton,
                      ...((!expense_title.trim() || !amount.trim()) &&
                        styles.confirmButtonDisabled),
                    }}
                    disabled={
                      !expense_title.trim() || !amount.trim() || editingExpense
                    }
                  />

                  <Button
                    icon={
                      <FontAwesome
                        name='trash'
                        size={20}
                        color={colors.white}
                      />
                    }
                    loading={deletingExpense}
                    title=''
                    style={styles.deleteButton}
                    onPress={onDeletePress}
                    disabled={deletingExpense || editingExpense}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
      <Modal
        transparent
        visible={showDeleteConfirm}
        animationType='fade'
        onRequestClose={onCancelDelete}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmTitle}>Delete Expense</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete **{expense_title}**? This action
              cannot be undone.
            </Text>

            <View style={styles.confirmActions}>
              <Button
                title='Cancel'
                onPress={onCancelDelete}
                style={styles.cancelConfirmBtn}
                textColor={colors.white}
              />
              <Button
                title='Delete'
                onPress={onConfirmDelete}
                loading={deletingExpense}
                style={styles.deleteConfirmBtn}
                textColor={colors.white}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* -------------------------- STYLES --------------------------------- */
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  modalContent: { padding: 20 },
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
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.grayTextColor.DEFAULT,
    opacity: 0.5,
  },
  deleteButton: {
    backgroundColor: colors.red[600],
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ---- Read-only lines ---- */
  readOnlyLine: {
    color: colors.white,
    marginBottom: 10,
    fontSize: 16,
  },

  /* ---- Delete Confirmation Modal ---- */
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmContainer: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: colors.grayTextColor.DEFAULT,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelConfirmBtn: {
    flex: 1,
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 14,
    borderRadius: 50,
  },
  deleteConfirmBtn: {
    flex: 1,
    backgroundColor: colors.red[600],
    paddingVertical: 14,
    borderRadius: 50,
  },
});

export default EditExpenseModal;
