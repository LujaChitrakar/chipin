import { View, Text, ScrollView, RefreshControl } from 'react-native';
import React from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import BalanceCard from '@/components/home/BalanceCard';
import HomeScreenHeader from '@/components/navigation/HomeScreenHeader';
import SpendingCard from '@/components/home/SpendingCard';
import RecentActivitiesList from '@/components/home/ActivitiesList';
import { useQueryClient } from '@tanstack/react-query';

const HomePage = () => {
  const queryClient = useQueryClient();
  return (
    <ScreenContainer>
      <HomeScreenHeader />
      <View
        style={{
          height: 10,
          backgroundColor: 'transparent',
        }}
      ></View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: ['recent-activities'],
              });
              queryClient.invalidateQueries({
                queryKey: ['wallet-balance'],
              });
            }}
            refreshing={false}
          />
        }
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <BalanceCard />
          <SpendingCard />
          {/* <SaveMoneyCard /> */}
          <RecentActivitiesList initialPage={1} pageSize={3} loadInfinite={false} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default HomePage;
