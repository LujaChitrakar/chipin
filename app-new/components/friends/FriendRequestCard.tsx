import colors from '@/assets/colors';
import {
  useAcceptFriendRequest,
  useRejectFriendRequest,
} from '@/services/api/friendsApi';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

interface FriendRequestCardProps {
  friendData: any;
  setAllRequests: (requests: any) => void;
}

const FriendRequestCard = ({
  friendData,
  setAllRequests,
}: FriendRequestCardProps) => {
  const queryClient = useQueryClient();
  const requester = friendData.user_one;

  const { mutate: acceptFriendRequest, isPending: acceptingRequest } =
    useAcceptFriendRequest();

  const { mutate: rejectFriendRequest, isPending: rejectingRequest } =
    useRejectFriendRequest();

  const handleAcceptRequest = (requestId: string) => {
    acceptFriendRequest(requestId, {
      onSuccess: () => {
        ToastAndroid.showWithGravity(
          'Friend request accepted',
          ToastAndroid.BOTTOM+20,
          ToastAndroid.SHORT
        );
        setAllRequests((prev: any) =>
          prev.filter((req: any) => req._id !== requestId)
        );
        queryClient.invalidateQueries({
          queryKey: ['my-friends'],
        });
      },
      onError: () => {
        ToastAndroid.showWithGravity(
          'Failed to accept request',
          ToastAndroid.BOTTOM+20,
          ToastAndroid.SHORT
        );
      },
    });
  };

  const handleRejectRequest = (requestId: string) => {
    rejectFriendRequest(requestId, {
      onSuccess: () => {
        ToastAndroid.showWithGravity(
          'Friend request rejected',
          ToastAndroid.BOTTOM+20,
          ToastAndroid.SHORT
        );
        setAllRequests((prev: any) =>
          prev.filter((req: any) => req._id !== requestId)
        );
      },
      onError: () => {
        ToastAndroid.showWithGravity(
          'Failed to reject request',
          ToastAndroid.BOTTOM+20,
          ToastAndroid.SHORT
        );
      },
    });
  };

  return (
    <View style={styles.requestCard}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(requester?.fullname || requester?.username)
            ?.charAt(0)
            .toUpperCase() || 'U'}
        </Text>
      </View>

      {/* Request Info */}
      <View style={styles.requestInfo}>
        <Text style={styles.friendName}>
          {requester?.fullname || requester?.username || 'Unknown User'}
        </Text>
        <Text style={styles.friendEmail}>{requester?.email || 'No email'}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.requestActions}>
        <TouchableOpacity
          onPress={() => handleAcceptRequest(friendData._id)}
          style={styles.acceptButton}
          activeOpacity={0.7}
          disabled={acceptingRequest}
        >
          <Check size={20} color={colors.white} strokeWidth={3} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRejectRequest(friendData._id)}
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

const styles = StyleSheet.create({
  requestCard: {
    width: '100%', // Ensure full width
    alignSelf: 'stretch', // Stretch to parent width
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBackground.DEFAULT,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardBackground.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  requestInfo: {
    flex: 1, // Take remaining space
    justifyContent: 'center',
  },
  friendName: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  friendEmail: {
    color: colors.gray.DEFAULT,
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colors.green[500] || '#22c55e',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: colors.red[500] || '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FriendRequestCard;
