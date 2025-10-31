import React from 'react';
import { Tabs } from 'expo-router';
import TabBar from '../../components/navigation/TabBar';

const TabLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name='home/index'
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='groups/index'
        options={{
          title: 'Groups',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='recents/index'
        options={{
          title: 'Recents',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='friends/index'
        options={{
          title: 'Friends',
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
