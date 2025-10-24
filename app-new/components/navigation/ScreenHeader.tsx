import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import colors from "@/assets/colors";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";

const ScreenHeader = ({
  onBackPress,
  title,
}: {
  title: string;
  onBackPress?: any;
}) => {
  return (
    <View
      style={{
        marginTop: 8,
        paddingTop: 48,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 16,
        marginBottom: 12,
        
      }}
    >
      {onBackPress ? (
        <TouchableOpacity
          onPress={onBackPress}
          style={{
            padding: 14,
            backgroundColor: colors.cardBackground.DEFAULT,
            borderRadius: 50,
          }}
        >
          <ChevronLeft size={24} color={colors.grayTextColor.DEFAULT} />
        </TouchableOpacity>
      ) : null}
      <Text
        style={{
          fontSize: 24,
          fontWeight: '500',
          color: colors.white,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default ScreenHeader;
