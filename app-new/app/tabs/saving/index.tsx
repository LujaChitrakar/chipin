import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import React, { useState } from 'react';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import ScreenContainer from '@/components/ScreenContainer';
import {
  useGetMySavingGroups,
  useJoinSavingGroupBySavingGroupCode,
} from '@/services/api/savingGroupApi';
import colors from '@/assets/colors';
import { Search } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import SavingGroupPageHeader from '@/components/savingGroup/SavingGroupPageHeader';
import JoinCreateButton from '@/components/savingGroup/JoinCreateButtons';
import SavingGroupTabs from '@/components/savingGroup/SavingGroupTabs';

const SavingGroupsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useJoinSavingGroupBySavingGroupCode();
  const { data: mySavingGroups, isLoading: mySavingGroupsLoading } =
    useGetMySavingGroups({
      page: 1,
      limit: 10,
      q: searchQuery,
    });
  const queryClient = useQueryClient();

  return (
    <ScreenContainer>
      <ScreenHeader title='Savings' onBackPress={null} />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: ['my-groups'],
              });
            }}
            refreshing={mySavingGroupsLoading}
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
          <SavingGroupPageHeader />

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
              placeholder='Search Savings'
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

          <SavingGroupTabs
            mySavingGroups={mySavingGroups}
            mySavingGroupsLoading={mySavingGroupsLoading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({});

export default SavingGroupsPage;
