import { View, Text, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect } from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useGetUserById } from '@/services/api/friendsApi';
import colors from '@/assets/colors';
import { useQueryClient } from '@tanstack/react-query';
import RecentActivitiesList from '@/components/home/ActivitiesList';
import {
  useAcceptBorrowRequest,
  useGetBorrowRequestsToMe,
  useGetMySentBorrowRequests,
  useRejectBorrowRequest,
} from '@/services/api/borrowApi';
import LendBorrowButton from '@/components/friends/LendBorrowButtons';
import { BorrowRequestCard } from '@/components/friends/BorrowRequestCard';

const FriendDetailPage = () => {
  const queryClient = useQueryClient();

  const navigation = useNavigation();
  useEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);
  const router = useRouter();

  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  const { data: friendData, isLoading: friendDataLoading } =
    useGetUserById(friendId);

  const { data: borrowRequestsToMe } = useGetBorrowRequestsToMe({
    // requestor: friendId,
  });
  const { data: mySentBorrowRequests } = useGetMySentBorrowRequests({
    // requested_to: friendId,
  });

  const { mutate: acceptBorrowRequest, isPending: acceptingBorrowRequest } =
    useAcceptBorrowRequest();

  const { mutate: rejectBorrowRequest, isPending: rejectingBorrowRequest } =
    useRejectBorrowRequest();
  // accept and reject both take the borrow request _id as param

  console.log(
    'BORROW REQUEST TO ME::',
    JSON.stringify(borrowRequestsToMe, null, 2)
  );
  console.log(
    'MY SENT BORROW REQUESTS::',
    JSON.stringify(mySentBorrowRequests, null, 2)
  );

  return (
    <ScreenContainer>
      <ScreenHeader
        title='Friend Details'
        onBackPress={() => {
          router.back();
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: ['user-by-id', friendId],
              });
            }}
            refreshing={friendDataLoading}
          />
        }
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
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
                    {(
                      friendData?.data?.fullname ||
                      friendData?.data?.username ||
                      'U'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 20,
                      fontWeight: '500',
                    }}
                  >
                    {friendData?.data?.fullname || friendData?.data?.username}
                  </Text>
                  <Text
                    style={{
                      color: colors.grayTextColor.dark,
                      fontSize: 14,
                    }}
                  >
                    {friendData?.data?.email}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                backgroundColor: colors.cardBackground.DEFAULT,
                padding: 8,
                paddingHorizontal: 15,
                borderRadius: 18,
              }}
            >
              <View
                style={{
                  minWidth: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.grayTextColor.DEFAULT,
                    fontWeight: '600',
                  }}
                >
                  YOU OWE
                </Text>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 7,
                    justifyContent: 'flex-start',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.grayTextColor.dark,
                      fontWeight: '400',
                    }}
                  >
                    $
                  </Text>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 20,
                      fontWeight: '400',
                    }}
                  >
                    {friendData?.data?.totalOwedByUser.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  minWidth: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.grayTextColor.DEFAULT,
                    fontWeight: '600',
                  }}
                >
                  OWES YOU
                </Text>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 7,
                    justifyContent: 'flex-start',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.grayTextColor.dark,
                      fontWeight: '400',
                    }}
                  >
                    $
                  </Text>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 20,
                      fontWeight: '400',
                    }}
                  >
                    {friendData?.data?.totalOwedToUser.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
            <LendBorrowButton friendId={friendData?.data?._id} />
            {borrowRequestsToMe?.data?.map((request: any, index: number) => {
              return (
                <BorrowRequestCard
                  key={index}
                  request={request}
                  isIncoming={true}
                />
              );
            })}
          </View>

          <View
            style={{
              paddingHorizontal: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 15,
            }}
          >
            <Text style={{ color: colors.grayTextColor.dark }}>
              RECENT ACTIVITIES
            </Text>
            <RecentActivitiesList friendId={friendId} loadInfinite={true} />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default FriendDetailPage;
