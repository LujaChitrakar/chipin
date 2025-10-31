import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import React, { useEffect, useState } from 'react';
import colors from '@/assets/colors';
import {
  useGetMyReferalCode,
  useRedeemPointsCashback,
} from '@/services/api/friendsApi';
import { CirclePercent, LockIcon, UserRoundPlus } from 'lucide-react-native';
import Button from '../common/Button';
import { FontAwesome5 } from '@expo/vector-icons';
import ReferalCodeQrModal from './ReferalCodeQrModal';
import { useGetMyProfile } from '@/services/api/authApi';
import { useQueryClient } from '@tanstack/react-query';

export const REDEEMABLE_POINTS_THRESHOLD = 10000;
export const REDEEM_USDC_VALUE = 20;

const RewardsTab = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'Get Rewarded' | 'Redeem'>(
    'Get Rewarded'
  );

  const {
    data: myProfile,
    isLoading: myProfileLoading,
    refetch: refetchProfile,
  } = useGetMyProfile();
  const [redeemTarget, setRedeemTarget] = useState(REDEEMABLE_POINTS_THRESHOLD);

  useEffect(() => {
    if (myProfile?.data) {
      let remainingPoints =
        REDEEMABLE_POINTS_THRESHOLD -
        ((myProfile?.data?.points || 0) -
          (myProfile?.data?.totalRedeemedPoints || 0));
      setRedeemTarget(myProfile?.data?.points + remainingPoints);
    }
  }, [myProfile]);

  const { mutate: redeemCashback, isPending: redeemingCashback } =
    useRedeemPointsCashback();

  const handleRedeem = () => {
    if (myProfile?.data?.points < redeemTarget) {
      ToastAndroid.showWithGravity(
        'Not enough points to redeem now.',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM+20
      );
      return;
    }

    redeemCashback(undefined, {
      onSuccess: (response: any) => {
        if (response?.success) {
          ToastAndroid.showWithGravity(
            response?.message || 'Successfully redeemed!',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM+20
          );
          queryClient.invalidateQueries({
            queryKey: ['wallet-balance'],
          });
          queryClient.invalidateQueries({
            queryKey: ['myprofile'],
          });
        }
      },
      onError: (error: any) => {
        ToastAndroid.showWithGravity(
          error?.response?.message || 'Failed to redeem. Try again later!',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM+20
        );
      },
    });
  };

  const {
    data: referalCodeData,
    isPending: loadingReferalCode,
    error: errorReferalCode,
  } = useGetMyReferalCode();

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 25,
      }}
    >
      {/* Tab header */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.cardBackground.DEFAULT,
          borderRadius: 12,
          padding: 8,
          gap: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('Get Rewarded')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'Get Rewarded' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'Get Rewarded'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Get Rewarded
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('Redeem')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor:
              activeTab === 'Redeem' ? colors.white : 'transparent',
          }}
        >
          <Text
            style={{
              color:
                activeTab === 'Redeem'
                  ? colors.black
                  : colors.grayTextColor.DEFAULT,
              fontWeight: '600',
            }}
          >
            Redeem
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'Get Rewarded' && (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              padding: 20,
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 15,
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Invite 5 Column */}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: 10,
                  flex: 2,
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
                  <UserRoundPlus color={colors.white} size={15} />
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.white,
                    }}
                  >
                    Invite {referalCodeData?.data?.maxUseCount} Friends
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    gap: 4,
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      backgroundColor: colors.cardBackground.light,
                      height: 12,
                      borderRadius: 15,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 'auto',
                        flex:
                          referalCodeData?.data?.usedCount /
                          referalCodeData?.data?.maxUseCount,
                        height: 8,
                        borderRadius: 15,
                        backgroundColor: colors.white + 'dd',
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      flex: 0.3,
                      color: colors.grayTextColor.dark,
                    }}
                  >
                    {referalCodeData?.data?.usedCount}/
                    {referalCodeData?.data?.maxUseCount}
                  </Text>
                </View>
              </View>

              {/* You get Column */}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    color: colors.grayTextColor.dark,
                    fontSize: 10,
                  }}
                >
                  You Get
                </Text>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 7,
                  }}
                >
                  <FontAwesome5
                    name='coins'
                    size={16}
                    color={colors.cardBackground.light}
                  />
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 16,
                    }}
                  >
                    {referalCodeData?.data?.maxUseCount * 100}
                  </Text>
                </View>
              </View>
            </View>

            <ReferalCodeQrModal
              referalCodeData={referalCodeData}
              buttonText='Invite Now'
            />
          </View>
        )}
        {activeTab === 'Redeem' && (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 20,
              gap: 41,
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 15,
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                flex: 0.7,
              }}
            >
              <CirclePercent size={27} color={colors.white} />
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.white,
                  }}
                >
                  $20 Cashback
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.grayTextColor.dark,
                  }}
                >
                  Get $20 Cashback when you reach {redeemTarget.toFixed(0)}{' '}
                  points
                </Text>
              </View>
            </View>
            <Button
              title='Redeem'
              loading={redeemingCashback}
              icon={
                myProfile?.data?.points < redeemTarget ? (
                  <LockIcon size={12} />
                ) : null
              }
              onPress={handleRedeem}
              disabled={myProfile?.data?.points < redeemTarget}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 8,
                flex: 0.3,
                gap: 4,
                height: 40,
                width: 83,
                backgroundColor:
                  myProfile?.data?.points >= redeemTarget
                    ? colors.white
                    : colors.white + 'cc',
              }}
              textStyle={{
                fontSize: 14,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default RewardsTab;
