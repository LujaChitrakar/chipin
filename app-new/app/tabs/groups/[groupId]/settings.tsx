import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useGetMyFriends } from '@/services/api/friendsApi';
import { useGetGroupById, useUpdateGroup } from '@/services/api/groupApi';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import colors from '@/assets/colors';
import { useQueryClient } from '@tanstack/react-query';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import { useGetMyProfile } from "@/services/api/authApi";

const GroupSettings = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const queryClient = useQueryClient();

  const {
    data: myProfile,
    isLoading: myProfileLoading
  } = useGetMyProfile();

  const { data: groupData, isLoading: groupDataLoading } =
    useGetGroupById(groupId);
  const { mutate: updateGroup, isPending: updatingGroup } = useUpdateGroup();

  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const { data: friendsData, isLoading: friendsLoading } = useGetMyFriends({
    page: 1,
    limit: 50,
    q: friendSearchQuery,
  });

  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customInvitedEmail, setCustomInvitedEmail] = useState(''); // ← NEW: tracks valid custom email

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    if (groupData?.data) {
      setGroupName(groupData?.data.name);
      setAdminIds(groupData.data?.member_admins || []);
      setSelectedMembers(groupData?.data?.members.map((m: any) => ({ ...m })));
    }
  }, [navigation, groupData]);

  useEffect(() => {
    const email = friendSearchQuery?.toLowerCase()?.trim();
    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      friendsData?.data?.some((fr: any) => fr.email.toLowerCase() === email) ||
      groupData?.data?.member_emails?.some(
        (e: string) => e.toLowerCase() === email
      ) ||
      selectedMembers.some((m: any) => m.email.toLowerCase() === email)
    ) {
      setCustomInvitedEmail('');
      return;
    }
    setCustomInvitedEmail(email);
  }, [friendSearchQuery, friendsData, groupData, selectedMembers]);

  const currentUserId = myProfile?.data?._id;
  const isAdmin = groupData?.data?.member_admins?.includes(currentUserId);

  const handleAddMember = (member: any) => {
    const email = member.email;
    if (
      !selectedMembers.some(
        (m: any) => m.email.toLowerCase() === email.toLowerCase()
      ) &&
      email
    ) {
      setSelectedMembers([...selectedMembers, member]);
      setFriendSearchQuery('');
      setShowAddModal(false);
    }
  };

  const handleInviteCustomEmail = () => {
    if (!customInvitedEmail) return;

    const tempInvite = {
      email: customInvitedEmail,
      fullname: '',
      username: '',
    };

    setSelectedMembers((prev) => [...prev, tempInvite]);
    setFriendSearchQuery('');
    setShowAddModal(false);
    setCustomInvitedEmail('');
  };

  const handleRemoveMember = (member: any) => {
    const newSelected = selectedMembers.filter(
      (m: any) => m.email.toLowerCase() !== member.email.toLowerCase()
    );
    setSelectedMembers(newSelected);
    setAdminIds(
      adminIds.filter((id: string) =>
        newSelected.some((m: any) => m._id === id)
      )
    );
  };

  const handleToggleAdmin = (memberId: string) => {
    if (adminIds.includes(memberId)) {
      setAdminIds(adminIds.filter((id) => id !== memberId));
    } else {
      setAdminIds([...adminIds, memberId]);
    }
  };

  const handleSaveSettings = () => {
    const allEmails = selectedMembers
      .map((m: any) => m.email)
      .filter((email): email is string => !!email);

    updateGroup(
      {
        groupId,
        data: {
          name: groupName,
          member_emails: allEmails,
          member_admins: adminIds,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['group', groupId] });
          ToastAndroid.showWithGravity('Group settings updated successfully', ToastAndroid.LONG, ToastAndroid.BOTTOM+10);
        },
        onError: (error: any) => {
          console.log('ERROR UPDATING GROUP:', error?.response?.data);
          Alert.alert('Error', 'Failed to update group settings');
        },
      }
    );
  };

  const invitedEmails =
    groupData?.data?.member_emails?.filter(
      (email: string) =>
        !groupData?.data?.members.some(
          (member: any) => member.email.toLowerCase() === email.toLowerCase()
        )
    ) || [];

  if (groupDataLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={colors.white} />
        <Text style={{ color: colors.white, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  const renderAvatar = (friend: any, size = 40) => {
    const initial = friend.fullname
      ? friend.fullname.charAt(0).toUpperCase()
      : friend.email.charAt(0).toUpperCase();

    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
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

  const MemberItem = ({
    member,
    isSelected,
    onRemove,
    onToggleAdmin,
  }: {
    member: any;
    isSelected?: boolean;
    onRemove?: () => void;
    onToggleAdmin?: () => void;
  }) => {
    const isCurrentAdmin = member._id && adminIds.includes(member._id);

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: colors.cardBackground.dark,
          borderRadius: 12,
          marginBottom: 8,
        }}
      >
        {renderAvatar(member)}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            {member.fullname || member.username || member.email}
          </Text>
          <Text style={{ color: colors.grayTextColor.DEFAULT, fontSize: 13 }}>
            {member.email}
          </Text>
        </View>

        {isAdmin && isSelected && onToggleAdmin && member._id && (
          <TouchableOpacity
            onPress={onToggleAdmin}
            style={{
              backgroundColor: isCurrentAdmin
                ? colors.white
                : colors.cardBackground.light,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: isCurrentAdmin ? colors.black : colors.white,
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {isCurrentAdmin ? 'Admin' : 'Make Admin'}
            </Text>
          </TouchableOpacity>
        )}

        {isAdmin && onRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Ionicons
              name='close-circle'
              size={24}
              color={colors.grayTextColor.DEFAULT}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title='Group Settings'
        onBackPress={() => {
          router.back();
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Group Name */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.grayTextColor.dark, marginBottom: 6 }}>
            Group Name
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.cardBackground.DEFAULT,
              color: colors.white,
              padding: 14,
              borderRadius: 12,
              fontSize: 16,
            }}
            value={groupName}
            onChangeText={setGroupName}
            placeholder='Enter group name'
            placeholderTextColor={colors.grayTextColor.DEFAULT}
            editable={isAdmin}
          />
        </View>

        {/* Members Section */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: colors.grayTextColor.dark, fontWeight: '600' }}
            >
              Members ({selectedMembers.length + invitedEmails.length})
            </Text>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={{
                  backgroundColor: colors.white,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <AntDesign name='plus' size={16} color={colors.black} />
                <Text style={{ color: colors.black, fontWeight: '600' }}>
                  Add
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            {/* Selected members (including temp invites) */}
            {selectedMembers.map((member, index) => (
              <MemberItem
                key={index}
                member={member}
                isSelected
                onRemove={
                  isAdmin ? () => handleRemoveMember(member) : undefined
                }
                onToggleAdmin={
                  isAdmin && member._id
                    ? () => handleToggleAdmin(member._id)
                    : undefined
                }
              />
            ))}

            {/* Invited emails from server (not in selectedMembers) */}
            {invitedEmails.map((email: string) => (
              <View
                key={email}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: colors.cardBackground.dark,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.grayTextColor.DEFAULT,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.white, fontWeight: '600' }}>
                    ?
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      color: colors.grayTextColor.DEFAULT,
                      fontStyle: 'italic',
                    }}
                  >
                    {email}
                  </Text>
                  <Text
                    style={{
                      color: colors.grayTextColor.DEFAULT,
                      fontSize: 12,
                    }}
                  >
                    Invited
                  </Text>
                </View>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => {
                      const newEmails =
                        groupData?.data?.member_emails?.filter(
                          (e: string) => e.toLowerCase() !== email.toLowerCase()
                        ) || [];
                      updateGroup(
                        {
                          groupId,
                          data: {
                            name: groupName,
                            member_emails: newEmails,
                            member_admins: adminIds,
                          },
                        },
                        {
                          onSuccess: () =>
                            queryClient.invalidateQueries({
                              queryKey: ['group', groupId],
                            }),
                        }
                      );
                    }}
                  >
                    <Ionicons
                      name='close-circle'
                      size={24}
                      color={colors.grayTextColor.DEFAULT}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        {isAdmin && (
          <TouchableOpacity
            onPress={handleSaveSettings}
            disabled={updatingGroup}
            style={{
              backgroundColor: colors.white,
              paddingVertical: 14,
              borderRadius: 50,
              alignItems: 'center',
              marginBottom: 30,
            }}
          >
            {updatingGroup ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={{ color: colors.black, fontWeight: '600' }}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Member Modal */}
      <Modal visible={showAddModal} transparent animationType='fade'>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 24,
              padding: 24,
              maxHeight: '80%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: colors.white, fontSize: 20, fontWeight: '700' }}
              >
                Add Member
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name='close' size={28} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={{ marginTop: 16, position: 'relative' }}>
              <TextInput
                style={{
                  backgroundColor: colors.cardBackground.dark,
                  color: colors.white,
                  padding: 14,
                  borderRadius: 12,
                  paddingLeft: 44,
                }}
                placeholder='Search friends or enter email...'
                placeholderTextColor={colors.grayTextColor.DEFAULT}
                value={friendSearchQuery}
                onChangeText={setFriendSearchQuery}
                autoCapitalize='none'
                keyboardType='email-address'
              />
              <Ionicons
                name='search'
                size={20}
                color={colors.grayTextColor.DEFAULT}
                style={{ position: 'absolute', left: 14, top: 16 }}
              />
            </View>

            {/* Custom email invite button */}
            {customInvitedEmail ? (
              <TouchableOpacity
                onPress={handleInviteCustomEmail}
                style={{
                  backgroundColor: colors.cardBackground.light,
                  padding: 12,
                  borderRadius: 12,
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name='mail' size={20} color={colors.white} />
                <Text style={{ color: colors.white }}>
                  Invite {customInvitedEmail}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Friends List */}
            <FlatList
              data={friendsData?.data?.filter(
                (f: any) =>
                  !selectedMembers.some(
                    (m: any) => m.email.toLowerCase() === f.email.toLowerCase()
                  )
              )}
              keyExtractor={(item) => item._id}
              style={{ marginTop: 16 }}
              ListEmptyComponent={
                friendsLoading ? (
                  <ActivityIndicator
                    color={colors.white}
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <Text
                    style={{
                      color: colors.grayTextColor.DEFAULT,
                      textAlign: 'center',
                      marginTop: 20,
                    }}
                  >
                    No friends found
                  </Text>
                )
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAddMember(item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                  }}
                >
                  {renderAvatar(item, 36)}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ color: colors.white, fontWeight: '600' }}>
                      {item.fullname || item.username}
                    </Text>
                    <Text style={{ color: colors.grayTextColor.DEFAULT }}>
                      {item.email}
                    </Text>
                  </View>
                  <AntDesign
                    name='plus-circle'
                    size={22}
                    color={colors.white}
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default GroupSettings;
