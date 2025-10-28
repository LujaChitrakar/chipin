import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ToastAndroid,
  SectionList,
} from "react-native";
import React, { useState } from "react";
import { UserPlus, Search, X, Mail, Check, XCircle } from "lucide-react-native";
import ScreenContainer from "@/components/ScreenContainer";
import ScreenHeader from "@/components/navigation/ScreenHeader";
import {
  useGetMyFriendRequests,
  useGetMyFriends,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from "@/services/api/friendsApi";
import colors from "@/assets/colors";
import { launchCamera } from "react-native-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { extractQrContentFromImage } from "@/services/qrServices";
import QRScannerScreen from "@/components/QrScannerScreen";
import { testApiConnection } from "@/services/api/apiConstants";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");

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

  const { mutate: acceptFriendRequest, isPending: acceptingRequest } =
    useAcceptFriendRequest();

  const { mutate: rejectFriendRequest, isPending: rejectingRequest } =
    useRejectFriendRequest();

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

  const testConnection = async () => {
    console.log("Testing API connection...");
    const isConnected = await testApiConnection();
    ToastAndroid.showWithGravity(
      isConnected ? "API Connected Successfully" : "API Connection Failed",
      ToastAndroid.BOTTOM,
      ToastAndroid.LONG
    );
  };

  const handleSendFriendRequest = (email: string) => {
    console.log("Sending friend request to:", email);
    sendFriendRequest(email, {
      onSuccess: (response: any) => {
        console.log("SUCCESS::::", response);
        ToastAndroid.showWithGravity(
          "Friend request sent successfully",
          ToastAndroid.BOTTOM,
          ToastAndroid.LONG
        );
        setShowAddFriendModal(false);
        setFriendEmail("");
        queryClient.invalidateQueries({ queryKey: ["my-friend-requests"] });
      },
      onError: (error: any) => {
        console.error("ERROR::::", error?.response?.data || error);
        console.error("Full error object:", JSON.stringify(error, null, 2));

        let errorMessage = "Failed to send friend request. Please try again.";

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.status) {
          errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        } else if (error?.code === "NETWORK_ERROR") {
          errorMessage =
            "Network error. Please check your internet connection.";
        }

        ToastAndroid.showWithGravity(
          errorMessage,
          ToastAndroid.BOTTOM,
          ToastAndroid.LONG
        );
      },
    });
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptFriendRequest(requestId, {
      onSuccess: () => {
        ToastAndroid.showWithGravity(
          "Friend request accepted",
          ToastAndroid.BOTTOM,
          ToastAndroid.SHORT
        );
        setAllRequests((prev) => prev.filter((req) => req._id !== requestId));
        queryClient.invalidateQueries({
          queryKey: ["my-friends"],
        });
      },
      onError: () => {
        ToastAndroid.showWithGravity(
          "Failed to accept request",
          ToastAndroid.BOTTOM,
          ToastAndroid.SHORT
        );
      },
    });
  };

  const handleRejectRequest = (requestId: string) => {
    rejectFriendRequest(requestId, {
      onSuccess: () => {
        ToastAndroid.showWithGravity(
          "Friend request rejected",
          ToastAndroid.BOTTOM,
          ToastAndroid.SHORT
        );
        setAllRequests((prev) => prev.filter((req) => req._id !== requestId));
      },
      onError: () => {
        ToastAndroid.showWithGravity(
          "Failed to reject request",
          ToastAndroid.BOTTOM,
          ToastAndroid.SHORT
        );
      },
    });
  };

  const pickImage = async () => {
    const result = await launchCamera({
      mediaType: "photo",
      quality: 1,
    });

    if (!result.didCancel) {
      const pickedImageUri = result.assets?.[0]?.uri || "";
      const extractedEmail = extractQrContentFromImage(pickedImageUri);
      handleSendFriendRequest(extractedEmail);
    }
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

  const loadMoreRequests = () => {
    if (!requestsFetching && hasMoreRequests) {
      setRequestsPage((prev) => prev + 1);
    }
  };

  const renderFriendRequest = ({ item }: { item: any }) => {
    const requester = item.user_one;

    return (
      <View style={styles.requestCard}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {requester?.username?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>

        {/* Request Info */}
        <View style={styles.requestInfo}>
          <Text style={styles.friendName}>
            {requester?.username || "Unknown User"}
          </Text>
          <Text style={styles.friendEmail}>
            {requester?.email || "No email"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.requestActions}>
          <TouchableOpacity
            onPress={() => handleAcceptRequest(item._id)}
            style={styles.acceptButton}
            activeOpacity={0.7}
            disabled={acceptingRequest}
          >
            <Check size={20} color={colors.white} strokeWidth={3} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRejectRequest(item._id)}
            style={styles.rejectButton}
            activeOpacity={0.7}
            disabled={rejectingRequest}
          >
            <X size={20} color={colors.white} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFriendItem = ({ friend }: { friend: any }) => {
    const toBePaid = friend.toBePaid;
    const toBeReceived = friend.toBeReceived;
    let owesYou = 0;
    let youOwe = 0;
    let amount = 0;
    if (toBePaid > toBeReceived) {
      youOwe = amount = toBePaid - toBeReceived;
    } else {
      owesYou = amount = toBeReceived - toBePaid;
    }

    return (
      <TouchableOpacity style={styles.friendCard} activeOpacity={0.7}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {friend?.username?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>

        {/* Friend Info */}
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>
            {friend?.username || "Unknown User"}
          </Text>
          <Text style={styles.friendEmail}>{friend?.email || "No email"}</Text>
        </View>

        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Text
            style={{
              ...styles.balanceAmount,
              ...((owesYou && styles.balancePositive) || {}),
              ...((youOwe && styles.balanceNegative) || {}),
            }}
          >
            ${amount.toFixed(2)}
          </Text>
          <Text
            style={{
              ...styles.balanceLabel,
              ...((owesYou && styles.balanceLabelPositive) || {}),
              ...((youOwe && styles.balanceLabelNegative) || {}),
            }}
          >
            {owesYou ? "owes you" : youOwe ? "you owe" : "settled"}
          </Text>
        </View>

        {/* Arrow indicator */}
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = (loading: boolean) => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
      </View>
    );
  };

  const sections: any[] = [];

  if (allRequests.length > 0) {
    sections.push({
      title: "Friend Requests",
      data: allRequests,
      type: "requests",
    });
  }

  sections.push({
    title: "Friends",
    data: allFriends,
    type: "friends",
  });

  return (
    <ScreenContainer>
      <ScreenHeader title="Friends" backButton={false} />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Friends</Text>
            <Text style={styles.friendCount}>
              {friendsCount} {friendsCount === 1 ? "friend" : "friends"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddFriendModal(true)}
            style={styles.addButton}
            activeOpacity={0.8}
          >
            <UserPlus size={18} color="white" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.gray[600] }]}
            onPress={testConnection}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Test API</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={20} color={colors.gray.DEFAULT} />
          <TextInput
            placeholder="Search friends..."
            placeholderTextColor={colors.gray.DEFAULT}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Content */}
        {myFriendsLoading && friendRequestsLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : allFriends.length === 0 && allRequests.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No friends found"
                : "No friends yet.\nAdd friends to get started!"}
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            renderItem={({ item, section }) =>
              section.type === "requests"
                ? renderFriendRequest({ item })
                : renderFriendItem({ friend: item })
            }
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.type === "requests" && (
                  <Text style={styles.sectionCount}>{allRequests.length}</Text>
                )}
              </View>
            )}
            keyExtractor={(item, index) =>
              item._id || item.id || index.toString()
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              // Load more based on last section
              if (sections[sections.length - 1]?.type === "friends") {
                loadMoreFriends();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter(
              friendsFetching || requestsFetching
            )}
          />
        )}
      </View>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        transparent
        animationType="fade"
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

            {/* Modal Content */}

            {sendingFriendRequest ? (
              <View style={styles.centered}>
                <ActivityIndicator
                  size="large"
                  color={colors.primary.DEFAULT}
                />
              </View>
            ) : (
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.emailInput}>
                  <Mail size={20} color={colors.gray.DEFAULT} />
                  <TextInput
                    placeholder="friend@example.com"
                    placeholderTextColor={colors.gray.DEFAULT}
                    value={friendEmail}
                    onChangeText={setFriendEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
                    name="qrcode-scan"
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
        animationType="fade"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.modalOverlay}>
          <QRScannerScreen
            onScan={(data) => {
              try {
                console.log("QR Data received:", data);
                const emailRegex =
                  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
                const match = data.match(emailRegex);

                if (match) {
                  const email = match[0].trim();
                  console.log("Email extracted:", email);
                  setFriendEmail(email);
                  handleSendFriendRequest(email);
                  setShowScanner(false);
                } else {
                  console.log("No valid email found in QR data:", data);
                  ToastAndroid.showWithGravity(
                    "No valid email found in QR code",
                    ToastAndroid.BOTTOM,
                    ToastAndroid.LONG
                  );
                }
              } catch (error) {
                console.error("Error processing QR code:", error);
                ToastAndroid.showWithGravity(
                  "Error processing QR code",
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "400",
    marginTop: 8,
  },
  friendCount: {
    color: colors.gray.DEFAULT,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  searchBar: {
    backgroundColor: colors.transparent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.white,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  sectionCount: {
    backgroundColor: colors.primary.DEFAULT,
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  requestCard: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT + "40",
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colors.green[500] || "#22c55e",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: colors.red[500] || "#ef4444",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  friendCard: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBackground.DEFAULT,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  friendEmail: {
    color: colors.gray.DEFAULT,
    fontSize: 14,
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
    color: colors.gray.DEFAULT,
  },
  balancePositive: {
    color: colors.green[300],
  },
  balanceNegative: {
    color: colors.red[300],
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.gray[400],
  },
  balanceLabelPositive: {
    color: "#4ade80cc",
  },
  balanceLabelNegative: {
    color: "#f87171cc",
  },
  arrow: {
    color: colors.gray.DEFAULT,
    fontSize: 24,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.gray.DEFAULT,
    textAlign: "center",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.cardBackground.DEFAULT,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground.DEFAULT,
  },
  modalTitle: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    color: colors.white,
    marginBottom: 12,
    fontWeight: "500",
  },
  emailInput: {
    backgroundColor: colors.background.DEFAULT,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
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
    marginHorizontal: "auto",
    marginVertical: 8,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.DEFAULT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray.DEFAULT,
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[700] || "#334155",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  qrButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FriendsPage;
