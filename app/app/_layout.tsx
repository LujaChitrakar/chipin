import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import colors from "@/assets/colors";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        
      }}
    >
      <Stack.Screen name='auth/login' options={{ headerShown: false }} />
      <Stack.Screen name='auth/signup' options={{ headerShown: false }} />
      <Stack.Screen name='tabs' options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
