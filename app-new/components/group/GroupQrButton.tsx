import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Button from '../common/Button';
import { QrCode } from 'lucide-react-native';
import colors from '@/assets/colors';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import WalletAddressDisplay from '../common/WalletAddressDisplay';

const GroupQrButton = ({ groupData }: { groupData: any }) => {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <>
      <Button
        icon={<QrCode />}
        title='Share'
        onPress={() => {
          setShowQRModal(true);
        }}
        style={{
          paddingHorizontal: 24,
        }}
      />

      <Modal
        visible={showQRModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Your Group Invite QR Code</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Feather name='x' size={24} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.qrIdContainer}>
                <Text
                  style={{
                    ...styles.qrIdLabel,
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  Group Code
                </Text>
                <WalletAddressDisplay
                  address={groupData?.data.groupCode || ''}
                  textStyle={{
                    ...styles.qrIdText,
                    fontSize: 18,
                    textAlign: 'center',
                  }}
                />
              </View>
            </View>

            <View style={styles.qrCodeContainer}>
              <QRCode
                value={groupData?.data.groupCode || 'no-id'}
                size={200}
                color={colors.black}
              />
            </View>

            <Text style={styles.qrInstructions}>
              Share this QR code to invite friends to group
            </Text>

            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.qrCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: colors.cardBackground.DEFAULT,
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
  qrInstructions: {
    color: colors.grayTextColor.DEFAULT,
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
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrIdContainer: {
    width: '100%',
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
});

export default GroupQrButton;
