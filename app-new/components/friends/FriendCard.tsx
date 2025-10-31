import colors from '@/assets/colors';
import { router } from 'expo-router';
import { MoveUpRight } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FriendCard = ({ friend }: { friend: any }) => {
  const toBePaid = friend.toBePaid;
  const toBeReceived = friend.toBeReceived;
  let amount = toBeReceived - toBePaid;

  return (
    <TouchableOpacity
      style={styles.friendCard}
      activeOpacity={0.7}
      onPress={() => {
        router.push(`/tabs/friends/${friend._id}`);
      }}
    >
      {/* Avatar */}
      {friend?.profile_picture ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: colors.cardBackground.light,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={{ uri: friend.profile_picture }}
            style={{ width: 40, height: 40 }}
          />
        </View>
      ) : (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.cardBackground.light, // Blue avatar background
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {(friend.fullname || friend.username).charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Friend Info */}
      <View style={styles.friendInfo}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            display: 'flex',
            gap: 8,
          }}
        >
          <Text style={styles.friendName}>
            {friend?.username || 'Unknown User'}
          </Text>
          <MoveUpRight color={colors.white} size={16} />
        </View>
        <Text style={styles.friendEmail}>{friend?.email || 'No email'}</Text>
      </View>

      {/* Balance */}
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color:
              amount > 0
                ? colors.green[500] + '99'
                : amount < 0
                ? colors.red[500] + '99'
                : colors.green[500],
            textAlign: 'right',
          }}
        >
          {amount === 0 ? 'Settled' : amount < 0 ? `You Owe` : `Owes You`}
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text
            style={{
              color: colors.grayTextColor.dark,
              fontSize: 14,
            }}
          >
            $
          </Text>
          <Text
            style={{
              color: colors.white,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            {Math.abs(amount).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  friendCard: {
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 48,
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: colors.white,
    fontWeight: '400',
    fontSize: 16,
    marginBottom: 4,
  },
  friendEmail: {
    color: colors.gray.DEFAULT,
    fontSize: 12,
  },

  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontWeight: 'bold',
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
    color: '#4ade80cc',
  },
  balanceLabelNegative: {
    color: '#f87171cc',
  },
  arrow: {
    color: colors.gray.DEFAULT,
    fontSize: 24,
    marginLeft: 8,
  },
});

export default FriendCard;
