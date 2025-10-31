import { View, Text, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import { router } from 'expo-router';
import { useGetMyProfile } from '@/services/api/authApi';
import colors from '@/assets/colors';
import { FontAwesome5 } from '@expo/vector-icons';
import RewardsTab, {
  REDEEMABLE_POINTS_THRESHOLD,
} from '@/components/rewards/RewardsTab';
import HalfCircularProgress from '@/components/HalfCircularProgress';

const RewardsPage = () => {
  const {
    data: myProfile,
    isLoading: myProfileLoading,
    refetch: refetchProfile,
  } = useGetMyProfile();

  const remainingPoints =
    REDEEMABLE_POINTS_THRESHOLD -
    ((myProfile?.data?.points || 0) -
      (myProfile?.data?.totalRedeemedPoints || 0));

  console.log('REMAINING POINTS:::', remainingPoints);
  return (
    <ScreenContainer>
      <ScreenHeader
        title='Rewards'
        onBackPress={() => {
          router.back();
        }}
      ></ScreenHeader>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              refetchProfile();
            }}
            refreshing={myProfileLoading}
          />
        }
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 15,
              paddingVertical: 20,
              paddingHorizontal: 15,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.grayTextColor.DEFAULT,
              }}
            >
              YOUR POINTS
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    marginRight: 7,
                  }}
                >
                  <FontAwesome5
                    name='coins'
                    size={27}
                    color={colors.cardBackground.light}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 32,
                    color: colors.white,
                  }}
                >
                  {myProfile?.data?.points?.toFixed(2)}
                </Text>
                <View
                  style={{
                    marginLeft: 'auto',
                  }}
                >
                  <HalfCircularProgress
                    size={44}
                    target={REDEEMABLE_POINTS_THRESHOLD}
                    progress={
                      REDEEMABLE_POINTS_THRESHOLD -
                      (remainingPoints < 0
                        ? REDEEMABLE_POINTS_THRESHOLD
                        : remainingPoints)
                    }
                    label='NEXT REWARD'
                    labelStyle={{
                      color: colors.white + 'cc',
                      fontSize: 8,
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.grayTextColor.dark,
                  }}
                >
                  {remainingPoints?.toFixed(0)} points remaining
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 1.5,
              backgroundColor: colors.white + '11',
            }}
          />
          <RewardsTab />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default RewardsPage;
