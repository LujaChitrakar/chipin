import {
  ToastAndroid,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import React, { useState } from 'react';
import Button from '../common/Button';
import {
  DollarSign,
  PlusCircle,
  TextQuote,
  UserRoundCheck,
  UserRoundSearch,
  X,
} from 'lucide-react-native';
import colors from '@/assets/colors';
import { useCreateSavingGroup } from '@/services/api/savingGroupApi';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';

const JoinCreateButton = () => {
  const { create: createSolanaWallet } = useEmbeddedSolanaWallet();

  const { mutate: createSavingGroup, isPending: creatingSavingGroup } =
    useCreateSavingGroup();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'Personal' | 'Group'>('Personal');
  const [formData, setFormData] = useState({
    savingsTitle: '',
    savingTarget: '',
    description: '',
    expectedMembers: '',
    threshold: '',
  });

  const handleCreateSavingGroup = async () => {
    if (!createSolanaWallet) {
      ToastAndroid.showWithGravity(
        'Solana wallet creation is not available.',
        ToastAndroid.BOTTOM+20,
        ToastAndroid.LONG
      );
      return;
    }

    const savingGroupData: any = {
      name: formData.savingsTitle,
      description: formData.description,
      target_saving: Number(formData.savingTarget),
      ...(activeTab === 'Group' && {
        expectedMembersCount: Number(formData.expectedMembers),
        threshold: Number(formData.threshold),
      }),
      group_type: activeTab === 'Personal' ? 'PERSONAL' : 'SQUAD',
    };

    const newWallet = await createSolanaWallet();

    if (!newWallet) {
      ToastAndroid.showWithGravity(
        'Failed to create Solana wallet.',
        ToastAndroid.BOTTOM+20,
        ToastAndroid.LONG
      );
      return;
    }

    console.log('New Solana Wallet Created:', newWallet?.toJSON());
    savingGroupData.saving_address =
      JSON.parse(newWallet.toJSON() || '{}')?.publicKey || '';

    createSavingGroup(savingGroupData, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setFormData({
          savingsTitle: '',
          savingTarget: '',
          description: '',
          expectedMembers: '',
          threshold: '',
        });
      },
      onError: (error: any) => {
        console.log('Error creating saving group:', error?.response?.data);
        ToastAndroid.showWithGravity(
          error?.response?.data?.message || 'Failed to create savings',
          ToastAndroid.BOTTOM+20,
          ToastAndroid.LONG
        );
      },
    });
  };

  const handleCancel = () => {
    setShowCreateDialog(false);
    setFormData({
      savingsTitle: '',
      savingTarget: '',
      description: '',
      expectedMembers: '',
      threshold: '',
    });
  };

  return (
    <>
      <View style={styles.buttonContainer}>
        <Button
          title='Create Savings'
          icon={<PlusCircle color={colors.white} size={18} />}
          onPress={() => setShowCreateDialog(true)}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground.light,
          }}
          textColor={colors.white}
        />
      </View>

      <Modal
        visible={showCreateDialog}
        transparent={true}
        animationType='fade'
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Savings</Text>
              <TouchableOpacity onPress={handleCancel}>
                <X size={24} color={colors.grayTextColor.DEFAULT} />
              </TouchableOpacity>
            </View>

            {/* Tab Header */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => setActiveTab('Personal')}
                style={[
                  styles.tab,
                  activeTab === 'Personal' && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Personal' && styles.activeTabText,
                  ]}
                >
                  Personal Savings
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('Group')}
                style={[styles.tab, activeTab === 'Group' && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Group' && styles.activeTabText,
                  ]}
                >
                  Group Savings
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <TextQuote size={24} color={colors.grayTextColor.DEFAULT} />
                <TextInput
                  style={styles.input}
                  placeholder='Savings Title'
                  placeholderTextColor={colors.grayTextColor.dark}
                  value={formData.savingsTitle}
                  onChangeText={(text) =>
                    setFormData({ ...formData, savingsTitle: text })
                  }
                />
              </View>

              {activeTab === 'Group' && (
                <>
                  <View style={styles.inputContainer}>
                    <UserRoundSearch
                      size={24}
                      color={colors.grayTextColor.DEFAULT}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Expected No. of Members'
                      placeholderTextColor={colors.grayTextColor.dark}
                      value={formData.expectedMembers}
                      onChangeText={(text) =>
                        setFormData({ ...formData, expectedMembers: text })
                      }
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <UserRoundCheck
                      size={24}
                      color={colors.grayTextColor.DEFAULT}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Threshold No.'
                      placeholderTextColor={colors.grayTextColor.dark}
                      value={formData.threshold}
                      onChangeText={(text) =>
                        setFormData({ ...formData, threshold: text })
                      }
                    />
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <DollarSign size={24} color={colors.grayTextColor.DEFAULT} />
                <TextInput
                  style={styles.input}
                  placeholder='Saving Target'
                  placeholderTextColor={colors.grayTextColor.dark}
                  value={formData.savingTarget}
                  onChangeText={(text) =>
                    setFormData({ ...formData, savingTarget: text })
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Description'
                  placeholderTextColor={colors.grayTextColor.dark}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleCreateSavingGroup}
                disabled={creatingSavingGroup}
                style={[
                  styles.confirmButton,
                  creatingSavingGroup && styles.confirmButtonDisabled,
                ]}
              >
                <Text style={styles.confirmButtonText}>
                  {creatingSavingGroup ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    display: 'flex',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground.dark,
    borderRadius: 12,
    padding: 8,
    gap: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    color: colors.grayTextColor.DEFAULT,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.black,
  },
  modalContent: {
    marginBottom: 24,
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.textInputBackground.DEFAULT,
  },
  input: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 8,
    padding: 10,
    color: colors.white,
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default JoinCreateButton;
