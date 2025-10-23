import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Image,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useGetMyFriends } from '@/services/api/friendsApi';
import { useGetGroupById, useUpdateGroup } from '@/services/api/groupApi';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import colors from '@/assets/colors';
import { useQueryClient } from '@tanstack/react-query';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ScreenContainer';
import { LinearGradient } from 'expo-linear-gradient';

const GroupSettings = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const queryClient = useQueryClient();
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
  const [newAddingCustomEmail, setNewAddingCustomEmail] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    if (groupData?.data) {
      setGroupName(groupData.data.name);
      setAdminIds(groupData.data.member_admins);
      setSelectedMembers(groupData.data.members.map((m: any) => ({ ...m })));
    }
  }, [navigation, groupData]);

  useEffect(() => {
    const emailExtracted = friendSearchQuery?.toLowerCase()?.trim();
    if (
      !emailExtracted ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailExtracted) ||
      friendsData?.data?.find((fr: any) => fr.email === emailExtracted) ||
      groupData?.data?.member_emails?.includes(emailExtracted) ||
      friendsData?.data?.find((fr: any) => fr.email === emailExtracted)
    ) {
      setNewAddingCustomEmail('');
      return;
    }
    setNewAddingCustomEmail(emailExtracted);
  }, [friendSearchQuery]);

  const isAdmin = groupData?.data?.member_admins.includes(
    groupData?.data?.members.find(
      (m: any) => m._id === groupData?.data?.created_by
    )?._id
  );

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
    updateGroup(
      {
        groupId,
        data: {
          name: groupName,
          member_emails: selectedMembers.map((m: any) => m.email),
          member_admins: adminIds,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['group', groupId] });
          Alert.alert('Success', 'Group settings updated successfully');
          queryClient.invalidateQueries({
            queryKey: ['group', groupId],
          });
        },
        onError: (error: any) => {
          console.log('ERROR UPDATING GROUP:', error?.response?.data);
          Alert.alert('Error', 'Failed to update group settings');
          queryClient.invalidateQueries({
            queryKey: ['group', groupId],
          });
        },
      }
    );
  };

  // Identify invited emails (in member_emails but not in members)
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
        <Text style={{ color: 'white', textAlign: 'center' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <LinearGradient
        colors={['#1a9b8e', '#16857a', '#137066']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        {/* Top Row - Title and Profile */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left - Back Button + Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
              style={{ marginRight: 12 }}
            >
              <Ionicons name='arrow-back' size={24} color='#ffffff' />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: '#ffffff',
                letterSpacing: 0.5,
              }}
            >
              Group Settings
            </Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView style={{ paddingHorizontal: 8 }}>
        <Text
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          Group Name
        </Text>
        <TextInput
          style={{
            backgroundColor: '#2a3b4d',
            color: 'white',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
          value={groupName}
          onChangeText={setGroupName}
          placeholder='Enter group name'
          placeholderTextColor={colors.gray.DEFAULT}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            Members
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <AntDesign name='plus' size={24} color='white' />
          </TouchableOpacity>
        </View>
        <View style={{ marginBottom: 16 }}>
          {selectedMembers.map((member: any) => (
            <TouchableOpacity
              key={member._id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2a3b4d',
                padding: 12,
                borderRadius: 8,
                marginBottom: 4,
              }}
              onPress={() => {
                handleAddMember(member);
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.gray[700],
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                  overflow: 'hidden',
                }}
              >
                {member.profile_picture ? (
                  <Image
                    source={{ uri: member.profile_picture }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                    resizeMode='cover'
                  />
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}
                  >
                    {(member.fullname ||
                      member.username ||
                      member.email)[0]?.toUpperCase()}
                  </Text>
                )}
              </View>
              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  {member.fullname || member.username || member.email}
                </Text>
                <Text style={{ color: colors.gray.DEFAULT, fontSize: 13 }}>
                  {member.email}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Invited Emails Section */}
        {invitedEmails.length > 0 && (
          <>
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 8,
              }}
            >
              Invited Emails
            </Text>
            <View
              style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}
            >
              {invitedEmails.map((email: string) => (
                <View
                  key={email}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#2a3b4d',
                    padding: 8,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: 'white' }}>{email}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveMember({ email, _id: 'invited' })
                    }
                  ></TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {isAdmin && (
          <>
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 8,
              }}
            >
              Admins
            </Text>
            {selectedMembers
              .filter((member: any) => member._id)
              .map((member: any) => (
                <View
                  key={member._id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#2a3b4d',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: 'white' }}>
                    {member.fullname || member.username || member.email}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleToggleAdmin(member._id)}
                    style={{
                      backgroundColor: adminIds.includes(member._id)
                        ? colors.green[700]
                        : colors.gray[600],
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: 'white' }}>
                      {adminIds.includes(member._id) ? 'Admin' : 'Make Admin'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
          </>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary.DEFAULT,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
          }}
          onPress={handleSaveSettings}
          disabled={updatingGroup}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {updatingGroup ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        animationType='none'
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#1a252f',
              borderRadius: 12,
              padding: 16,
              width: '90%',
              maxHeight: '80%',
              minHeight: '50%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: '600',
                }}
              >
                Add Members
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <AntDesign name='close' size={24} color='white' />
              </TouchableOpacity>
            </View>
            <TextInput
              style={{
                backgroundColor: '#2a3b4d',
                color: 'white',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}
              value={friendSearchQuery}
              onChangeText={setFriendSearchQuery}
              placeholder='Search friends or enter email'
              placeholderTextColor={colors.gray.DEFAULT}
            />
            {newAddingCustomEmail && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.gray[800],
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 4,
                }}
                onPress={() => {
                  handleAddMember({
                    email: newAddingCustomEmail,
                    _id: 'custom',
                  });
                }}
              >
                <Text
                  style={{ color: 'white', textDecorationLine: 'underline' }}
                >
                  {newAddingCustomEmail}
                  {'(Add as new email)'}
                </Text>
              </TouchableOpacity>
            )}
            <FlatList
              data={friendsData?.data}
              keyExtractor={(item) => item.email}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#2a3b4d',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                  onPress={() => {
                    handleAddMember(item);
                  }}
                >
                  {/* Avatar */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.gray[700],
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                      overflow: 'hidden',
                    }}
                  >
                    {item.profile_picture ? (
                      <Image
                        source={{ uri: item.profile_picture }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                        resizeMode='cover'
                      />
                    ) : (
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 20,
                          fontWeight: 'bold',
                        }}
                      >
                        {(item.fullname ||
                          item.username ||
                          item.email)[0]?.toUpperCase()}
                      </Text>
                    )}
                  </View>
                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: '600',
                        fontSize: 16,
                      }}
                    >
                      {item.fullname || item.username || item.email}
                    </Text>
                    <Text style={{ color: colors.gray.DEFAULT, fontSize: 13 }}>
                      {item.email}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: colors.gray.DEFAULT }}>
                    {friendsLoading
                      ? 'Loading friends...'
                      : 'No friends found.'}
                  </Text>
                </View>
              )}
              style={{
                maxHeight: 200,
                backgroundColor: '#1a252f',
                borderRadius: 8,
                padding: 8,
              }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default GroupSettings;
