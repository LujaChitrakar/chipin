import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, { useState } from 'react';
import colors from '@/assets/colors';
import { Feather } from '@expo/vector-icons';
import { TextQuote } from 'lucide-react-native';
import { useApplyReferalCode } from '@/services/api/friendsApi';
import QRScannerScreen from "../QrScannerScreen";

const ReferalModal = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const [referalCode, setReferalCode] = useState('');
  const [activeTab, setActiveTab] = useState<'Scan' | 'Enter'>('Scan');

  const { mutate: applyCode, isPending: applyingCode } = useApplyReferalCode();

  const handleApplyCode = (referalCode: string) => {
    applyCode(referalCode, {
      onSuccess: (response: any) => {
        ToastAndroid.showWithGravity(
          '50 points earned from referal.',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM+20
        );
        setVisible(false);
      },
      onError: (error: any) => {
        ToastAndroid.showWithGravity(
          'Error applying code',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM+20
        );
        setVisible(false);
      },
    });
  };

  const handleNotReferred = () => {
    applyCode('NOT_REFERRED', {
      onSuccess: (response: any) => {
        setVisible(false);
      },
      onError: (error: any) => {
        setVisible(false);
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={() => setVisible(false)}
    >
      {/* Modal Overlay */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        {/* Modal Content */}
        <View
          style={{
            backgroundColor: colors.cardBackground.DEFAULT,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.cardBackground.DEFAULT,
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: activeTab === 'Scan' ? 10 : 30,
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            Referred from a Friend?
          </Text>

          {/* Tab Header */}

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.cardBackground.dark,
              borderRadius: 12,
              padding: 8,
              gap: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('Scan')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor:
                  activeTab === 'Scan' ? colors.white : 'transparent',
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === 'Scan'
                      ? colors.black
                      : colors.grayTextColor.DEFAULT,
                  fontWeight: '600',
                }}
              >
                Scan Referal QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('Enter')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor:
                  activeTab === 'Enter' ? colors.white : 'transparent',
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === 'Enter'
                      ? colors.black
                      : colors.grayTextColor.DEFAULT,
                  fontWeight: '600',
                }}
              >
                Enter Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'Scan' && (
            <View
              style={{
                height: 240,
                marginHorizontal: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <QRScannerScreen
                onScan={(data) => {
                  const code = String(data ?? '').trim();
                  const isValid = /^[A-Za-z0-9]{8}$/.test(code);
                  handleApplyCode(code);
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
          )}
          {activeTab === 'Enter' && (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 0.5,
                width: '100%',
                paddingBottom: 8,
                borderBottomColor: colors.grayTextColor.DEFAULT,
                marginTop: 16,
              }}
            >
              <TextQuote size={24} color={colors.grayTextColor.DEFAULT} />
              <TextInput
                style={{
                  backgroundColor: colors.cardBackground.DEFAULT,
                  borderRadius: 8,
                  padding: 10,
                  flex: 1,
                  color: colors.white,
                }}
                placeholder='Enter Referal Code'
                placeholderTextColor={colors.grayTextColor.DEFAULT}
                value={referalCode}
                onChangeText={setReferalCode}
              />
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              gap: 15,
            }}
          >
            <TouchableOpacity
              disabled={applyingCode || !referalCode}
              style={{
                flex: 1,
                backgroundColor:
                  applyingCode || !referalCode
                    ? colors.white + '99'
                    : colors.white,
                paddingVertical: 12,
                borderRadius: 50,
                alignItems: 'center',
              }}
              onPress={() => handleApplyCode(referalCode)}
            >
              {applyingCode ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: colors.black, fontWeight: '600' }}>
                  Confirm
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.cardBackground.light,
                paddingVertical: 12,
                borderRadius: 50,
                alignItems: 'center',
              }}
              onPress={handleNotReferred}
            >
              <Text style={{ color: colors.white, fontWeight: '600' }}>
                Not Refered
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReferalModal;
