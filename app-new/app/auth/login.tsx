import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import colors from '@/assets/colors';
import fonts from '@/assets/fonts';
import { useRouter } from 'expo-router';
import { useLogin } from '@privy-io/expo/ui';
import { Octicons } from '@expo/vector-icons';
import { useLoginWithOAuth } from '@privy-io/expo';
import { useLoginWithPasskey } from '@privy-io/expo/passkey';
import Constants from 'expo-constants';
import Button from '@/components/common/Button';

const Login = () => {
  const { login } = useLogin();

  const router = useRouter();

  const handleLogin = () => {
    login({ loginMethods: ['email'] })
      .then((session) => {
        console.log('User logged in', session.user);
        router.replace('/');
      })
      .catch((err) => { })
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: colors.background.DEFAULT,
        gap: 15,
      }}
    >
      <Image style={{
        width: 72, height: 72,
      }} source={require("@/assets/images/ChippinLogo.png")} />
      <Text
        style={{
          fontFamily: fonts.heading,
          fontSize: 28,
          color: colors.primary.DEFAULT,
          marginBottom: 30,
        }}
      >
        Welcome Back
      </Text>

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          width: '80%',
          backgroundColor: colors.white,
          borderRadius: 50,
          paddingVertical: 14,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 4,
          marginBottom: 30,
        }}
      >
        <Text
          style={{
            color: colors.black,
            fontSize: 16,
            fontFamily: fonts.heading,
          }}
        >
          Continue with Email
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
