import {
  View,
  Text,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import GlobalStyles from '@/assets/global.styles';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import ScreenContainer from '@/components/ScreenContainer';
import { useCreateGroup, useGetMyGroups } from '@/services/api/groupApi';
import colors from '@/assets/colors';
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import Button from '@/components/common/Button';
import { useGetMyFriends } from '@/services/api/friendsApi';
import { useRouter } from "expo-router";

const GroupsPage = () => {
  const router = useRouter();

  const { mutate: createGroup, isPending: creatingGroup } = useCreateGroup();

  const [availableMembers, setAvailableMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberEmails, setselectedMemberEmails] = useState<string[]>(
    []
  );

  const { data: myGroups, isLoading: myGroupsLoading } = useGetMyGroups({
    page: 1,
    limit: 10,
    q: searchQuery,
  });
  const { data: myFriends, isLoading: myFriendsLoading } = useGetMyFriends({
    page: 1,
    limit: 5,
    q: '',
  });

  useEffect(() => {
    setAvailableMembers(myFriends?.data || []);
  }, [myFriends]);

  const toggleMemberSelection = (memberEmail: string) => {
    setselectedMemberEmails((prev) =>
      prev.includes(memberEmail)
        ? prev.filter((id) => id !== memberEmail)
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
      onSuccess: () => {
        // Reset form and close dialog
        setGroupName('');
        setDescription('');
        setselectedMemberEmails([]);
        setShowCreateDialog(false);
      },
    });
  };

  const handleCancel = () => {
    setGroupName('');
    setDescription('');
    setselectedMemberEmails([]);
    setShowCreateDialog(false);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title='Groups' backButton={false} />
      <ScrollView>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              borderWidth: 1,
              flex: 1,
              borderColor: colors.gray.DEFAULT,
              backgroundColor: colors.gray[900],
              padding: 4,
              paddingHorizontal: 16,
              gap: 4,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <AntDesign name='search' size={18} color={colors.gray.DEFAULT} />
            <TextInput
              placeholder='Search groups...'
              placeholderTextColor={colors.gray.DEFAULT}
              style={{ flex: 1, color: colors.white, paddingVertical: 8 }}
              value={searchQuery}
              onChangeText={(searchQuery: string) => {
                setSearchQuery(searchQuery);
              }}
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-around',
              gap: 8,
            }}
          >
            <Button
              title='Group'
              icon={<AntDesign name='plus' color={colors.white} />}
              backgroundColor={colors.primary[400]}
              textColor={colors.white}
              onPress={() => setShowCreateDialog(true)}
              style={{
                flex: 1,
                paddingVertical: 24,
              }}
            />
            <Button
              title='Join'
              icon={<Feather name='users' color={colors.white} />}
              backgroundColor={colors.buttonBackground.DEFAULT}
              textColor={colors.white}
              onPress={() => {}}
              style={{
                flex: 1,
                paddingVertical: 24,
                borderWidth: 1,
                borderColor: colors.gray[700],
              }}
            />
            <Button
              title='Milestone'
              icon={<Feather name='target' color={colors.white} />}
              backgroundColor={colors.buttonBackground.DEFAULT}
              textColor={colors.white}
              onPress={() => {}}
              style={{
                flex: 1,
                paddingVertical: 24,
                borderWidth: 1,
                borderColor: colors.gray[700],
              }}
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Text
              style={{
                color: colors.gray[400],
                fontSize: 20,
                fontWeight: 'semibold',
                marginTop: 8,
              }}
            >
              Your Groups ({myGroups?.pagination?.totalCount || 0})
            </Text>
            {myGroups?.data?.map((group: any) => (
              <TouchableOpacity
                key={group._id}
                onPress={() => {
                  router.push(`/tabs/groups/${group._id}`);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  backgroundColor: colors.cardBackground.dark,
                  borderColor: colors.gray[600],
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Button
                  backgroundColor={colors.primary.DEFAULT}
                  title=''
                  icon={<Feather name='users' size={24} />}
                  onPress={() => {}}
                  style={{
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    marginLeft: 12,
                    gap: 6,
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 16 }}>
                    {group.name}
                  </Text>
                  <Text style={{ color: colors.gray[400] }}>
                    {group.members.length} members
                  </Text>
                </View>
                <FontAwesome
                  name='angle-right'
                  style={{
                    marginLeft: 'auto',
                    marginRight: 8,
                  }}
                  size={18}
                  color={colors.gray[600]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

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
              backgroundColor: colors.gray[800] || '#1e293b',
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
                <Feather name='x' size={24} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Group Name */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.gray[400],
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
                  placeholderTextColor={colors.gray[500]}
                  style={{
                    backgroundColor: colors.gray[700] || '#334155',
                    color: colors.white,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.gray[600] || '#475569',
                  }}
                />
              </View>

              {/* Description */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.gray[400],
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
                  placeholderTextColor={colors.gray[500]}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.gray[700] || '#334155',
                    color: colors.white,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: colors.gray[600] || '#475569',
                    textAlignVertical: 'top',
                    minHeight: 100,
                  }}
                />
              </View>

              {/* Add Members */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.gray[400],
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Add Members (optional)
                </Text>
                <View
                  style={{
                    backgroundColor: colors.gray[700] || '#334155',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.gray[600] || '#475569',
                    maxHeight: 200,
                  }}
                >
                  {availableMembers.map((member: any, index: number) => (
                    <TouchableOpacity
                      key={member._id}
                      onPress={() => toggleMemberSelection(member.email)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderBottomWidth:
                          index < availableMembers.length - 1 ? 1 : 0,
                        borderBottomColor: colors.gray[600] || '#475569',
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
                            : colors.gray[500],
                          backgroundColor: selectedMemberEmails.includes(
                            member.id
                          )
                            ? colors.primary.DEFAULT
                            : 'transparent',
                          marginRight: 12,
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
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: colors.white,
                            fontSize: 16,
                            marginBottom: 2,
                          }}
                        >
                          {member.username}
                        </Text>
                        <Text
                          style={{
                            color: colors.gray[400],
                            fontSize: 14,
                          }}
                        >
                          {member.email}
                        </Text>
                      </View>
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
                  backgroundColor: colors.gray[700] || '#334155',
                  padding: 16,
                  borderRadius: 8,
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
                      ? colors.gray[600]
                      : colors.primary.DEFAULT || '#10b981',
                  padding: 16,
                  borderRadius: 8,
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
                  {creatingGroup ? 'Creating...' : 'Create Group'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default GroupsPage;
