import { ToastAndroid, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import { HandCoins, PlusCircle, UserRoundPlus } from 'lucide-react-native';
import colors from '@/assets/colors';

import {
  Text,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  useCreateGroup,
  useGetMyGroups,
  useJoinGroupByGroupCode,
} from '@/services/api/groupApi';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetMyFriends } from '@/services/api/friendsApi';
import { Regex, X } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import LoadingScreen from '@/components/splash/LoadingScreen';
import QRScannerScreen from '../QrScannerScreen';

const LendBorrowButton = () => {
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          display: 'flex',
        }}
      >
        <Button
          title='Lend'
          icon={<HandCoins size={18} color={colors.white} />}
          onPress={() => {}}
          textColor={colors.white}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground.light,
          }}
        />
        <Button
          title='Borrow'
          icon={
            <HandCoins
              size={18}
              color={colors.white}
              style={{
                transform: [{ rotateY: '180deg' }],
              }}
            />
          }
          onPress={() => {}}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground.light,
          }}
          textColor={colors.white}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.cardBackground.DEFAULT,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground.DEFAULT,
  },
  modalTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    color: colors.white,
    marginBottom: 12,
    fontWeight: '500',
  },
  emailInput: {
    backgroundColor: colors.cardBackground.dark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBackground.DEFAULT,
  },
  emailTextInput: {
    flex: 1,
    marginLeft: 12,
    color: colors.white,
    fontSize: 16,
  },
  orText: {
    color: colors.white,
    marginHorizontal: 'auto',
    marginVertical: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray.DEFAULT,
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 16,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grayTextColor.DEFAULT,
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
});

export default LendBorrowButton;
