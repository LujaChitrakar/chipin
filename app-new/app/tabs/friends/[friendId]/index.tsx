import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useGetUserById } from '@/services/api/friendsApi';
import colors from '@/assets/colors';
import { MoveUpRight } from 'lucide-react-native';
import { checkAndCreateATA, checkBalance } from '@/utils/balance.utils';
import { Connection } from '@solana/web3.js';
import { RPC_URL, USDC_MINT } from '@/constants/WalletConfig';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { useQueryClient } from '@tanstack/react-query';
import RecentActivitiesList from '@/components/home/ActivitiesList';

const FriendDetailPage = () => {
  const { wallets } = useEmbeddedSolanaWallet();
  const queryClient = useQueryClient();
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

  const navigation = useNavigation();
  useEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);
  const router = useRouter();

  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  const { data: friendData, isLoading: friendDataLoading } =
    useGetUserById(friendId);

  console.log('FRIENDS::', JSON.stringify(friendData, null, 2));
  console.log('FRIEND ID::', friendId);

  return (
    <ScreenContainer>
      <ScreenHeader
        title='Friend Details'
        onBackPress={() => {
          router.back();
        }}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: ['user-by-id', friendId],
              });
            }}
            refreshing={friendDataLoading}
          />
        }
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: colors.cardBackground.light, // Blue avatar background
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {(
                  friendData?.data?.fullname ||
                  friendData?.data?.username ||
                  'U'
                )
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 20,
                  fontWeight: '500',
                }}
              >
                {friendData?.data?.fullname || friendData?.data?.username}
              </Text>
              <Text
                style={{
                  color: colors.grayTextColor.dark,
                  fontSize: 14,
                }}
              >
                {friendData?.data?.email}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.cardBackground.DEFAULT,
            padding: 8,
            paddingVertical: 20,
            paddingHorizontal: 15,
            borderRadius: 18,
          }}
        >
          <View
            style={{
              minWidth: 80,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.grayTextColor.DEFAULT,
                fontWeight: '600',
              }}
            >
              BALANCE
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                justifyContent: 'flex-start',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.grayTextColor.dark,
                  fontWeight: '400',
                }}
              >
                $
              </Text>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 20,
                  fontWeight: '400',
                }}
              >
                {balance.toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={{
              minWidth: 80,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.grayTextColor.DEFAULT,
                fontWeight: '600',
              }}
            >
              YOU OWE
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                justifyContent: 'flex-start',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.grayTextColor.dark,
                  fontWeight: '400',
                }}
              >
                $
              </Text>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 20,
                  fontWeight: '400',
                }}
              >
                {friendData?.data?.totalOwedByUser.toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={{
              minWidth: 80,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.grayTextColor.DEFAULT,
                fontWeight: '600',
              }}
            >
              OWES YOU
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                justifyContent: 'flex-start',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.grayTextColor.dark,
                  fontWeight: '400',
                }}
              >
                $
              </Text>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 20,
                  fontWeight: '400',
                }}
              >
                {friendData?.data?.totalOwedToUser.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View style={{
          marginTop: 20,
          paddingHorizontal: 5,
        }}>
          <RecentActivitiesList friendId={friendId} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default FriendDetailPage;
