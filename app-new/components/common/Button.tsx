import {
  TouchableOpacity,
  Text,
  StyleSheetProperties,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import colors from '@/assets/colors';
import GlobalStyles from '@/assets/global.styles';

const Button = ({
  title,
  backgroundColor = colors.white,
  textColor = colors.black,
  icon,
  style = {},
  onPress = () => {},
  loading = false,
  textStyle = {},
  disabled = false,
}: {
  title: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: any;
  style?: any;
  onPress: () => void;
  loading?: boolean;
  textStyle?: any;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
    disabled={disabled}
      style={{
        backgroundColor,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 50,
        ...style,
      }}
      onPress={() => {
        if (loading) return;
        onPress();
      }}
    >
      {loading ? (
        <ActivityIndicator size='small' color={textColor} />
      ) : (
        <>
          {icon && icon}
          {title && (
            <Text
              style={{
                color: textColor,
                fontWeight: '600',
                letterSpacing: 0.4,
                ...textStyle,
              }}
            >
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
