import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import React from 'react';
import { useGetRecentActivities } from '@/services/api/recentsApi';
import colors from '@/assets/colors';
import {
  Banknote,
  HandCoins,
  LogIn,
  UserCheck,
  UserMinus,
  UserRoundPlus,
  UserRoundX,
  Users,
} from 'lucide-react-native';
import { router } from 'expo-router';

const RecentActivitiesList = ({
  loadInfinite = false,
  pageSize = 10,
  friendId = null,
}: {
  loadInfinite?: boolean;
  pageSize?: number;
  friendId?: string | null;
}) => {
  const { data, isLoading, isError } = useGetRecentActivities({
    page: 1,
    limit: pageSize,
    friendId: friendId || '',
  });

  const getActivityDescription = (activity: any) => {
    switch (activity.activityType) {
      case 'CREATE_GROUP':
        return `Created group`;
      case 'JOIN_GROUP':
        return `Joined group`;
      case 'SEND_FRIEND_REQUEST':
        return `Sent a friend request`;
      case 'ACCEPT_FRIEND_REQUEST':
        return `Accepted a friend request`;
      case 'REJECT_FRIEND_REQUEST':
        return `Rejected a friend request`;
      case 'REMOVED_FRIEND':
        return `Removed a friend`;
      case 'CREATE_SQUAD':
        return `Created squad`;
      case 'JOIN_SQUAD':
        return `Joined squad`;
      case 'ADD_EXPENSE':
        return `Added expense`;
      case 'UPDATE_EXPENSE':
        return `Updated expense`;
      case 'DELETE_EXPENSE':
        return `Deleted expense`;
      case 'SETTLE_PAYMENT':
        return `Settled payment`;
      case 'ADD_SAVING':
        return `Added saving`;
      case 'LOG_IN':
        return `Logged In`;
      default:
        return `Performed an`;
    }
  };

  const getActivityTitle = (activity: any) => {
    switch (activity.activityType) {
      case 'CREATE_GROUP':
        return activity?.group.name;
      case 'JOIN_GROUP':
        return activity?.group.name;
      case 'SEND_FRIEND_REQUEST':
        return (
          activity?.otherUser.fullname ||
          activity?.otherUser.username ||
          activity?.otherUser.email
        );
      case 'ACCEPT_FRIEND_REQUEST':
        return (
          activity?.otherUser.fullname ||
          activity?.otherUser.username ||
          activity?.otherUser.email
        );
      case 'REJECT_FRIEND_REQUEST':
        return (
          activity?.otherUser.fullname ||
          activity?.otherUser.username ||
          activity?.otherUser.email
        );
      case 'REMOVED_FRIEND':
        return (
          activity?.otherUser.fullname ||
          activity?.otherUser.username ||
          activity?.otherUser.email
        );
      case 'CREATE_SQUAD':
        return activity?.squad?.name;
      case 'JOIN_SQUAD':
        return activity?.squad?.name;
      case 'ADD_EXPENSE':
        return activity?.group.name;
      case 'UPDATE_EXPENSE':
        return activity?.group.name;
      case 'DELETE_EXPENSE':
        return activity?.group.name;
      case 'SETTLE_PAYMENT':
        return (
          activity?.otherUser.fullname ||
          activity?.otherUser.username ||
          activity?.otherUser.email
        );
      case 'ADD_SAVING':
        return ``;
      case 'LOG_IN':
        return `Device`;
      default:
        return ``;
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'LENT_MONEY':
        return <HandCoins color={colors.cardBackground.light} size={24} />;
      case 'BORROWED_MONEY':
        return (
          <HandCoins
            color={colors.cardBackground.light}
            size={24}
            style={{
              transform: [{ rotateY: '180deg' }],
            }}
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

  const getTimeDifference = (
    startDate: Date | number,
    endDate: Date | number
  ): string => {
    const startingTimestamp = new Date(startDate).getTime();
    const endingTimestamp = new Date(endDate).getTime();
    const absoluteDifference = Math.abs(endingTimestamp - startingTimestamp);

    // Define time units in milliseconds
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY; // Approximate
    const YEAR = 365 * DAY; // Approximate

    // Determine the appropriate unit
    if (absoluteDifference < MINUTE) {
      const seconds = Math.floor(absoluteDifference / SECOND);
      return `${seconds} sec${seconds !== 1 ? 's' : ''}`;
    } else if (absoluteDifference < HOUR) {
      const minutes = Math.floor(absoluteDifference / MINUTE);
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else if (absoluteDifference < DAY) {
      const hours = Math.floor(absoluteDifference / HOUR);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (absoluteDifference < WEEK) {
      const days = Math.floor(absoluteDifference / DAY);
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (absoluteDifference < MONTH) {
      const weeks = Math.floor(absoluteDifference / WEEK);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else if (absoluteDifference < YEAR) {
      const months = Math.floor(absoluteDifference / MONTH);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(absoluteDifference / YEAR);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        {!loadInfinite && (
          <>
            <Text
              style={{
                color: colors.grayTextColor.DEFAULT,
              }}
            >
              RECENT ACTIVITIES
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/notabs/recents');
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  textDecorationLine: 'underline',
                  fontWeight: 'bold',
                }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <View>
        {isLoading && (
          <ActivityIndicator size='small' color={colors.primary.DEFAULT} />
        )}

        {isError && (
          <Text style={{ color: colors.red.DEFAULT }}>
            Error loading recent activities.
          </Text>
        )}
        {
          !isLoading && !isError && data?.pagination?.totalCount === 0 && (
            <Text style={{ color: colors.grayTextColor.DEFAULT, textAlign: 'center' }}>
              No recent activities found.
            </Text>
          )
        }
        {!isLoading &&
          !isError &&
          data?.data?.map((activity: any) => (
            <View key={activity._id}>
              <View
                style={{
                  marginVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
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
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      alignItems: 'flex-start',
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                      }}
                    >
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
                        {getTimeDifference(
                          new Date(),
                          new Date(activity.createdAt)
                        ) + ' ago'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 18,
                      }}
                    >
                      {getActivityTitle(activity)}
                    </Text>
                  </View>
                </View>
                {activity?.amount && (
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
                        color: colors.grayTextColor.DEFAULT,
                        textAlign: 'right',
                      }}
                    >
                      Amt.
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
                        {(activity.amount || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <View
                style={{
                  width: '100%',
                  height: 1.5,
                  backgroundColor: colors.white + '11',
                  marginVertical: 10,
                }}
              ></View>
            </View>
          ))}
      </View>
    </View>
  );
};

export default RecentActivitiesList;
