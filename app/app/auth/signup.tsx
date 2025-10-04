import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import colors from '@/assets/colors';
import fonts from '@/assets/fonts';
import { useRouter } from "expo-router";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
  };

  const navigateToLogin = () => {
    router.replace('auth/login');
  };

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
        Create Account
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
          marginBottom: 16,
          fontFamily: fonts.body,
          color: colors.black,
        }}
      />

      <TextInput
        placeholder='Confirm Password'
        placeholderTextColor={colors.gray}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
        onPress={handleSignup}
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
          Sign Up
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: fonts.body,
          color: colors.darkGray,
        }}
      >
        Already have an account?{' '}
        <Text
          style={{
            color: colors.secondary,
            fontFamily: fonts.heading,
          }}
          onPress={navigateToLogin}
        >
          Login
        </Text>
      </Text>
    </View>
  );
};

export default Signup;
