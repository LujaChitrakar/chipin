// File: ActivityItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BanknoteX,
  HandCoins,
  HandHelping,
  Handshake,
  LogIn,
  Ticket,
  TicketCheck,
  UserCheck,
  UserMinus,
  UserRoundPlus,
  UserRoundX,
  Users,
  UserStar,
} from 'lucide-react-native';
import colors from '@/assets/colors';
import { router } from 'expo-router';
import WalletAddressDisplay from '../common/WalletAddressDisplay';

interface Props {
  activity: any;
}

const getActivityDescription = (a: any) => {
  switch (a.activityType) {
    case 'ACCEPTED_BORROW_REQUEST':
      return 'Accepted Borrow Request';
    case 'REJECTED_BORROW_REQUEST':
      return 'Rejected Borrow Request';
    case 'SEND_BORROW_REQUEST':
      return 'Sent a borrow request';
    case 'REDEEMED_CASHBACK':
      return 'Redeemed points to cashback';
    case 'REFERRED_USER':
      return 'Reffered a Friend';
    case 'APPLIED_REFERAL_CODE':
      return 'Applied Referal Code';
    case 'CREATE_GROUP':
      return 'Created group';
    case 'JOIN_GROUP':
      return 'Joined group';
    case 'SEND_FRIEND_REQUEST':
      return 'Sent a friend request';
    case 'ACCEPT_FRIEND_REQUEST':
      return 'Accepted a friend request';
    case 'REJECT_FRIEND_REQUEST':
      return 'Rejected a friend request';
    case 'REMOVED_FRIEND':
      return 'Removed a friend';
    case 'CREATE_SQUAD':
      return 'Created squad';
    case 'JOIN_SQUAD':
      return 'Joined squad';
    case 'ADD_EXPENSE':
      return 'Added expense';
    case 'UPDATE_EXPENSE':
      return 'Updated expense';
    case 'DELETE_EXPENSE':
      return 'Deleted expense';
    case 'SETTLE_PAYMENT':
      return 'Settled payment';
    case 'ADD_SAVING':
      return 'Added saving';
    case 'LOG_IN':
    case 'LENT_MONEY':
      return 'Lent Money';
    case 'SENT_MONEY':
      return 'Sent Money';
    case 'BORROWED_MONEY':
      return 'Borrowed Money';
    default:
      return 'Performed an';
  }
};

const getActivityTitle = (a: any) => {
  switch (a.activityType) {
    case 'REDEEMED_CASHBACK':
      return 'Redeemed Points';
    case 'CREATE_GROUP':
    case 'JOIN_GROUP':
      return a?.group?.name ?? '';
    case 'SEND_FRIEND_REQUEST':
    case 'ACCEPT_FRIEND_REQUEST':
    case 'REJECT_FRIEND_REQUEST':
    case 'REMOVED_FRIEND':
    case 'SETTLE_PAYMENT':
    case 'BORROWED_MONEY':
    case 'APPLIED_REFERAL_CODE':
    case 'LENT_MONEY':
    case 'SEND_BORROW_REQUEST':
    case 'ACCEPTED_BORROW_REQUEST':
    case 'REJECTED_BORROW_REQUEST':
    case 'REFERRED_USER':
      if (a.activityType === 'ACCEPTED_BORROW_REQUEST') {
        console.log(JSON.stringify(a, null, 2));
      }
      return (
        a?.otherUser?.fullname ||
        a?.otherUser?.username ||
        a?.otherUser?.email ||
        ''
      );
    case 'CREATE_SQUAD':
    case 'JOIN_SQUAD':
      return a?.squad?.name ?? '';
    case 'ADD_EXPENSE':
    case 'UPDATE_EXPENSE':
    case 'DELETE_EXPENSE':
      return a?.group?.name ?? '';
    case 'ADD_SAVING':
      return '';
    case 'LOG_IN':
      return 'Device';
    default:
      return '';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'REJECTED_BORROW_REQUEST':
      return <BanknoteX color={colors.cardBackground.light} size={24} />;
    case 'ACCEPTED_BORROW_REQUEST':
      return <Handshake color={colors.cardBackground.light} size={24} />;
    case 'SEND_BORROW_REQUEST':
      return (
        <HandHelping
          style={{ transform: [{ rotateY: '180deg' }] }}
          color={colors.cardBackground.light}
          size={24}
        />
      );
    case 'REDEEMED_CASHBACK':
      return <TicketCheck color={colors.cardBackground.light} size={24} />;
    case 'REFERRED_USER':
      return <UserStar color={colors.cardBackground.light} size={24} />;
    case 'APPLIED_REFERAL_CODE':
      return <Ticket color={colors.cardBackground.light} size={24} />;
    case 'LENT_MONEY':
      return <HandCoins color={colors.cardBackground.light} size={24} />;
    case 'SENT_MONEY':
      return <ArrowRight color={colors.cardBackground.light} size={24} />;
    case 'BORROWED_MONEY':
      return (
        <HandCoins
          color={colors.cardBackground.light}
          size={24}
          style={{ transform: [{ rotateY: '180deg' }] }}
        />
      );
    case 'ADD_EXPENSE':
    case 'UPDATE_EXPENSE':
    case 'DELETE_EXPENSE':
    case 'SETTLE_PAYMENT':
    case 'ADD_SAVING':
    case 'PAID':
      return <Banknote color={colors.cardBackground.light} size={24} />;
    case 'CREATE_GROUP':
    case 'JOIN_GROUP':
    case 'CREATE_SQUAD':
    case 'JOIN_SQUAD':
      return <Users color={colors.cardBackground.light} size={24} />;
    case 'SEND_FRIEND_REQUEST':
      return <UserRoundPlus color={colors.cardBackground.light} size={24} />;
    case 'ACCEPT_FRIEND_REQUEST':
      return <UserCheck color={colors.cardBackground.light} size={24} />;
    case 'REJECT_FRIEND_REQUEST':
      return <UserMinus color={colors.cardBackground.light} size={24} />;
    case 'REMOVED_FRIEND':
      return <UserRoundX color={colors.cardBackground.light} size={24} />;
    case 'LOG_IN':
      return <LogIn color={colors.cardBackground.light} size={24} />;
    default:
      return <UserRoundPlus color={colors.cardBackground.light} size={24} />;
  }
};

const getNavigateButton = (a: any) => {
  if (!a?.group?._id) return null;
  const needsNav = ['CREATE_GROUP', 'JOIN_GROUP', 'CREATE_GROUP'].includes(
    a.activityType
  );
  if (!needsNav) return null;

  return (
    <TouchableOpacity
      onPress={() => router.replace(`/tabs/groups/${a.group._id}`)}
      style={{
        backgroundColor: colors.white,
        padding: 8,
        borderRadius: 50,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ArrowUpRight color={colors.black} size={18} />
    </TouchableOpacity>
  );
};

const getTimeDifference = (createdAt: string) => {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diff = Math.abs(now - then);

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  if (diff < MINUTE)
    return `${Math.floor(diff / SECOND)} sec${diff / SECOND !== 1 ? 's' : ''}`;
  if (diff < HOUR)
    return `${Math.floor(diff / MINUTE)} min${diff / MINUTE !== 1 ? 's' : ''}`;
  if (diff < DAY)
    return `${Math.floor(diff / HOUR)} hour${diff / HOUR !== 1 ? 's' : ''}`;
  if (diff < WEEK)
    return `${Math.floor(diff / DAY)} day${diff / DAY !== 1 ? 's' : ''}`;
  if (diff < MONTH)
    return `${Math.floor(diff / WEEK)} week${diff / WEEK !== 1 ? 's' : ''}`;
  if (diff < YEAR)
    return `${Math.floor(diff / MONTH)} month${diff / MONTH !== 1 ? 's' : ''}`;
  return `${Math.floor(diff / YEAR)} year${diff / YEAR !== 1 ? 's' : ''}`;
};

const ActivityItem: React.FC<Props> = React.memo(({ activity }) => {
  return (
    <View
      style={{
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            backgroundColor: colors.background.DEFAULT,
            padding: 12,
            borderRadius: 50,
          }}
        >
          {getActivityIcon(activity.activityType)}
        </View>

        <View
          style={{ flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}
        >
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text
              style={{
                color: colors.grayTextColor.dark,
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              {getActivityDescription(activity)}
            </Text>
            <Text
              style={{
                color: colors.grayTextColor.dark,
                fontSize: 10,
                fontWeight: '400',
              }}
            >
              {getTimeDifference(activity.createdAt)} ago
            </Text>
          </View>

          <View style={{ flexDirection: 'column', gap: 0 }}>
            {activity.activityType === 'SENT_MONEY' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{ color: colors.white, fontSize: 16, marginBottom: 4 }}
                >
                  To:{' '}
                </Text>
                {activity?.otherUser ? (
                  <Text
                    style={{
                      color: colors.grayTextColor.dark,
                      fontSize: 16,
                    }}
                  >
                    {activity.otherUser.fullname ||
                      activity.otherUser.username ||
                      activity.otherUser.email}
                  </Text>
                ) : (
                  <WalletAddressDisplay
                    address={activity?.receiver_wallet_address}
                    displayCharacters={14}
                    copySize={14}
                  />
                )}
              </View>
            ) : (
              <Text style={{ color: colors.white, fontSize: 16 }}>
                {getActivityTitle(activity)}
              </Text>
            )}

            {activity?.transactionId && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
                <Text
                  style={{ color: colors.white, fontSize: 12, marginBottom: 6 }}
                >
                  Tx sig:
                </Text>
                <WalletAddressDisplay
                  address={activity.transactionId}
                  displayCharacters={20}
                  textStyle={{ fontSize: 12 }}
                  copySize={12}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {getNavigateButton(activity)}

      {activity?.amount != null && (
        <View
          style={{ flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}
        >
          <Text
            style={{
              fontSize: 10,
              color: colors.grayTextColor.DEFAULT,
            }}
          >
            Amt.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: colors.grayTextColor.dark, fontSize: 14 }}>
              $
            </Text>
            <Text
              style={{
                color: colors.white,
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              {(activity.amount || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});

export default ActivityItem;
