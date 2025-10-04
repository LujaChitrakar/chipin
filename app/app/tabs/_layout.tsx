import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '../../components/TabBar'

const _layout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name='home/index'
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name='profile/index'
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name='settings/index'
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

export default _layout;