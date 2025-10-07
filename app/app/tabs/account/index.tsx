import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { usePrivy } from '@privy-io/expo';
import { router } from 'expo-router';
import colors from '@/assets/colors';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import ScreenContainer from '@/components/ScreenContainer';

const AccountPage = () => {
  const { logout } = usePrivy();
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  return (
    <ScreenContainer>
      <ScreenHeader title='Account' backButton={false} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: colors.red.DEFAULT,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AccountPage;
