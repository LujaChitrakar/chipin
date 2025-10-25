import { View, Text, ToastAndroid, TouchableOpacity } from 'react-native';
import React from 'react';
import { CopyIcon, LucideCopyCheck } from 'lucide-react-native';
import colors from '@/assets/colors';
import * as Clipboard from 'expo-clipboard';

const WalletAddressDisplay = ({ address }: { address: string }) => {
  const [copied, setCopied] = React.useState(false);
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
      }}
    >
      <Text
        style={{
          color: colors.grayTextColor.DEFAULT,
          textAlign: 'center',
        }}
      >
        {address.substring(0, 25)}...
      </Text>
      <TouchableOpacity
        onPress={async () => {
          await Clipboard.setStringAsync(address);
          setCopied(true);
          ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
          setTimeout(() => setCopied(false), 3000);
        }}
        style={{
          backgroundColor: colors.background.light,
          padding: 4,
        }}
      >
        {copied ? (
          <LucideCopyCheck color={colors.primary.DEFAULT} size={16} />
        ) : (
          <CopyIcon color={colors.cardBackground.light} size={16} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default WalletAddressDisplay;
