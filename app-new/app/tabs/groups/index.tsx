import {
  View,
  Text,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import ScreenContainer from '@/components/ScreenContainer';
import {
  useCreateGroup,
  useGetMyGroups,
  useJoinGroupByGroupCode,
} from '@/services/api/groupApi';
import colors from '@/assets/colors';
import {
  AntDesign,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import Button from '@/components/common/Button';
import { useGetMyFriends } from '@/services/api/friendsApi';
import { useRouter } from 'expo-router';
import { Regex, Search, X } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import QRScannerScreen from '@/components/QrScannerScreen';
import LoadingScreen from '@/components/splash/LoadingScreen';
import GroupPageHeader from '@/components/group/GroupPageHeader';
import JoinCreateButton from '@/components/group/JoinCreateButtons';
import GroupTabs from '@/components/group/GroupTabs';

const GroupsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { mutate: createGroup, isPending: creatingGroup } = useCreateGroup();
  const { mutate: joinGroup, isPending: joiningGroup } =
    useJoinGroupByGroupCode();
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
  const queryClient = useQueryClient();

  const [availableMembers, setAvailableMembers] = useState([]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const [groupIdToJoin, setGroupIdToJoin] = useState('');

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberEmails, setselectedMemberEmails] = useState<string[]>(
    []
  );

  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active');

  const groupsList = myGroups?.data || [];
  const activeGroups = groupsList.filter(
    (g: any) => !(g.settled === true || g.status === 'settled')
  );
  const settledGroups = groupsList.filter(
    (g: any) => g.settled === true || g.status === 'settled'
  );

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
        setGroupName('');
        setDescription('');
        setselectedMemberEmails([]);
        setShowCreateDialog(false);
        queryClient.invalidateQueries({
          queryKey: ['my-groups'],
        });
      },
    });
  };

  const handleCancel = () => {
    setGroupName('');
    setDescription('');
    setselectedMemberEmails([]);
    setShowCreateDialog(false);
  };

  const handleJoinGroup = (groupCode: string) => {
    joinGroup(groupCode, {
      onSuccess: (response: any) => {
        console.log('JOINING GROUP RESPONSE:::', response?.data);
        queryClient.invalidateQueries({
          queryKey: ['my-groups'],
        });
        setShowJoinGroupModal(false);
      },
      onError: (error: any) => {
        console.log('JOINING GROUP ERROR:::', error?.response?.data);
        ToastAndroid.showWithGravity(
          error?.response?.data?.message || 'Failed to join',
          ToastAndroid.BOTTOM,
          ToastAndroid.LONG
        );
      },
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader title='Groups' onBackPress={null} />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: ['my-groups'],
              });
            }}
            refreshing={myGroupsLoading}
          />
        }
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <GroupPageHeader />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: 50,
              flex: 1,
              backgroundColor: colors.textInputBackground.DEFAULT,
              padding: 4,
              paddingHorizontal: 20,
              gap: 4,
              borderRadius: 15,
            }}
          >
            <Search size={20} color={colors.grayTextColor.DEFAULT} />
            <TextInput
              placeholder='Search Groups'
              placeholderTextColor={colors.grayTextColor.dark}
              style={{ flex: 1, color: colors.white, paddingVertical: 8 }}
              value={searchQuery}
              onChangeText={(searchQuery: string) => {
                setSearchQuery(searchQuery);
              }}
            />
          </View>

          <JoinCreateButton />

          <View
            style={{
              width: '100%',
              height: 1.5,
              backgroundColor: colors.white + '11',
              marginVertical: 10,
            }}
          ></View>

          <GroupTabs
            myGroups={myGroups}
            myGroupsLoading={myGroupsLoading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({});

export default GroupsPage;
