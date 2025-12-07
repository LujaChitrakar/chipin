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
import React, { useState } from 'react';
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
import WalletAddressDisplay from '../common/WalletAddressDisplay';
import { useQueryClient } from "@tanstack/react-query";
import PasskeyAuth from '../common/PassKeyAuth';

const SendMoneyModal = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const { data: myProfile, isLoading: myProfileLoading } = useGetMyProfile();

  const { wallets } = useEmbeddedSolanaWallet();
  const [activeTab, setActiveTab] = useState<'QR' | 'Direct'>('QR');
  const [sendTo, setSendTo] = useState<'friends' | 'publickey'>('friends');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [targetPublicKey, setTargetPublicKey] = useState('');
  const [visibleDropdown, setVisibleDropdown] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>();
  const [visibleAuthentication, setVisibleAuthentication] = useState(false)
  const [_, setIsTransactionAuthenticated] = useState(false)//Here isTransaction is not used so replaced by '_'
  const { data: friendsData, isLoading: myFriendsLoading } = useGetMyFriends({
    page: 1,
    limit: 10,
    q: '',
  });

  const handleSearchUserByWallet = async (wallet_public_key: string) => {
    const userData = await getUserByWalletAddress(wallet_public_key);
    if (userData) {
      setSelectedFriend(userData);
      setTargetPublicKey(userData?.wallet_public_key);
    }
  };

  const {
    mutate: sendMoney, // takes { amount, recipeint, and wallet object from useSolanaEmbeddedWallets}
    isPending: sendingMoney,
  } = useSendUSDC();
  const { mutate: addRecentActivity, isPending: addingRecentActivity } =
    useCreateMoneyLentActivity();

  const handleTransaction = (isAuthenticated: boolean = false) => {
    console.log("during transacting", isAuthenticated)

    try {
      if (isAuthenticated) {
        console.log("after transacting")
        setVisibleAuthentication(false)

        if (!wallets || wallets.length === 0) {
          console.log("line 1")
          ToastAndroid.showWithGravity(
            'Wallet not initialized. Please wait few seconds',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM + 20
          );
          return;
        }

        if (activeTab === 'Direct' && sendTo === 'friends' && !selectedFriend) {
          ToastAndroid.showWithGravity(
            'Please select the friend to send money',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM + 20
          );
          return;
        }
        if (activeTab === 'Direct' && sendTo === 'publickey' && !targetPublicKey) {
          console.log("line 2")

          ToastAndroid.showWithGravity(
            'Please enter the public key',
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM + 20
          );
          return;
        }

        let receipientWalletAddress = selectedFriend?.wallet_public_key;
        if (
          activeTab === 'QR' ||
          (activeTab === 'Direct' && sendTo === 'publickey')
        ) {
          receipientWalletAddress = targetPublicKey;
          console.log("line 3", receipientWalletAddress)

        }

        sendMoney(
          {
            amount: Number(amount),
            recipient: receipientWalletAddress,
            wallet: wallets[0],
          },
          {
            onSuccess: (response) => {
              addRecentActivity({
                lenderId: myProfile?.data?._id,
                borrowerId: sendTo === 'publickey' ? null : selectedFriend?._id,
                amount,
                transactionId: response?.transactionId,
                lender_wallet_address: response?.paid_by_address,
                borrower_wallet_address: response?.paid_to_address,
                activityType: 'SENT_MONEY',
              });
              queryClient.invalidateQueries({
                queryKey: ["wallet-balance"],
              });
              ToastAndroid.showWithGravity(
                `${amount} was sent to ${sendTo === 'publickey'
                  ? targetPublicKey
                  : selectedFriend?.fullname ||
                  selectedFriend?.username ||
                  selectedFriend?.email
                }`,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM + 30
              );
              console.log("line 4 success")


              //       handleRescan();
              //       setAmount('');
              //       setPurpose('');
              // setVisible(false);
              //       setTargetPublicKey('');
            },
            onError: (err) => {

              ToastAndroid.showWithGravity(
                'Transaction failed: ' + (err.message || 'Unknown error'),
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM + 30);

              console.log("line 5 error", err)
            }
          }
        );

      }

      // setTimeout(() => {
      //   console.log("The transaction ", isAuthenticated)
      //   setIsTransactionAuthenticated(false)
      //   setVisible(false)
      // }, 3000)



    } catch (err) {
      console.log("Error while transacting", err)
    } finally {
      setIsTransactionAuthenticated(false)
      handleRescan();
      setAmount('');
      setPurpose('');
      setVisible(false);
      setTargetPublicKey('');

    }

  }
  const handleSend = () => {
    setVisibleAuthentication(true)
    console.log("before transacting")
    // if (!wallets || wallets.length === 0) {
    //   ToastAndroid.showWithGravity(
    //     'Wallet not initialized. Please wait few seconds',
    //     ToastAndroid.LONG,
    //     ToastAndroid.BOTTOM + 20
    //   );
    //   return;
    // }

    // if (activeTab === 'Direct' && sendTo === 'friends' && !selectedFriend) {
    //   ToastAndroid.showWithGravity(
    //     'Please select the friend to send money',
    //     ToastAndroid.LONG,
    //     ToastAndroid.BOTTOM + 20
    //   );
    //   return;
    // }
    // if (activeTab === 'Direct' && sendTo === 'publickey' && !targetPublicKey) {
    //   ToastAndroid.showWithGravity(
    //     'Please enter the public key',
    //     ToastAndroid.LONG,
    //     ToastAndroid.BOTTOM + 20
    //   );
    //   return;
    // }

    // let receipientWalletAddress = selectedFriend?.wallet_public_key;
    // if (
    //   activeTab === 'QR' ||
    //   (activeTab === 'Direct' && sendTo === 'publickey')
    // ) {
    //   receipientWalletAddress = targetPublicKey;
    // }

    // sendMoney(
    //   {
    //     amount: Number(amount),
    //     recipient: receipientWalletAddress,
    //     wallet: wallets[0],
    //   },
    //   {
    //     onSuccess: (response) => {
    //       addRecentActivity({
    //         lenderId: myProfile?.data?._id,
    //         borrowerId: sendTo === 'publickey' ? null : selectedFriend?._id,
    //         amount,
    //         transactionId: response?.transactionId,
    //         lender_wallet_address: response?.paid_by_address,
    //         borrower_wallet_address: response?.paid_to_address,
    //         activityType: 'SENT_MONEY',
    //       });
    //       queryClient.invalidateQueries({
    //         queryKey: ["wallet-balance"],
    //       });
    //       ToastAndroid.showWithGravity(
    //         `${amount} was sent to ${sendTo === 'publickey'
    //           ? targetPublicKey
    //           : selectedFriend?.fullname ||
    //           selectedFriend?.username ||
    //           selectedFriend?.email
    //         }`,
    //         ToastAndroid.LONG,
    //         ToastAndroid.BOTTOM + 30
    //       );

    //       handleRescan();
    //       setAmount('');
    //       setPurpose('');
    //       setTargetPublicKey('');
    //       setVisible(false);
    //     },
    //   }
    // );
  };

  // Reset function for Rescan button
  const handleRescan = () => {
    setSelectedFriend(undefined);
    setTargetPublicKey('');
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
            // display: 'flex',
            // flexDirection: 'row',
            // alignItems: 'center',
            // width: '100%',
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
            value={purpose}
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
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 16,
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
              onPress={() => setActiveTab('QR')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor:
                  activeTab === 'QR' ? colors.white : 'transparent',
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === 'QR'
                      ? colors.black
                      : colors.grayTextColor.DEFAULT,
                  fontWeight: '600',
                }}
              >
                Send By QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('Direct')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor:
                  activeTab === 'Direct' ? colors.white : 'transparent',
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === 'Direct'
                      ? colors.black
                      : colors.grayTextColor.DEFAULT,
                  fontWeight: '600',
                }}
              >
                Send Direct
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'QR' ? (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                marginHorizontal: 'auto',
                gap: 16,
              }}
            >
              {selectedFriend ? (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    width: '100%',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    {renderSelectedFriend({
                      backgroundColor: colors.transparent,
                      width: '80%',
                      paddingHorizontal: 0,
                    })}
                    <TouchableOpacity
                      onPress={handleRescan}
                      style={{
                        backgroundColor: colors.grayTextColor.DEFAULT,
                        borderRadius: 50,
                        padding: 8,
                      }}
                    >
                      <X size={12} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                  {renderAmountPurposeInputFields()}
                </View>
              ) : targetPublicKey ? (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    width: '100%',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <WalletAddressDisplay address={targetPublicKey} />
                    <TouchableOpacity
                      onPress={handleRescan}
                      style={{
                        backgroundColor: colors.grayTextColor.DEFAULT,
                        borderRadius: 50,
                        padding: 8,
                      }}
                    >
                      <X size={12} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                  {renderAmountPurposeInputFields()}
                </View>
              ) : (
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
                      if (typeof data === 'string') {
                        const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
                        if (solanaRegex.test(data)) {
                          handleSearchUserByWallet(data);
                          setTargetPublicKey(data);
                        }
                      }
                    }}
                    styles={{
                      minHeight: 185,
                      minWidth: 250,

                    }}
                    laserColor='transparent'
                  />
                  <Text
                    style={{
                      color: colors.grayTextColor.DEFAULT,
                    }}
                  >
                    Scan the QR of wallet address to Send Money
                  </Text>
                </View>
                // <>
                //   <Text

                //     style={{
                //       minHeight: 185,
                //       minWidth: 250,
                //       width: 50,
                //       height: 40,
                //     }}
                //   >
                //     Yoo
                //   </Text>
                // </>
              )}
            </View>
          ) : (
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
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.grayTextColor.dark,
                  }}
                >
                  SEND TO
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: colors.cardBackground.light,
                      marginRight: 10,
                      borderWidth: 1,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      borderColor:
                        sendTo === 'friends'
                          ? colors.white
                          : colors.transparent,
                    }}
                    onPress={() => {
                      setSendTo('friends');
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderWidth: 3,
                        borderColor:
                          sendTo === 'friends'
                            ? colors.white
                            : colors.white + '33',
                        borderRadius: 100,
                        backgroundColor: colors.transparent,
                      }}
                    />
                    <Text style={{ color: colors.white }}>Friends</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: colors.cardBackground.light,
                      marginRight: 10,
                      borderWidth: 1,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      borderColor:
                        sendTo === 'publickey'
                          ? colors.white
                          : colors.transparent,
                    }}
                    onPress={() => {
                      setSendTo('publickey');
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderWidth: 3,
                        borderColor:
                          sendTo === 'publickey'
                            ? colors.white
                            : colors.white + '99',
                        borderRadius: 100,
                        backgroundColor: colors.transparent,
                      }}
                    />
                    <Text style={{ color: colors.white }}>Public Key</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {sendTo === 'friends' ? (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: colors.grayTextColor.dark,
                        marginBottom: 4,
                      }}
                    >
                      Select Friend
                    </Text>
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
                        <UserRound
                          size={24}
                          color={colors.grayTextColor.DEFAULT}
                        />
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
              ) : (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderBottomWidth: 1.5,
                      borderBottomColor: colors.textInputBackground.DEFAULT,
                    }}
                  >
                    <KeyRound size={24} color={colors.grayTextColor.DEFAULT} />
                    <TextInput
                      style={{
                        backgroundColor: colors.cardBackground.DEFAULT,
                        borderRadius: 8,
                        padding: 10,
                        color: colors.white,
                        width: '90%',
                      }}
                      placeholder='Enter Public Key'
                      placeholderTextColor={colors.grayTextColor.DEFAULT}
                      value={targetPublicKey}
                      onChangeText={(text) => {
                        setTargetPublicKey(text);
                        const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
                        if (solanaRegex.test(text)) {
                          handleSearchUserByWallet(text);
                        } else {
                          setSelectedFriend(undefined);
                        }
                      }}
                      keyboardType='numeric'
                    />
                  </View>
                  {renderAmountPurposeInputFields()}
                </View>
              )}
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
              style={{
                flex: 1,
                backgroundColor: !amount ? colors.white + '99' : colors.white,
                paddingVertical: 12,
                borderRadius: 50,
                alignItems: 'center',
              }}
              disabled={!amount || sendingMoney}
              onPress={handleSend}
            >
              {sendingMoney ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: colors.black, fontWeight: '600' }}>
                  {activeTab === 'QR' ? 'Send' : 'Send'}
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
        visible={visibleAuthentication}
        transparent
        animationType='fade'
        onRequestClose={() => setVisibleAuthentication(false)}
      >
        <PasskeyAuth setIsAuthenticated={setIsTransactionAuthenticated} handleTransaction={handleTransaction} />
      </Modal>

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
                    setTargetPublicKey(item?.wallet_public_key);
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

export default SendMoneyModal;
