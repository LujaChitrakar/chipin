// src/components/borrow/BorrowRequestCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import colors from '@/assets/colors';
import { HandHelping } from 'lucide-react-native';
import Button from '../common/Button';
import {
  useAcceptBorrowRequest,
  useRejectBorrowRequest,
} from '@/services/api/borrowApi';
import { useQueryClient } from '@tanstack/react-query';
import { useSendUSDC } from '@/services/api/wallet';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';

export const BorrowRequestCard = ({
  request,
  isIncoming,
}: {
  request: any;
  isIncoming: boolean;
}) => {
  const { amount, reason, status } = request;
  if (status !== 'PENDING') return null;
  const { wallets } = useEmbeddedSolanaWallet();
  const queryClient = useQueryClient();

  const { mutate: acceptBorrowRequest, isPending: accepting } =
    useAcceptBorrowRequest();
  const { mutate: rejectBorrowRequest, isPending: rejecting } =
    useRejectBorrowRequest();

  const { mutate: sendUsdc, isPending: sendingMoney } = useSendUSDC();

  const onApprove = (requestId: string) => {
    if (!wallets || wallets.length === 0) {
      ToastAndroid.showWithGravity(
        'Wallet not initialized.',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM+20
      );
      return;
    }
    sendUsdc(
      {
        recipient: request.requestor?.wallet_public_key,
        amount: request.amount,
        wallet: wallets?.[0],
      },
      {
        onSuccess: (sendResponse: any) => {
          acceptBorrowRequest(
            {
              requestId,
              transactionId: sendResponse.transactionId,
            },
            {
              onSuccess: (response: any) => {
                ToastAndroid.showWithGravity(
                  response?.message || 'Borrow request accepted successfully',
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM+20
                );
                queryClient.invalidateQueries({
                  queryKey: ['requests-to-me'],
                });
                queryClient.invalidateQueries({
                  queryKey: ['wallet-balance'],
                });
              },
              onError: (error: any) => {
                ToastAndroid.showWithGravity(
                  error?.response?.message || 'Borrow request failed to accept',
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM+20
                );
              },
            }
          );
        },
      }
    );
  };

  const onDeny = (requestId: string) => {
    rejectBorrowRequest(requestId, {
      onSuccess: (response: any) => {
        ToastAndroid.showWithGravity(
          response?.message || 'Borrow request denied successfully',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM+20
        );
        queryClient.invalidateQueries({
          queryKey: ['requests-to-me'],
        });
        queryClient.invalidateQueries({
          queryKey: ['wallet-balance'],
        });
      },
      onError: (error: any) => {
        ToastAndroid.showWithGravity(
          error?.response?.message || 'Borrow request failed to accept',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM+20
        );
      },
    });
  };

  return (
    <View
      style={{
        backgroundColor: colors.cardBackground.DEFAULT,
        borderRadius: 18,
        padding: 16,
        marginTop: 20,
        marginHorizontal: 5,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text
          style={{
            color: colors.grayTextColor.DEFAULT,
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {isIncoming ? 'WANTS TO BORROW' : 'YOU REQUESTED TO BORROW'}
        </Text>
        <View
          style={{
            width: 30,
            height: 30,
            backgroundColor: colors.textInputBackground.DEFAULT,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HandHelping size={16} color={colors.white} />
        </View>
        <Text
          style={{
            color: colors.grayTextColor.dark,
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          $
        </Text>
        <Text
          style={{
            color: colors.white,
            fontSize: 16,
            fontWeight: '400',
          }}
        >
          {amount.toFixed(2)}
        </Text>
      </View>
      {reason && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text style={styles.reason}>Purpose: {reason}</Text>
        </View>
      )}

      {isIncoming && (
        <View style={styles.buttonRow}>
          <Button
            loading={accepting || sendingMoney}
            title='Approve'
            style={{ ...styles.approveBtn, ...styles.btn }}
            onPress={() => onApprove(request._id)}
          ></Button>

          <Button
            loading={rejecting}
            title='Deny'
            style={{ ...styles.denyBtn, ...styles.btn }}
            onPress={() => onDeny(request._id)}
          ></Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    marginHorizontal: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerText: {
    color: colors.grayTextColor.DEFAULT,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reason: {
    color: colors.grayTextColor.dark,
    marginTop: 8,
    fontSize: 14,
  },
  status: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pending: { color: '#FFC107' }, // amber for PENDING
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 50,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: colors.green[700],
    borderRadius: 50,
    paddingVertical: 15,
  },
  denyBtn: {
    backgroundColor: colors.red[500],
    borderRadius: 50,
    paddingVertical: 15,
  },
  btnText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
});
