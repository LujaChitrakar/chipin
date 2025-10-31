import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import { Eye, EyeOff } from 'lucide-react-native';
import { useGetMyProfile } from '@/services/api/authApi';
import colors from '@/assets/colors';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import WalletAddressDisplay from '../common/WalletAddressDisplay';
import SendMoneyModal from './SendMoneyModal';
import ReferalModal from './ReferalModal';
import ScanUserQrButton from './ScanUserQrButton';
import { useGetBalance } from '@/services/api/wallet';
import { useQueryClient } from "@tanstack/react-query";

const BalanceCard = () => {
  const queryClient = useQueryClient();
  const [showBalance, setShowBalance] = useState(false);
  const { data: balance } = useGetBalance();

  const { data: userProfile, isLoading: profileLoading } = useGetMyProfile();
  const [referalModalOpen, setReferalModalOpen] = useState(false);

  useEffect(() => {
    setReferalModalOpen(!userProfile?.data?.onboarding_completed);
  }, [userProfile]);

  const [receiveMoneyModalOpen, setReceiveMoneyModalOpen] = useState(false);
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('XXXX');

  useEffect(() => {
    if (showBalance) {
      queryClient.invalidateQueries({
        queryKey: ['wallet-balance'],
      });
    }
  }, [showBalance]);

  if (profileLoading) {
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
          minHeight: 32,
          borderColor: colors.white + '11',
        }}
      ></View>
    );
  }

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
            ? balance?.toLocaleString(undefined, {
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
            marginBottom: 4,
          }}
        >
          WALLET
        </Text>
        <WalletAddressDisplay address={userProfile?.data?.wallet_public_key} />
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
          icon={null}
          onPress={() => {
            setSendMoneyModalOpen(true);
          }}
          style={{
            flex: 1,
          }}
        />
        <Button
          title='Receive'
          icon={null}
          onPress={() => {
            setReceiveMoneyModalOpen(true);
            setQrCodeData(userProfile?.data?.wallet_public_key);
          }}
          style={{
            flex: 1,
          }}
        />
        <ScanUserQrButton />
      </View>

      {/* Receive Money Modal */}
      <Modal
        visible={receiveMoneyModalOpen}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setReceiveMoneyModalOpen(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: 24,
              }}
            >
              <Text style={styles.qrModalTitle}>Your QR Code</Text>
              <TouchableOpacity onPress={() => setReceiveMoneyModalOpen(false)}>
                <Feather
                  name='x'
                  size={24}
                  color={colors.grayTextColor.DEFAULT}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={qrCodeData}
                size={200}
                backgroundColor='white'
                color='black'
              />
            </View>
            <WalletAddressDisplay address={qrCodeData} />
            <View
              style={{
                backgroundColor: colors.cardBackground.DEFAULT,
                display: 'flex',
                gap: 10,
                flexDirection: 'row',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                width: '100%',
              }}
            >
              {userProfile?.data?.profile_picture ? (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: colors.cardBackground.light,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    source={{ uri: userProfile?.data?.profile_picture }}
                    style={{ width: 36, height: 36 }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 20,
                    backgroundColor: colors.cardBackground.light, // Blue avatar background
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    {(userProfile?.data.fullname || userProfile?.data.username)
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
              )}

              <View>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  {userProfile?.data.fullname || userProfile?.data.username}
                </Text>
                <Text
                  style={{
                    color: colors.grayTextColor.dark,
                    fontSize: 14,
                  }}
                >
                  {userProfile?.data.email}
                </Text>
              </View>
            </View>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setReceiveMoneyModalOpen(false)}
            >
              <Text style={styles.qrCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SendMoneyModal
        visible={sendMoneyModalOpen}
        setVisible={setSendMoneyModalOpen}
      />
      <ReferalModal
        visible={referalModalOpen}
        setVisible={setReferalModalOpen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 8,
  },
  profileCard: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.grayTextColor.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileDetail: {
    color: colors.cardBackground.light,
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  qrButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  qrButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  activitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.grayTextColor.DEFAULT || '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red.DEFAULT || '#ef4444',
    gap: 8,
  },
  logoutText: {
    color: colors.red.DEFAULT || '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: colors.textInputBackground.DEFAULT,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    maxHeight: '85%',
    overflowY: 'auto',
    gap: 16,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  qrModalTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  qrUserInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.cardBackground.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  qrAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  qrAvatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  qrUsername: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  qrEmail: {
    color: colors.grayTextColor.DEFAULT,
    fontSize: 14,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  qrIdContainer: {
    width: '100%',
    backgroundColor: colors.background.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  qrIdLabel: {
    color: colors.grayTextColor.dark,
    fontSize: 12,
    marginBottom: 4,
  },
  qrIdText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  qrInstructions: {
    color: colors.grayTextColor.DEFAULT || '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCloseButton: {
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
  },
  qrCloseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BalanceCard;
