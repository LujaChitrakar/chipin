import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
} from 'react-native';
import React, { useState } from 'react';
import colors from '@/assets/colors';
import {
  useJoinGroupByGroupCode,
  useSearchGroupByGroupCode,
} from '@/services/api/groupApi';
import QRScannerScreen from '../QrScannerScreen';
import { Regex, UsersRound } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { router } from "expo-router";

const JoinGroupModal = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const [groupCode, setGroupCode] = useState('');
  const [activeTab, setActiveTab] = useState<'Scan' | 'Enter'>('Scan');
  const { data: groupByCode, isLoading: groupLoading } =
    useSearchGroupByGroupCode(groupCode);

  const { mutate: joinGroup, isPending: joiningGroup } =
    useJoinGroupByGroupCode();

  const handleJoinGroup = (groupCode: string) => {
    joinGroup(groupCode, {
      onSuccess: (response: any) => {
        console.log('JOINING GROUP RESPONSE:::', response?.data);
        queryClient.invalidateQueries({
          queryKey: ['my-groups'],
        });
        queryClient.invalidateQueries({
          queryKey: ['recent-activities'],
        });
        setGroupCode('');
        setVisible(false);
        if (response?.data?._id) {
          router.replace(`/tabs/groups/${response?.data?._id}`);
        } else {
          router.replace('/tabs/groups/');
        }
      },
      onError: (error: any) => {
        console.log('JOINING GROUP ERROR:::', error?.response?.data);
        ToastAndroid.showWithGravity(
          error?.response?.data?.message || 'Failed to join',
          ToastAndroid.BOTTOM+20,
          ToastAndroid.LONG
        );
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
                Scan Group QR
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

          <View />
          {activeTab === 'Scan' ? (
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
                  setGroupCode(data);
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
          ) : (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 16,

                marginBottom: 32,
                borderBottomWidth: 1.5,
                borderBottomColor: colors.textInputBackground.DEFAULT,
                marginTop: 30,
              }}
            >
              <Regex size={18} color={colors.cardBackground.light} style={{}} />
              <TextInput
                style={{
                  backgroundColor: colors.cardBackground.DEFAULT,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.white,
                  width: '100%',
                }}
                placeholder='Enter Group Code'
                placeholderTextColor={colors.grayTextColor.DEFAULT}
                value={groupCode}
                onChangeText={setGroupCode}
              />
            </View>
          )}

          {groupByCode?.data && (
            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                backgroundColor: colors.cardBackground.dark,
                paddingVertical: 15,
                borderRadius: 10,
                marginVertical: 30,
              }}
            >
              <UsersRound size={18} color={colors.white} />
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '400',
                    color: colors.white,
                  }}
                >
                  {groupByCode?.data?.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: colors.grayTextColor.dark,
                  }}
                >
                  {groupByCode?.data?.members?.length} members
                </Text>
              </View>
            </View>
          )}

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              gap: 15,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.white,
                paddingVertical: 12,
                borderRadius: 50,
                alignItems: 'center',
              }}
              onPress={() => {
                if (groupByCode?.data) {
                  handleJoinGroup(groupByCode?.data?.groupCode);
                }
              }}
            >
              {groupByCode?.data ? (
                <Text style={{ color: colors.black, fontWeight: '600' }}>
                  Join Now
                </Text>
              ) : (
                <Text style={{ color: colors.black, fontWeight: '600' }}>
                  {activeTab === 'Scan' ? 'Scanning...' : 'Search'}
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
              onPress={() => setVisible(false)}
            >
              <Text
                style={{
                  color: colors.white,
                  fontWeight: '600',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default JoinGroupModal;
