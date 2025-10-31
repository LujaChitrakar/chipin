import {
  View,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import React, { useState } from 'react';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import ScreenContainer from '@/components/ScreenContainer';
import { useGetMyGroups } from '@/services/api/groupApi';
import colors from '@/assets/colors';
import { Search } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import GroupPageHeader from '@/components/group/GroupPageHeader';
import JoinCreateButton from '@/components/group/JoinCreateButtons';
import GroupTabs from '@/components/group/GroupTabs';

const GroupsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: myGroups, isLoading: myGroupsLoading } = useGetMyGroups({
    page: 1,
    limit: 20,
    q: searchQuery,
  });

  const queryClient = useQueryClient();

  return (
    <ScreenContainer>
      <ScreenHeader title='Groups' onBackPress={null} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: ['my-groups'],
              });
              queryClient.invalidateQueries({
                queryKey: ['wallet-balance'],
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
            marginBottom: 150
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
          />
          <GroupTabs myGroups={myGroups} myGroupsLoading={myGroupsLoading} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default GroupsPage;
