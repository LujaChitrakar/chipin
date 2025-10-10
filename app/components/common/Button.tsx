import { TouchableOpacity, Text } from 'react-native';
import React from 'react';
import colors from '@/assets/colors';

const Button = ({
  title,
  backgroundColor = colors.primary[400],
  textColor = colors.white,
  icon,
  style = {},
  onPress = () => {},
}: {
  title: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: any;
  style?: any;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...style
      }}
      onPress={onPress}
      
    >
      {icon && icon}
      <Text
        style={{
          color: textColor,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
