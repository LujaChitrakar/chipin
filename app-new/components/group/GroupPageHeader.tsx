import { View, Text } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';
import { useGetMyProfile } from '@/services/api/authApi';
import { useGetBalance } from '@/services/api/wallet';

const GroupPageHeader = () => {
  const { data: balance = 0 } = useGetBalance();

  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const totalOwedByUser = myProfile?.data?.totalOwedByUser || 0;
  const totalOwedToUser = myProfile?.data?.totalOwededToUser || 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.cardBackground.DEFAULT,
        padding: 8,
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 18,
      }}
    >
      <View
        style={{
          minWidth: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.grayTextColor.DEFAULT,
            fontWeight: '600',
          }}
        >
          BALANCE
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            justifyContent: 'flex-start',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: colors.grayTextColor.dark,
              fontWeight: '400',
            }}
          >
            $
          </Text>
          <Text
            style={{
              color: colors.white,
              fontSize: 20,
              fontWeight: '400',
            }}
          >
            {balance.toFixed(2)}
          </Text>
        </View>
      </View>
      <View
        style={{
          minWidth: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.grayTextColor.DEFAULT,
            fontWeight: '600',
          }}
        >
          YOU OWE
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            justifyContent: 'flex-start',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: colors.grayTextColor.dark,
              fontWeight: '400',
            }}
          >
            $
          </Text>
          <Text
            style={{
              color: colors.white,
              fontSize: 20,
              fontWeight: '400',
            }}
          >
            {totalOwedByUser.toFixed(2)}
          </Text>
        </View>
      </View>
      <View
        style={{
          minWidth: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.grayTextColor.DEFAULT,
            fontWeight: '600',
          }}
        >
          YOU'RE OWED
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            justifyContent: 'flex-start',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: colors.grayTextColor.dark,
              fontWeight: '400',
            }}
          >
            $
          </Text>
          <Text
            style={{
              color: colors.white,
              fontSize: 20,
              fontWeight: '400',
            }}
          >
            {totalOwedToUser.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GroupPageHeader;
