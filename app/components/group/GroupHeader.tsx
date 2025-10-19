import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/assets/colors';
import { useGetMyProfile } from '@/services/api/authApi';
import { useNavigation, useRouter } from 'expo-router';
import { calculateGroupBalance } from '@/utils/balance.utils';
import QRCode from "react-native-qrcode-svg";

const GroupHeader = ({
  title,
  backButton,
  onBackPress,
  groupData,
  showQr = true,
}: {
  title: string;
  backButton: boolean;
  onBackPress?: () => void;
  groupData: any;
  showQr: boolean;
}) => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const router = useRouter();

  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();
  const {
    youAreOwed: totalOwedToUser,
    youOwe: totalOwedByUser,
    netBalance,
  } = calculateGroupBalance(groupData?.data, myProfile?.data?._id);
  const [showQRModal, setShowQRModal] = useState(false);


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
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            {/* Header */}
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Your Group Invite QR Code</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Feather name='x' size={24} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>

            {/* QR Code */}
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={groupData?.data.groupCode || 'no-id'}
                size={200}
                color={colors.gray[800]}
              />
            </View>

            {/* Instructions */}
            <Text style={styles.qrInstructions}>
              Share this QR code to invite friends to group
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.qrCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
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
      </View>

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
          onPress={() => {
            router.push(`/tabs/groups/${groupData?.data?._id}/settings`);
          }}
        >
          <Feather name='settings' size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
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
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setShowQRModal(true)}
        >
          <MaterialCommunityIcons
            name='qrcode'
            size={20}
            color={colors.white}
          />
          <Text style={styles.qrButtonText}>Show QR</Text>
        </TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  qrButton: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white + '22',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-end',
    minWidth: 88,
    maxWidth: '50%',
    marginBottom: 16,
  },
  qrButtonText: {
    color: colors.white,
    fontSize: 14,
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
    backgroundColor: colors.gray[800] || '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
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
    backgroundColor: colors.primary.DEFAULT || '#10b981',
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
    color: colors.gray[400] || '#9ca3af',
    fontSize: 14,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrIdContainer: {
    width: '100%',
    backgroundColor: colors.gray[700] || '#334155',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  qrIdLabel: {
    color: colors.gray[400] || '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  qrIdText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  qrInstructions: {
    color: colors.gray[400] || '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCloseButton: {
    backgroundColor: colors.primary.DEFAULT || '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  qrCloseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GroupHeader;
