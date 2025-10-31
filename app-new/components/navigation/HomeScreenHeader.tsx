import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useGetMyProfile } from '@/services/api/authApi';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import colors from '@/assets/colors';

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
            width: 50,
            height: 50,
            resizeMode: 'contain',
          }}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 15,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push('/notabs/rewards');
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 50,
              backgroundColor: colors.cardBackground.DEFAULT,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesome5
              name='coins'
              size={24}
              color={colors.cardBackground.light}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push('/notabs/account');
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.cardBackground.light,
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
    </View>
  );
};

export default HomeScreenHeader;
