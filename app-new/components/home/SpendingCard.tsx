import { View, Text } from 'react-native';
import React from 'react';
import { WalletMinimal } from 'lucide-react-native';
import colors from '@/assets/colors';
import JoinCreateButton from "../group/JoinCreateButtons";

const SpendingCard = () => {
  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: colors.cardBackground.DEFAULT,
        padding: 8,
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.white + '11',
        gap: 20
      }}
    >
      <WalletMinimal
        style={{
          position: 'absolute',
          top: 16,
          right: 32,
          transform: [{ rotate: '-30deg' }],
        }}
        color={colors.white + '33'}
      />

      <Text
        style={{
          fontSize: 14,
          color: colors.grayTextColor.DEFAULT,
        }}
      >
        SPENDING WITH FRIENDS?
      </Text>
      <View
        style={{
          width: '100%',
          height: 1.5,
          backgroundColor: colors.white + '11',
        }}
      ></View>
      <JoinCreateButton />
    </View>
  );
};

export default SpendingCard;
