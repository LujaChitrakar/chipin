import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/assets/colors';
import { useGetMyProfile } from '@/services/api/authApi';
import { usePrivy } from '@privy-io/expo';
import { Connection, PublicKey } from '@solana/web3.js';
import { checkAndCreateATA, checkBalance } from '@/utils/balance.utils';
import { RPC_URL, USDC_MINT } from '@/constants/WalletConfig';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';

const ScreenHeader = ({
  title,
  backButton,
  onBackPress,
}: {
  title: string;
  backButton: boolean;
  onBackPress?: () => void;
}) => {
  const { wallets } = useEmbeddedSolanaWallet();
  
  const loadWalletBalance = async () => {
    const wallet = wallets?.[0];
    const connection = new Connection(RPC_URL);
    const senderATA = await checkAndCreateATA(connection, wallet, USDC_MINT);
    const bal = await checkBalance(connection, senderATA);
    setBalance(bal);
  };

  const [balance, setBalance] = useState(0);
  useEffect(() => {
    loadWalletBalance();
  }, [wallets]);

  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const totalOwedByUser = myProfile?.data?.totalOwedByUser || 0;
  const totalOwedToUser = myProfile?.data?.totalOwededToUser || 0;
  const profilePicture = myProfile?.data?.profile_picture;
  const username = myProfile?.data?.username || '';
  const firstLetter = username.charAt(0).toUpperCase();
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
      {/* Top Row - Title and Profile */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        {/* Left - Back Button + Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {backButton && (
            <TouchableOpacity onPress={onBackPress} style={{ marginRight: 12 }}>
              <Ionicons name='arrow-back' size={24} color='#ffffff' />
            </TouchableOpacity>
          )}
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: 0.5,
            }}
          >
            Chippin
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
            ${Number(totalOwedByUser).toFixed(2)}
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
            ${Number(totalOwedToUser).toFixed(2)}
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
            Wallet Balance
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            ${balance}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ScreenHeader;
