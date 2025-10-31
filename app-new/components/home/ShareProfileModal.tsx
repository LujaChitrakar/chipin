import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import colors from '@/assets/colors';
import QRCode from 'react-native-qrcode-svg';
import { useGetMyProfile } from '@/services/api/authApi';

const ShareProfileModal = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const {
    data: userProfile,
    isLoading: myProfileLoading,
    error: myProfileError,
  } = useGetMyProfile();

  const renderProfileCard = (styles = {}) => {
    const initial = userProfile?.data.fullname
      ? userProfile?.data.fullname.charAt(0).toUpperCase()
      : userProfile?.data.email.charAt(0).toUpperCase();
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          width: '100%',
          backgroundColor: colors.cardBackground.dark,
          borderRadius: 10,
          paddingHorizontal: 15,
          gap: 10,
          ...styles,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.cardBackground.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            {initial}
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            {userProfile?.data?.fullname || userProfile?.data?.username}
          </Text>
          <Text style={{ color: colors.grayTextColor.DEFAULT }}>
            {userProfile?.data?.email}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.qrModalOverlay}>
        <View style={styles.qrModalContent}>
          <View style={styles.qrModalHeader}>
            <Text style={styles.qrModalTitle}>Share Profile</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Feather
                name='x'
                size={24}
                color={colors.grayTextColor.DEFAULT}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.qrCodeContainer}>
            <QRCode
              value={userProfile?.data?.email || 'no-id'}
              size={200}
              backgroundColor='white'
              color='black'
            />
          </View>

          {renderProfileCard()}

          <TouchableOpacity
            style={styles.qrCloseButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.qrCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
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
  sectionTitle: {
    color: colors.grayTextColor.DEFAULT || '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: colors.background.light,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 362,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  qrModalTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
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
  },
  qrIdLabel: {
    color: colors.grayTextColor.dark,
    fontSize: 12,
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
  },
  qrCloseButton: {
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 50,
    width: '100%',
  },
  qrCloseButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ShareProfileModal;
