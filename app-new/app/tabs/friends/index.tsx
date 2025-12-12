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
import React, { useState, useEffect } from 'react';
import { Search, X, Mail, UserRoundPlus } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import {
  useGetMyFriendRequests,
  useGetMyFriends,
  useSendFriendRequest,
} from '@/services/api/friendsApi';
import colors from '@/assets/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
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
  const [showScanner, setShowScanner] = useState(false);

  // Pagination state
  const [friendsPage, setFriendsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const [allFriends, setAllFriends] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);

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

  useEffect(() => {
    setFriendsPage(1);
    setAllFriends([]);
  }, [searchQuery]);

  useEffect(() => {
    if (friendsPage === 1 && friendsFetching && !myFriends?.data) {
      setAllFriends([]);
    }
  }, [friendsFetching, friendsPage, myFriends?.data]);

  useEffect(() => {
    if (!myFriends?.data) return;

    const newData = Array.isArray(myFriends.data) ? myFriends.data : [];

    setAllFriends((prev) => {
      if (friendsPage === 1) {
        return newData;
      }

      const existingIds = new Set(prev.map((f) => f._id).filter(Boolean));
      const filteredNew = newData.filter(
        (f: any) => f._id && !existingIds.has(f._id)
      );
      return [...prev, ...filteredNew];
    });
  }, [myFriends, friendsPage]);

  useEffect(() => {
    if (requestsPage === 1 && requestsFetching && !friendRequests?.data) {
      setAllRequests([]);
    }
  }, [requestsFetching, requestsPage, friendRequests?.data]);

  useEffect(() => {
    if (!friendRequests?.data) return;

    const newData = Array.isArray(friendRequests.data)
      ? friendRequests.data
      : [];

    setAllRequests((prev) => {
      if (requestsPage === 1) {
        return newData;
      }
      const existingIds = new Set(prev.map((f) => f._id).filter(Boolean));
      const filteredNew = newData.filter(
        (f: any) => f._id && !existingIds.has(f._id)
      );
      return [...prev, ...filteredNew];
    });
  }, [friendRequests, requestsPage]);

  const friendsCount = myFriends?.pagination?.totalCount || 0;
  const hasMoreFriends = myFriends?.pagination?.hasNextPage ?? false;
  const hasMoreRequests = friendRequests?.pagination?.hasNextPage ?? false;

  const loadMoreFriends = () => {
    if (!friendsFetching && hasMoreFriends) {
      setFriendsPage((prev) => prev + 1);
    }
  };

  const loadMoreRequests = () => {
    if (!requestsFetching && hasMoreRequests) {
      setRequestsPage((prev) => prev + 1);
    }
  };

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['my-friends'] });
    queryClient.invalidateQueries({ queryKey: ['my-friend-requests'] });
    queryClient.invalidateQueries({
      queryKey: ['wallet-balance'],
    });
    setFriendsPage(1);
    setRequestsPage(1);
  };
  const handleSendFriendRequest = (email: string) => {
    sendFriendRequest(email, {
      onSuccess: () => {
        ToastAndroid.showWithGravity(
          'Friend request sent',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM + 20
        );
        setShowAddFriendModal(false);
        setFriendEmail('');
        queryClient.invalidateQueries({ queryKey: ['my-friend-requests'] });
      },
      onError: (error: any) => {
        ToastAndroid.showWithGravity(
          error?.response?.data?.message || 'Failed to send request',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM + 20
        );
      },
    });
  };

  const handleAddFriend = () => {
    if (friendEmail.trim()) {
      handleSendFriendRequest(friendEmail.trim());
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title='Friends' />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={myFriendsLoading && friendsPage === 1}
            onRefresh={onRefresh}
          />
        }
        onTouchEnd={loadMoreFriends}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <GroupPageHeader />

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.grayTextColor.DEFAULT} />
            <TextInput
              placeholder='Search Friends'
              placeholderTextColor={colors.grayTextColor.dark}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <LendBorrowButton friendId={undefined} />

          <View style={styles.divider} />

          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>Friends</Text>
              <Button
                title='Add'
                icon={<UserRoundPlus size={18} />}
                onPress={() => setShowAddFriendModal(true)}
                style={styles.addButton}
                textStyle={styles.addButtonText}
              />
            </View>

            {myFriendsLoading && friendsPage === 1 ? (
              <View style={styles.loader}>
                <ActivityIndicator
                  size='large'
                  color={colors.primary.DEFAULT}
                />
              </View>
            ) : allFriends.length === 0 &&
              allRequests.length === 0 &&
              !searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friends yet</Text>
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
                    {allRequests.map((item) => (
                      <FriendRequestCard
                        key={item._id}
                        friendData={item}
                        setAllRequests={setAllRequests}
                      />
                    ))}
                    {hasMoreRequests && (
                      <View style={styles.loadMoreButton}>
                        <TouchableOpacity onPress={loadMoreRequests}>
                          <Text style={styles.loadMoreText}>
                            Load More Requests
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <View>
                  {allFriends.map((item, index) => (
                    <View key={index}>
                      <FriendCard friend={item} />
                      {index < allFriends.length - 1 && (
                        <View style={styles.itemDivider} />
                      )}
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

      <Modal
        visible={showAddFriendModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowAddFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Friend Request</Text>
              <TouchableOpacity
                onPress={() => setShowAddFriendModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.gray.DEFAULT} />
              </TouchableOpacity>
            </View>

            {sendingFriendRequest ? (
              <View style={styles.loader}>
                <ActivityIndicator
                  size='large'
                  color={colors.primary.DEFAULT}
                />
              </View>
            ) : (
              <>
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
                    <Text style={styles.qrButtonText}>Scan QR Code</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setShowAddFriendModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddFriend}
                    style={[
                      styles.confirmButton,
                      !friendEmail.trim() && styles.confirmButtonDisabled,
                    ]}
                    disabled={!friendEmail.trim() || sendingFriendRequest}
                  >
                    <Text style={styles.confirmButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
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
                setShowScanner(false);
                setShowAddFriendModal(true);
              } else {
                ToastAndroid.showWithGravity(
                  'No valid email found in QR code',
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM + 20
                );
                setShowScanner(false);
                setShowAddFriendModal(false);
              }
            }}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textInputBackground.DEFAULT,
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 15,
    gap: 8,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.white + '11',
    marginVertical: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderText: {
    color: colors.grayTextColor.DEFAULT,
    fontSize: 16,
  },
  addButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    height: 40,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
  },
  loader: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.grayTextColor.DEFAULT,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  listContent: {
    gap: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
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
  itemDivider: {
    height: 1.5,
    backgroundColor: colors.white + '11',
    marginHorizontal: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadMoreText: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },

  // Modal Styles
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.white + '11',
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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.white + '11',
  },
  emailTextInput: {
    flex: 1,
    marginLeft: 12,
    color: colors.white,
    fontSize: 16,
  },
  orText: {
    color: colors.gray[100],
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  qrButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.white + '11',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
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
    borderRadius: 50,
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
});

export default FriendsPage;
