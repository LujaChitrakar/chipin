import { View, Text } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';

const SavingGroupDetailsPageHeader = ({
  savingGroupData,
}: {
  savingGroupData: any;
}) => {
  const saved = savingGroupData?.data?.reached_savings || 0;
  const target = savingGroupData?.data?.target_amount || 0;
  const remaining = Math.min(target - saved, 0);

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
          SAVED
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
            {saved.toFixed(2)}
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
          TARGET
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
            {target.toFixed(2)}
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
          REMAINING
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
            {remaining.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SavingGroupDetailsPageHeader;
