import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useGetMyProfile } from '@/services/api/authApi';
import { useRouter } from 'expo-router';

const HomeScreenHeader = () => {
  const router = useRouter();
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const profilePicture = myProfile?.data?.profile_picture;
  const username = myProfile?.data?.username || '';
  const firstLetter = username.charAt(0).toUpperCase();
  return (
    <View
      style={{
        marginTop: 8,
        paddingTop: 48,
      }}
    >
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('@/assets/images/ChippinLogo.png')}
          style={{
            width: 52,
            height: 52,
            resizeMode: 'contain',
          }}
        />
        <TouchableOpacity
          onPress={() => {
            router.push('/notabs/account');
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#ffffff',
              }}
            >
              {firstLetter}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreenHeader;
