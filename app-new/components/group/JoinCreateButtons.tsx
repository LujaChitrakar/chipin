import { ToastAndroid, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import { PlusCircle, UserRoundPlus } from 'lucide-react-native';
import colors from '@/assets/colors';

import {
  Text,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  useCreateGroup,
  useJoinGroupByGroupCode,
} from '@/services/api/groupApi';
import { Feather } from '@expo/vector-icons';
import { useGetMyFriends } from '@/services/api/friendsApi';
import { useQueryClient } from '@tanstack/react-query';
import QRScannerScreen from '../QrScannerScreen';
import JoinGroupModal from './JoinGroupModal';
import { router } from "expo-router";

const JoinCreateButton = () => {
  const { mutate: createGroup, isPending: creatingGroup } = useCreateGroup();
  const { mutate: joinGroup, isPending: joiningGroup } =
    useJoinGroupByGroupCode();
  const { data: myFriends, isLoading: myFriendsLoading } = useGetMyFriends({
    page: 1,
    limit: 5,
    q: '',
  });
  const queryClient = useQueryClient();

  const [availableMembers, setAvailableMembers] = useState([]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinGroupModal, setShowJoinGroupModal] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberEmails, setselectedMemberEmails] = useState<string[]>(
    []
  );

  useEffect(() => {
    setAvailableMembers(myFriends?.data || []);
  }, [myFriends]);

  const toggleMemberSelection = (memberEmail: string) => {
    setselectedMemberEmails((prev: any) =>
      prev.includes(memberEmail)
        ? prev.filter((id: string) => id !== memberEmail)
        : [...prev, memberEmail]
    );
  };

  const handleCreateGroup = () => {
    const groupData = {
      name: groupName,
      description: description,
      member_emails: selectedMemberEmails,
    };

    createGroup(groupData, {
      onSuccess: (response: any) => {
        setGroupName('');
        setDescription('');
        setselectedMemberEmails([]);
        setShowCreateDialog(false);

        queryClient.invalidateQueries({
          queryKey: ['my-groups'],
        });

        queryClient.invalidateQueries({
          queryKey: ['groupById'],
        });
        if (response?.data?._id) {
          router.replace(`/tabs/groups/${response?.data?._id}`)
        } else {
          router.replace("/tabs/groups/")
        }
      },
    });
  };

  const handleCancel = () => {
    setGroupName('');
    setDescription('');
    setselectedMemberEmails([]);
    setShowCreateDialog(false);
  };

  const renderAvatar = (friend: any) => {
    const initial = friend.fullname
      ? friend.fullname.charAt(0).toUpperCase()
      : friend.email.charAt(0).toUpperCase();
    return (
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.cardBackground.light,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.white, fontWeight: '600' }}>
          {initial}
        </Text>
      </View>
    );
  };

  const renderSelectedFriend = (friend: any, styles = {}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          width: '100%',
          backgroundColor: colors.cardBackground.dark,
          borderRadius: 10,
          paddingHorizontal: 15,
          gap: 10,
          ...styles,
        }}
      >
        {renderAvatar(friend)}
        <View>
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            {friend.fullname || friend.username}
          </Text>
          <Text style={{ color: colors.grayTextColor.DEFAULT }}>
            {friend.email}
          </Text>
        </View>
      </View>
    );
  };


  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          display: 'flex',
        }}
      >
        <Button
          title='Join Group'
          icon={<UserRoundPlus size={18} />}
          onPress={() => {
            setShowJoinGroupModal(true);
          }}
          style={{
            flex: 1,
          }}
        />
        <Button
          title='Create Group'
          icon={<PlusCircle color={colors.white} size={18} />}
          onPress={() => {
            setShowCreateDialog(true);
          }}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground.light,
          }}
          textColor={colors.white}
        />
      </View>

      {/* Create Group Dialog */}
      <Modal
        visible={showCreateDialog}
        transparent={true}
        animationType='fade'
        onRequestClose={handleCancel}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 500,
              maxHeight: '80%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 24,
                  fontWeight: 'bold',
                }}
              >
                Create New Group
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Feather
                  name='x'
                  size={24}
                  color={colors.grayTextColor.DEFAULT}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Group Name */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.grayTextColor.DEFAULT,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Group Name *
                </Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder='e.g., Weekend Trip, Apartment 4B'
                  placeholderTextColor={colors.grayTextColor.dark}
                  style={{
                    backgroundColor: colors.textInputBackground.DEFAULT,
                    color: colors.white,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                />
              </View>

              {/* Description */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.grayTextColor.DEFAULT,
                    fontWeight: '500',
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Description (optional)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder='What is this group for?'
                  placeholderTextColor={colors.grayTextColor.dark}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.textInputBackground.DEFAULT,
                    color: colors.white,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    textAlignVertical: 'top',
                    minHeight: 100,
                  }}
                />
              </View>

              {/* Add Members */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.grayTextColor.DEFAULT,
                    fontWeight: '500',
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Add Members (optional)
                </Text>
                <View
                  style={{
                    backgroundColor: colors.textInputBackground.DEFAULT,
                    borderRadius: 8,
                  }}
                >
                  
                  {availableMembers.map((member: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => toggleMemberSelection(member.email)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: selectedMemberEmails.includes(member.id)
                            ? colors.primary.DEFAULT
                            : colors.grayTextColor.dark,
                          backgroundColor: selectedMemberEmails.includes(
                            member.id
                          )
                            ? colors.primary.DEFAULT
                            : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {selectedMemberEmails.includes(member.email) && (
                          <Feather
                            name='check'
                            size={16}
                            color={colors.white}
                          />
                        )}
                      </View>
                      {
                        renderSelectedFriend(member, {
                          backgroundColor: colors.transparent,
                          paddingVertical: 0
                        })
                      }
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                marginTop: 24,
              }}
            >
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  backgroundColor: colors.cardBackground.light,
                  padding: 16,
                  borderRadius: 50,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateGroup}
                disabled={!groupName.trim() || creatingGroup}
                style={{
                  flex: 1,
                  backgroundColor:
                    !groupName.trim() || creatingGroup
                      ? colors.grayTextColor.DEFAULT
                      : colors.white,
                  padding: 16,
                  borderRadius: 50,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: colors.black,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {creatingGroup ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <JoinGroupModal
        visible={joinGroupModal}
        setVisible={setShowJoinGroupModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    color: colors.white,
    marginBottom: 12,
    fontWeight: '500',
  },
  emailInput: {
    backgroundColor: colors.cardBackground.dark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBackground.DEFAULT,
  },
  emailTextInput: {
    flex: 1,
    marginLeft: 12,
    color: colors.white,
    fontSize: 16,
  },
  orText: {
    color: colors.white,
    marginHorizontal: 'auto',
    marginVertical: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
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
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 16,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grayTextColor.DEFAULT,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  qrButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default JoinCreateButton;
