import { View, ScrollView, RefreshControl, Text } from 'react-native';
import React, { useEffect } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetSavingGroupById } from '@/services/api/savingGroupApi';
import { useQueryClient } from '@tanstack/react-query';
import colors from '@/assets/colors';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import SavingGroupMembersChain from '@/components/savingGroup/SavingGroupMembersChain';
import Button from '@/components/common/Button';
import { PlusCircle } from 'lucide-react-native';
import SavingGroupDetailsPageHeader from '@/components/savingGroup/SavingGroupDetailsHeader';
import SavingGroupQrButton from '@/components/savingGroup/SavingGroupQrButton';
import SavingGroupDetailsTabs from '@/components/savingGroup/SavingGroupDetailsTabs';
const { useNavigation } = require('@react-navigation/native');

const SavingGroupDetailPage = () => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  const router = useRouter();
  const { savingGroupId } = useLocalSearchParams<{ savingGroupId: string }>();
  const queryClient = useQueryClient();
  const { data: savingGroupData, isLoading: savingGroupDataLoading } =
    useGetSavingGroupById(savingGroupId);

  return (
    <ScreenContainer>
      <ScreenHeader
        title={savingGroupData?.data?.name || 'SavingGroup Details'}
        onBackPress={() => router.back()}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: [savingGroupId],
              });
            }}
            refreshing={savingGroupDataLoading}
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
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <SavingGroupMembersChain
              members={savingGroupData?.data?.members || []}
              styles={{
                flex: 1,
              }}
            />
            <Text style={{}}>
              {savingGroupData?.data?.members?.length} members
            </Text>
            <SavingGroupQrButton savingGroupData={savingGroupData} />
          </View>
          <SavingGroupDetailsPageHeader savingGroupData={savingGroupData} />
          <Button
            title='Add Expense'
            icon={<PlusCircle color={colors.white} size={18} />}
            style={{
              backgroundColor: colors.grayTextColor.DEFAULT,
            }}
            onPress={() => {}}
            textColor={colors.white}
          />
          <View
            style={{
              width: '100%',
              height: 1.5,
              backgroundColor: colors.white + '11',
              marginVertical: 10,
            }}
          />

          <SavingGroupDetailsTabs />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default SavingGroupDetailPage;
