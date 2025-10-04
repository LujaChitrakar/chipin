import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import colors from '@/assets/colors';
import fonts from '@/assets/fonts';
import { useRouter } from "expo-router";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    // Add login logic here (API call, Firebase auth, etc.)
    Alert.alert('Login Successful', `Welcome back, ${email}!`);
    router.replace("tabs");
  };

  const navigateToSignup = () => {
    console.log("Navigating to Signup");
    router.replace("auth/signup");
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: colors.white,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.heading,
          fontSize: 28,
          color: colors.primary,
          marginBottom: 40,
        }}
      >
        Welcome Back
      </Text>

      <TextInput
        placeholder='Email'
        placeholderTextColor={colors.gray}
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
        style={{
          width: '100%',
          backgroundColor: colors.lightGray,
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          fontFamily: fonts.body,
          color: colors.black,
        }}
      />

      <TextInput
        placeholder='Password'
        placeholderTextColor={colors.gray}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: '100%',
          backgroundColor: colors.lightGray,
          borderRadius: 12,
          padding: 14,
          marginBottom: 20,
          fontFamily: fonts.body,
          color: colors.black,
        }}
      />

      <Pressable
        onPress={handleLogin}
        style={{
          width: '100%',
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: colors.white,
            fontSize: 16,
            fontFamily: fonts.heading,
          }}
        >
          Login
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: fonts.body,
          color: colors.darkGray,
        }}
      >
        Don’t have an account?{' '}
        <Text
          style={{
            color: colors.secondary,
            fontFamily: fonts.heading,
          }}
          onPress={navigateToSignup}
        >
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

export default Login;
