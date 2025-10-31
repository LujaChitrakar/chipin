import { View, Text, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Button from '../common/Button';
import { QrCode } from 'lucide-react-native';
import colors from '@/assets/colors';
import QRScannerScreen from '../QrScannerScreen';
import { checkUserByUserIdOrEmail } from '@/services/api/friendsApi';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const ScanUserQrButton = ({ buttonText = '' }: { buttonText?: string }) => {
  const [visible, setVisible] = useState(false);

  const handleScannedData = async (data: string) => {
    try {
      console.log('DATA SCANNED', data);
      const userData = await checkUserByUserIdOrEmail(data);
      console.log('USER DATA:', userData);
      if (userData?.data?._id) {
        router.push(`/tabs/friends/${userData?.data?._id}`);
      }
    } catch (error: any) {
      console.log('ERROR GETTING::', error?.response?.data);
    }
  };

  return (
    <View>
      <Button
        title={buttonText}
        icon={<QrCode size={18} />}
        onPress={() => {
          setVisible(true);
        }}
        style={{
          justifyContent: 'center',
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      />
      <Modal
        visible={visible}
        transparent
        animationType='fade'
        onRequestClose={() => setVisible(false)}
      >
        {/* Overlay */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          {/* Modal Container */}
          <View
            style={{
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 24,
              width: '100%',
              maxWidth: 400,
              borderWidth: 1,
              borderColor: colors.cardBackground.DEFAULT,
              padding: 30,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
              >
                Scan Friend Profile
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Feather
                  name='x'
                  size={24}
                  color={colors.grayTextColor.DEFAULT}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                height: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <QRScannerScreen
                onScan={(data) => {
                  handleScannedData(data);
                }}
                styles={{
                  minHeight: 185,
                  minWidth: 250,
                  width: 50,
                  height: 40,
                }}
                laserColor='transparent'
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: colors.cardBackground.light,
                paddingVertical: 12,
                borderRadius: 50,
                alignItems: 'center',
              }}
              onPress={() => setVisible(false)}
            >
              <Text
                style={{
                  color: colors.white,
                  fontWeight: '600',
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScanUserQrButton;
