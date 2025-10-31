import { View, ScrollView, RefreshControl, Alert, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useGetSavingGroupById } from '@/services/api/savingGroupApi';
import { useGetMyProfile } from '@/services/api/authApi';
import { useQueryClient } from '@tanstack/react-query';
import colors from '@/assets/colors';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import Button from '@/components/common/Button';
import { PlusCircle } from 'lucide-react-native';
import SavingGroupDetailsPageHeader from '@/components/savingGroup/SavingGroupDetailsHeader';
import WalletAddressDisplay from '@/components/common/WalletAddressDisplay';
import AddSavingModal from '@/components/savingGroup/AddSavingModal';

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
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();

  const [addSavingModalVisible, setAddSavingModalVisible] = useState(false);

  return (
    <ScreenContainer>
      <ScreenHeader
        title={savingGroupData?.data?.name || 'Personal Saving'}
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
          <Text
            style={{
              color: colors.white,
              fontSize: 16,
              fontWeight: '400',
            }}
          >
            Personal Savings
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 9,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.grayTextColor.DEFAULT,
                fontSize: 14,
                fontWeight: '500',
              }}
            >
              SAVING ADDRESS:
            </Text>
            <WalletAddressDisplay
              textStyle={{
                fontSize: 14,
                marginTop: 3,
              }}
              address={savingGroupData?.data?.personalSavingAddress || 'XXX'}
            />
          </View>
          <SavingGroupDetailsPageHeader savingGroupData={savingGroupData} />
          <Button
            title='Add Savings'
            icon={<PlusCircle color={colors.white} size={18} />}
            style={{
              backgroundColor: colors.grayTextColor.DEFAULT,
            }}
            onPress={() => {
              setAddSavingModalVisible(true);
            }}
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
        </View>
      </ScrollView>
      <AddSavingModal
        modalVisible={addSavingModalVisible}
        setModalVisible={setAddSavingModalVisible}
        savingGroupData={savingGroupData}
      />
    </ScreenContainer>
  );
};

export default SavingGroupDetailPage;
