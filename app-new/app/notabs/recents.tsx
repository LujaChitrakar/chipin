import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import { router, useRouter } from 'expo-router';
import RecentActivitiesList from '@/components/home/ActivitiesList';

const RecentActivities = () => {
  // const router = useRouter();
  return (
    <ScreenContainer>
      <ScreenHeader
        title='Recent Activities'
        onBackPress={() => {
          router.back();
        }}
      />
      <ScrollView>
        <RecentActivitiesList pageSize={5} loadInfinite={true} />
      </ScrollView>
    </ScreenContainer>
  );
};

export default RecentActivities;
