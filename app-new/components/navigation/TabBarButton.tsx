import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { icons } from '@/assets/icons';

const TabBarButton = ({
  isFocused,
  label,
  routeName,
  color,
  onPress,
  onLongPress,
}: {
  isFocused: boolean;
  label: string;
  routeName: string;
  color: string;
  onPress?: () => void;
  onLongPress?: () => void;
}) => {
  const activeColor = isFocused ? color : '#888'; // You can change inactive color here

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        {icons.getBottomTabIcon(routeName, activeColor, 18)}
      </View>
      <Text style={[styles.label, { color: activeColor, fontWeight: "600" }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
  },
});

export default TabBarButton;
