import { View, Text } from 'react-native';
import React from 'react';
import Button from '../common/Button';
import {
    HandCoins,
  PlusCircle,
  UserRoundPlus,
  WalletMinimal,
} from 'lucide-react-native';
import colors from '@/assets/colors';

const SaveMoneyCard = () => {
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
      }}
    >
      <HandCoins
        style={{
          position: 'absolute',
          top: 16,
          right: 32,
          transform: [{ rotate: '-15deg' }],
        }}
        color={colors.white + '33'}
      />

      <Text
        style={{
          fontSize: 14,
          color: colors.grayTextColor.DEFAULT,
          marginBottom: 4,
        }}
      >
        TRYING TO SAVE MONEY?
      </Text>
      <View
        style={{
          marginTop: 16,
          flexDirection: 'row',
          gap: 12,
          display: 'flex',
        }}
      >
        <Button
          title='Create Savings'
          icon={<PlusCircle color={colors.white} size={18} />}
          onPress={() => {}}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground.light,
          }}
          textColor={colors.white}
        />
      </View>
    </View>
  );
};

export default SaveMoneyCard;
