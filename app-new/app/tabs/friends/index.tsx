import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ToastAndroid,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  X,
  Mail,
  Check,
  XCircle,
  UserRoundPlus,
} from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import {
  useGetMyFriendRequests,
  useGetMyFriends,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '@/services/api/friendsApi';
import colors from '@/assets/colors';
import { launchCamera } from 'react-native-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractQrContentFromImage } from '@/services/qrServices';
import QRScannerScreen from '@/components/QrScannerScreen';
import GroupPageHeader from '@/components/group/GroupPageHeader';
import LendBorrowButton from '@/components/friends/LendBorrowButtons';
import Button from '@/components/common/Button';
import FriendRequestCard from '@/components/friends/FriendRequestCard';
import FriendCard from '@/components/friends/FriendCard';

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');

  // Pagination state
  const [friendsPage, setFriendsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const [allFriends, setAllFriends] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const {
    data: myFriends,
    isLoading: myFriendsLoading,
    isFetching: friendsFetching,
  } = useGetMyFriends({
    page: friendsPage,
    limit: 10,
    q: searchQuery,
  });

  const {
    data: friendRequests,
    isLoading: friendRequestsLoading,
    isFetching: requestsFetching,
  } = useGetMyFriendRequests({
    page: requestsPage,
    limit: 10,
  });

  const { mutate: sendFriendRequest, isPending: sendingFriendRequest } =
    useSendFriendRequest();

  // Update friends list when data changes
  React.useEffect(() => {
    if (myFriends?.data) {
      if (friendsPage === 1) {
        setAllFriends(myFriends.data);
      } else {
        setAllFriends((prev) => [...prev, ...myFriends.data]);
      }
    }
  }, [myFriends]);

  // Update requests list when data changes
  React.useEffect(() => {
    if (friendRequests?.data) {
      if (requestsPage === 1) {
        setAllRequests(friendRequests.data);
      } else {
        setAllRequests((prev) => [...prev, ...friendRequests.data]);
      }
    }
  }, [friendRequests]);

  // Reset pagination when search query changes
  React.useEffect(() => {
    setFriendsPage(1);
    setAllFriends([]);
  }, [searchQuery]);

  const friendsCount = myFriends?.pagination?.totalCount || 0;
  const hasMoreFriends = myFriends?.pagination?.hasNextPage || false;
  const hasMoreRequests = friendRequests?.pagination?.hasNextPage || false;

  const handleSendFriendRequest = (email: string) => {
    sendFriendRequest(email, {
      onSuccess: (response: any) => {
        console.log('SUCCESS::::', response);
        ToastAndroid.showWithGravity(
          'Friend request sent',
          ToastAndroid.BOTTOM,
          ToastAndroid.LONG
        );
        setShowAddFriendModal(false);
        setFriendEmail('');
      },
      onError: (error: any) => {
        console.log('ERROR::::', error?.response?.data);
        ToastAndroid.showWithGravity(
          error?.response?.data?.message || 'Failed to send',
          ToastAndroid.BOTTOM,
          ToastAndroid.LONG
        );
      },
    });
  };

  const handleAddFriend = () => {
    if (friendEmail.trim()) {
      handleSendFriendRequest(friendEmail.trim());
    }
  };

  const loadMoreFriends = () => {
    if (!friendsFetching && hasMoreFriends) {
      setFriendsPage((prev) => prev + 1);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title='Friends' />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              console.log(" INVALIDATING....");
              queryClient.invalidateQueries({
                queryKey: ['my-friends'],
              });
            }}
            refreshing={myFriendsLoading}
          />
        }
        onMomentumScrollEnd={() => {
          if (hasMoreFriends) {
            loadMoreFriends();
          }
        }}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <GroupPageHeader />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: 50,
              flex: 1,
              backgroundColor: colors.textInputBackground.DEFAULT,
              padding: 4,
              paddingHorizontal: 20,
              gap: 4,
              borderRadius: 15,
            }}
          >
            <Search size={20} color={colors.grayTextColor.DEFAULT} />
            <TextInput
              placeholder='Search Friends'
              placeholderTextColor={colors.grayTextColor.dark}
              style={{ flex: 1, color: colors.white, paddingVertical: 8 }}
              value={searchQuery}
              onChangeText={(searchQuery: string) => {
                setSearchQuery(searchQuery);
              }}
            />
          </View>
          <LendBorrowButton />
          <View
            style={{
              width: '100%',
              height: 1.5,
              backgroundColor: colors.white + '11',
              marginVertical: 10,
            }}
          ></View>
          <View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: colors.grayTextColor.DEFAULT,
                  fontSize: 16,
                }}
              >
                Friends
              </Text>
              <Button
                title='Add'
                icon={<UserRoundPlus size={18} />}
                onPress={() => {
                  setShowAddFriendModal(true);
                }}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  height: 40,
                  gap: 8,
                }}
                textStyle={{
                  fontSize: 14,
                }}
              />
            </View>
            {myFriendsLoading && friendRequestsLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator
                  size='large'
                  color={colors.primary.DEFAULT}
                />
              </View>
            ) : allFriends.length === 0 && allRequests.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'No friends found'
                    : 'No friends yet.\nAdd friends to get started!'}
                </Text>
              </View>
            ) : (
              <View style={styles.listContent}>
                {allRequests.length > 0 && (
                  <View>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Friend Requests</Text>
                      <Text style={styles.sectionCount}>
                        {allRequests.length}
                      </Text>
                    </View>
                    <View>
                      {allRequests.map((item, index) => (
                        <FriendRequestCard
                          key={item._id || item.id || index.toString()}
                          friendData={item}
                          setAllRequests={setAllRequests}
                        />
                      ))}
                    </View>
                  </View>
                )}
                <View>
                  {allFriends.map((item, index) => (
                    <View key={item._id || item.id || index.toString()}>
                      <FriendCard friend={item} />
                      <View
                        style={{
                          width: '100%',
                          height: 1.5,
                          backgroundColor: colors.white + '11',
                        }}
                      ></View>
                    </View>
                  ))}
                </View>
                {hasMoreFriends && (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator
                      size='small'
                      color={colors.primary.DEFAULT}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowAddFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Friend</Text>
              <TouchableOpacity
                onPress={() => setShowAddFriendModal(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.gray.DEFAULT} />
              </TouchableOpacity>
            </View>

            {sendingFriendRequest ? (
              <View style={styles.centered}>
                <ActivityIndicator
                  size='large'
                  color={colors.primary.DEFAULT}
                />
              </View>
            ) : (
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.emailInput}>
                  <Mail size={20} color={colors.grayTextColor.DEFAULT} />
                  <TextInput
                    placeholder='friend@example.com'
                    placeholderTextColor={colors.grayTextColor.DEFAULT}
                    value={friendEmail}
                    onChangeText={setFriendEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    style={styles.emailTextInput}
                  />
                </View>
                <Text style={styles.orText}>Or</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowScanner(true);
                  }}
                  style={styles.qrButton}
                >
                  <MaterialCommunityIcons
                    name='qrcode-scan'
                    size={20}
                    color={colors.white}
                  />
                  <Text style={styles.qrButtonText}>Scan QR</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowAddFriendModal(false)}
                style={styles.cancelButton}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!sendingFriendRequest) {
                    handleAddFriend();
                  }
                }}
                style={[
                  styles.confirmButton,
                  !friendEmail.trim() && styles.confirmButtonDisabled,
                ]}
                activeOpacity={0.8}
                disabled={!friendEmail.trim() || sendingFriendRequest}
              >
                <Text style={styles.confirmButtonText}>Add Friend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showScanner}
        transparent
        animationType='fade'
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.modalOverlay}>
          <QRScannerScreen
            onScan={(data) => {
              const emailRegex =
                /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
              const match = data.match(emailRegex);

              if (match) {
                const email = match[0].trim();
                setFriendEmail(email);
                handleSendFriendRequest(email);
                setShowScanner(false);
              } else {
                ToastAndroid.showWithGravity(
                  'No valid email found in QR code',
                  ToastAndroid.BOTTOM,
                  ToastAndroid.LONG
                );
              }
            }}
            styles={undefined}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.gray.DEFAULT,
    textAlign: 'center',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    backgroundColor: colors.background.DEFAULT,
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
    color: colors.gray[100],
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
    borderColor: colors.white + '11',
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
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
  qrButton: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCount: {
    backgroundColor: colors.cardBackground.light,
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
});

export default FriendsPage;
