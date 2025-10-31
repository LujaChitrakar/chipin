import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import colors from '@/assets/colors';
import QRScannerScreen from '../QrScannerScreen';
import {
  getUserByWalletAddress,
  useGetMyFriends,
} from '@/services/api/friendsApi';
import { useSendUSDC } from '@/services/api/wallet';
import {
  ChevronDown,
  DollarSign,
  KeyRound,
  QrCode,
  UserRound,
  X,
} from 'lucide-react-native';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { useCreateMoneyLentActivity } from '@/services/api/recentsApi';
import { useGetMyProfile } from '@/services/api/authApi';
import { useQueryClient } from '@tanstack/react-query';
import { useSendBorrowRequest } from '@/services/api/borrowApi';

const BorrowLendModal = ({
  visible,
  setVisible,
  action,
  defaultSelectedFriend,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  action: 'LEND' | 'BORROW';
  defaultSelectedFriend?: any;
}) => {
  const queryClient = useQueryClient();
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();

  const { wallets } = useEmbeddedSolanaWallet();
  const [amount, setAmount] = useState('');
  const [reason, setPurpose] = useState('');
  const [visibleDropdown, setVisibleDropdown] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>();
  const { data: friendsData, isLoading: myFriendsLoading } = useGetMyFriends({
    page: 1,
    limit: 10,
    q: '',
  });

  useEffect(() => {
    setSelectedFriend(defaultSelectedFriend);
  }, [defaultSelectedFriend]);

  const {
    mutate: sendMoney, // takes { amount, recipeint, and wallet object from useSolanaEmbeddedWallets}
    isPending: sendingMoney,
  } = useSendUSDC();
  const { mutate: addRecentActivity, isPending: addingRecentActivity } =
    useCreateMoneyLentActivity();
  const { mutate: sendBorrowRequest, isPending: sendingBorrowRequest } =
    useSendBorrowRequest();

  const handleSendBorrowRequest = () => {
    const borrowData = {
      userEmail: selectedFriend?.email,
      reason: reason || '-',
      amount,
    };
    sendBorrowRequest(borrowData, {
      onSuccess: (response: any) => {
        ToastAndroid.showWithGravity(
          `Borrow request of ${amount} sent to ${
            selectedFriend?.fullname ||
            selectedFriend?.username ||
            selectedFriend?.email
          }`,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM+20
        );
        setAmount('');
        setPurpose('');
        setVisible(false);
      },
      onError: (error: any) => {
        ToastAndroid.showWithGravity(
          `${error?.response?.message || 'Failed to send borrow request'}`,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM+20
        );
      },
    });
  };

  const handleLendMoney = () => {
    if (action === 'BORROW') {
      handleSendBorrowRequest();
      return;
    }
    if (!wallets || wallets.length === 0) {
      ToastAndroid.showWithGravity(
        'Wallet not initialized. Please wait few seconds',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM+20
      );
      return;
    }
    sendMoney(
      {
        amount: Number(amount),
        recipient: selectedFriend?.wallet_public_key,
        wallet: wallets[0],
      },
      {
        onSuccess: (response) => {
          console.log('RESPONSE FROM SEND MONEY::', response);
          addRecentActivity({
            lenderId: myProfile?.data?._id,
            borrowerId: selectedFriend?._id,
            amount,
            transactionId: response?.transactionId,
            lender_wallet_address: response?.paid_by_address,
            borrower_wallet_address: response?.paid_to_address,
            activityType: 'LENT_MONEY',
            reason,
          });
          ToastAndroid.showWithGravity(
            `${amount} was sent to ${
              selectedFriend?.fullname ||
              selectedFriend?.username ||
              selectedFriend?.email
            }`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM+20
          );
          setAmount('');
          setPurpose('');
          setVisible(false);
          queryClient.invalidateQueries({
            queryKey: ['recent-activities'],
          });
          queryClient.invalidateQueries({
            queryKey: ['wallet-balance'],
          });
        },
      }
    );
  };

  const renderAmountPurposeInputFields = () => {
    return (
      <>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1.5,
            borderBottomColor: colors.textInputBackground.DEFAULT,
          }}
        >
          <DollarSign size={24} color={colors.grayTextColor.DEFAULT} />
          <TextInput
            style={{
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 8,
              padding: 10,
              color: colors.white,
            }}
            placeholder='Enter Amount'
            placeholderTextColor={colors.grayTextColor.DEFAULT}
            value={amount}
            onChangeText={setAmount}
            keyboardType='numeric'
          />
        </View>

        <View
          style={{
            borderBottomWidth: 1.5,
            borderBottomColor: colors.textInputBackground.DEFAULT,
          }}
        >
          <TextInput
            style={{
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 8,
              padding: 10,
              color: colors.white,
            }}
            placeholder='Purpose'
            placeholderTextColor={colors.grayTextColor.DEFAULT}
            value={reason}
            onChangeText={setPurpose}
          />
        </View>
      </>
    );
  };

  const renderAvatar = (friend: any) => {
    const initial = friend.fullname
      ? friend.fullname.charAt(0).toUpperCase()
      : friend.email.charAt(0).toUpperCase();
    return (
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
    );
  };

  const renderSelectedFriend = (styles = {}) => {
    if (!selectedFriend) return null;
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
        {renderAvatar(selectedFriend)}
        <View>
          <Text style={{ color: colors.white, fontWeight: '600' }}>
            {selectedFriend.fullname || selectedFriend.username}
          </Text>
          <Text style={{ color: colors.grayTextColor.DEFAULT }}>
            {selectedFriend.email}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={() => setVisible(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
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
            justifyContent: 'flex-start',
            gap: 30,
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 20,
              textAlign: 'left',
            }}
          >
            {action === 'BORROW' ? 'Borrow Money' : 'Lend Money'}
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <View>
                <TouchableOpacity
                  onPress={() => setVisibleDropdown(true)}
                  style={{
                    borderBottomWidth: 1.5,
                    borderBottomColor: colors.textInputBackground.DEFAULT,
                    backgroundColor: colors.cardBackground.DEFAULT,
                    borderRadius: 8,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <UserRound size={24} color={colors.grayTextColor.DEFAULT} />
                    {selectedFriend ? (
                      renderSelectedFriend({
                        width: '80%',
                        backgroundColor: colors.transparent,
                        paddingHorizontal: 0,
                        paddingVertical: 4,
                        marginTop: 0,
                      })
                    ) : (
                      <Text
                        style={{
                          flex: 1,
                          color: colors.grayTextColor.DEFAULT,
                          fontSize: 14,
                        }}
                      >
                        Search/Select a friend
                      </Text>
                    )}
                    <ChevronDown
                      size={18}
                      color={colors.grayTextColor.DEFAULT}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {renderAmountPurposeInputFields()}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              gap: 15,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor:
                  !selectedFriend || !amount
                    ? colors.white + '99'
                    : colors.white,
                paddingVertical: 12,
                borderRadius: 50,
                alignItems: 'center',
              }}
              disabled={
                !selectedFriend ||
                !amount ||
                sendingMoney ||
                sendingBorrowRequest
              }
              onPress={handleLendMoney}
            >
              {sendingMoney || sendingBorrowRequest ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: colors.black, fontWeight: '600' }}>
                  {action === 'BORROW' ? 'Request Borrow' : 'Send'}
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
              <Text style={{ color: colors.white, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={visibleDropdown}
        transparent
        animationType='slide'
        onRequestClose={() => setVisibleDropdown(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardBackground.DEFAULT,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: '50%',
            }}
          >
            <FlatList
              data={friendsData?.data || []}
              keyExtractor={(item: any, index: number) => index?.toString()}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFriend(item);
                    setVisibleDropdown(false);
                  }}
                  style={{
                    paddingVertical: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    {renderAvatar(item)}
                    <View style={{ marginLeft: 10 }}>
                      <Text
                        style={{
                          color: colors.white,
                          fontWeight: '600',
                        }}
                      >
                        {item.fullname || item.username}
                      </Text>
                      <Text
                        style={{
                          color: colors.grayTextColor.DEFAULT,
                        }}
                      >
                        {item.email}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setVisibleDropdown(false)}
              style={{
                backgroundColor: colors.cardBackground.light,
                paddingVertical: 12,
                borderRadius: 50,
                alignItems: 'center',
                marginTop: 10,
              }}
              disabled={sendingMoney}
            >
              <Text style={{ color: colors.white, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default BorrowLendModal;
