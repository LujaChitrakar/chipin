import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import colors from "@/assets/colors"

const ScreenHeader = ({
    title,
    backButton,
    onBackPress,
}: {
    title: string,
    backButton: boolean,
    onBackPress?: () => void
}) => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.background.light,
      borderBottomWidth: 1,
      paddingTop: 48
    }}>
      {backButton && (
        <TouchableOpacity onPress={onBackPress} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      )}
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.white }}>{title}</Text>
    </View>
  )
}

export default ScreenHeader