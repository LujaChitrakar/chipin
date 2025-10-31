import { View, Text, ToastAndroid, TouchableOpacity } from 'react-native';
import React from 'react';
import { CopyIcon, LucideCopyCheck } from 'lucide-react-native';
import colors from '@/assets/colors';
import * as Clipboard from 'expo-clipboard';

const WalletAddressDisplay = ({
  address,
  displayCharacters = 25,
  textStyle,
  styles,
  copySize = 16,
}: {
  address: string;
  displayCharacters?: number;
  textStyle?: any;
  styles?: any;
  copySize?: number;
}) => {
  const [copied, setCopied] = React.useState(false);
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        ...styles,
      }}
    >
      <Text
        style={{
          color: colors.grayTextColor.DEFAULT,
          textAlign: 'center',
          ...textStyle,
        }}
      >
        {address.substring(0, displayCharacters)}
        {address.length > displayCharacters ? '...' : ''}
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
          borderRadius: 4,
        }}
      >
        {copied ? (
          <LucideCopyCheck color={colors.primary.DEFAULT} size={copySize} />
        ) : (
          <CopyIcon color={colors.cardBackground.light} size={copySize} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default WalletAddressDisplay;
