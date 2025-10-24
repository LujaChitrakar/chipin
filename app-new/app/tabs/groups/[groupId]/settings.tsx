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
      <ScrollView style={{ paddingHorizontal: 8 }}></ScrollView>
    </ScreenContainer>
  );
};

export default GroupSettings;
