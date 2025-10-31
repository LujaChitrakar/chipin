import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import {
  HandCoins,
  PlusCircle,
  UserRoundPlus,
  WalletMinimal,
} from 'lucide-react-native';
import colors from '@/assets/colors';
import { useGetMyProfile } from '@/services/api/authApi';
import { RPC_URL, USDC_MINT } from '@/constants/WalletConfig';
import { checkAndCreateATA, checkBalance } from '@/utils/balance.utils';
import { Connection } from '@solana/web3.js';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';

const SavingGroupPageHeader = () => {
  const { wallets } = useEmbeddedSolanaWallet();

  const loadWalletBalance = async () => {
    const wallet = wallets?.[0];
    const connection = new Connection(RPC_URL);
    const senderATA = await checkAndCreateATA(connection, wallet, USDC_MINT);
    const bal = senderATA ? await checkBalance(connection, senderATA) : 0;
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

  return (
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
            {totalOwedByUser.toFixed(2)}
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
          YOU'RE OWED
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
            {totalOwedToUser.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SavingGroupPageHeader;
