import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import { CornerDownRight, CornerUpRight, Eye, EyeOff, QrCode } from 'lucide-react-native';
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { Connection } from "@solana/web3.js";
import { checkAndCreateATA, checkBalance } from "@/utils/balance.utils";
import { RPC_URL, USDC_MINT } from "@/constants/WalletConfig";
import { useGetMyProfile } from "@/services/api/authApi";
import colors from "@/assets/colors";

const BalanceCard = () => {
  const [showBalance, setShowBalance] = useState(false);
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
  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: colors.cardBackground.DEFAULT,
        padding: 8,
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.white + '11',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: colors.grayTextColor.DEFAULT,
          marginBottom: 4,
        }}
      >
        BALANCE
      </Text>
      <TouchableOpacity
        onPress={() => {
          setShowBalance(!showBalance);
        }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
      >
        <Text
          style={{
            fontSize: 34,
            color: colors.grayTextColor.dark,
          }}
        >
          $
        </Text>
        <Text
          style={{
            fontSize: 34,
            color: colors.white,
          }}
        >
          {showBalance
            ? balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : 'XXXXXX'}
        </Text>
        {showBalance ? (
          <Eye size={24} color={colors.white} style={{ marginLeft: 8 }} />
        ) : (
          <EyeOff size={24} color={colors.white} style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>
      <View
        style={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.grayTextColor.DEFAULT,
          }}
        >
          WALLET
        </Text>
        <Text style={{ fontSize: 14, color: colors.grayTextColor.dark }}>
          {wallets && wallets.length > 0
            ? wallets[0].address.slice(0, 32) + '...'
            : 'No Wallet Connected'}
        </Text>
      </View>
      <View
        style={{
          marginTop: 16,
          flexDirection: 'row',
          gap: 12,
          display: 'flex',
        }}
      >
        <Button
          title='Send'
          icon={<CornerUpRight size={18} />}
          onPress={() => {}}
          style={{
            flex: 1,
          }}
        />
        <Button
          title='Receive'
          icon={<CornerDownRight size={18} />}
          onPress={() => {}}
          style={{
            flex: 1,
          }}
        />
        <Button
          title=''
          icon={<QrCode size={18} />}
          onPress={() => {}}
          style={{
            justifyContent: 'center',
            // width: 50,
            // height: 50,
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        />
      </View>
    </View>
  );
};

export default BalanceCard;
