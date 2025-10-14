import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/assets/colors';
import { useGetMyProfile } from '@/services/api/authApi';
import { useNavigation } from 'expo-router';

const GroupHeader = ({
  title,
  backButton,
  onBackPress,
  groupData,
}: {
  title: string;
  backButton: boolean;
  onBackPress?: () => void;
  groupData: any;
}) => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();

  const userProfile = myProfile?.data;
  const profilePicture = userProfile?.profile_picture;
  const firstLetter = (userProfile?.username || 'User').charAt(0).toUpperCase();

  const totalOwedByUser = 40.17; // Example value, replace with actual calculation
  const totalOwedToUser = 1000.0; // Example value, replace with actual calculation

  const netBalance = totalOwedToUser - totalOwedByUser;

  return (
    <LinearGradient
      colors={['#1a9b8e', '#16857a', '#137066']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
      }}
    >
      {backButton && (
        <TouchableOpacity
          onPress={onBackPress}
          style={{
            alignSelf: 'flex-start',
            padding: 8,
            borderRadius: 100,
            borderColor: colors.white + '33',
            borderWidth: 1,
            backgroundColor: colors.white + '11',
            marginBottom: 12,
          }}
        >
          <Ionicons name='arrow-back' size={24} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Top Row - Title and Profile */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          paddingHorizontal: backButton ? 4 : 0,
        }}
      >
        {/* Left - Back Button + Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: 0.5,
            }}
          >
            {groupData?.data?.name || title}
          </Text>
        </View>

        {/* Right - Profile Icon */}
        <TouchableOpacity
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

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: 12,
          paddingHorizontal: backButton ? 4 : 0,
        }}
      >
        {groupData?.data?.members?.length || 0} members
      </Text>

      {/* Financial Summary */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: colors.white + '22',
          padding: 8,
          borderRadius: 8,
        }}
      >
        {/* You Owe */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 4,
            }}
          >
            You owe
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            ${totalOwedByUser.toFixed(2)}
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            width: 1,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* You Are Owed */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 4,
            }}
          >
            You are owed
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            ${totalOwedToUser.toFixed(2)}
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            width: 1,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Net Balance */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 4,
            }}
          >
            Net balance
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            ${netBalance.toFixed(2)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default GroupHeader;
