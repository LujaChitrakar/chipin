import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGetRecentActivities } from '@/services/api/recentsApi';
import colors from '@/assets/colors';
import { router } from 'expo-router';
import ActivityItem from './ActivityItem';

const RecentActivitiesList = ({
  loadInfinite = false,
  pageSize = 10,
  friendId = null,
  initialPage = 1,
}: {
  loadInfinite?: boolean;
  pageSize?: number;
  friendId?: string | null;
  initialPage?: number;
}) => {
  const [page, setPage] = useState(1);
  const [activities, setActivities] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const totalPagesRef = useRef(1); // keep totalPages between fetches

  const { data, isLoading, isError, refetch } = useGetRecentActivities({
    page,
    limit: pageSize,
    friendId: friendId || '',
  });

  useEffect(() => {
    if (!data?.data) return;

    // first page → replace, later pages → append
    if (page === 1) {
      setActivities(data.data);
    } else {
      setActivities((prev) => [...prev, ...data.data]);
    }

    // update totalPages & hasMore flag
    const total = data.pagination?.totalPages ?? 1;
    totalPagesRef.current = total;
    setHasMore(page < total);
  }, [data, page]);

  // ---------- Reset when friendId changes ----------
  useEffect(() => {
    setPage(1);
    setActivities([]);
    setHasMore(true);
  }, [friendId]);

  useEffect(() => {
    setPage(1);
  }, [initialPage]);
  // ---------- Load more ----------
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && page < totalPagesRef.current && loadInfinite) {
      setPage((p) => p + 1);
    }
  }, [isLoading, hasMore, page]);

  // ---------- Scroll handler ----------
  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 120; // trigger a bit before the very end
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom && loadInfinite) {
        loadMore();
      }
    },
    [loadMore]
  );

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={64}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            refetch();
          }}
          refreshing={isLoading}
        />
      }
    >
      {!loadInfinite && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.grayTextColor.DEFAULT }}>
            RECENT ACTIVITIES
          </Text>
          <TouchableOpacity onPress={() => router.push('/tabs/recents')}>
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
        </View>
      )}

      {/* Error */}
      {isError && (
        <Text style={{ color: colors.red.DEFAULT, textAlign: 'center' }}>
          Error loading recent activities.
        </Text>
      )}

      {/* Empty */}
      {!isLoading && activities.length === 0 && !isError && (
        <Text
          style={{
            color: colors.grayTextColor.DEFAULT,
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          No recent activities found.
        </Text>
      )}

      {/* Activities */}
      {activities.map((act, idx) => (
        <React.Fragment key={act._id}>
          <ActivityItem activity={act} />
          {/* Separator – hide after last item */}
          {idx < activities.length - 1 && (
            <View
              style={{
                height: 1.5,
                backgroundColor: colors.white + '11',
                marginVertical: 10,
              }}
            />
          )}
        </React.Fragment>
      ))}

      {/* Footer loader */}
      {isLoading && page > 1 && (
        <ActivityIndicator
          size='small'
          color={colors.primary.DEFAULT}
          style={{ marginVertical: 16 }}
        />
      )}
      <View
        style={{
          height: 100,
          backgroundColor: colors.transparent,
          marginVertical: 10,
        }}
      />
    </ScrollView>
  );
};

export default RecentActivitiesList;
