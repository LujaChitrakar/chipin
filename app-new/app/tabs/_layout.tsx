import React, { useEffect, useState } from 'react';
import { router, Tabs, usePathname } from 'expo-router';
import TabBar from '../../components/navigation/TabBar';
import { LastTabProvider, useLastTab } from '@/context/LastTabContext';
import { BackHandler } from 'react-native';

function BackHandlerController() {
  const pathname = usePathname();
  const { lastTab } = useLastTab();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) return false;

      if (lastTab && lastTab !== pathname) {
        router.replace(lastTab);
        return true;
      }

      return false; // exit app
    });

    return () => sub.remove();
  }, [pathname, lastTab]);

  return null;
}
const TabLayout = () => {

  const [lastTab, setLastTab] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/tabs/')) {
      setLastTab(pathname);
    }
  }, [pathname]);

  return (

    <LastTabProvider>
      <BackHandlerController />
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen
          name='home/index'
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name='groups'
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
          name='friends'
          options={{
            title: 'Friends',
            headerShown: false,
          }}
        />
      </Tabs>
    </LastTabProvider>
  );
};

export default TabLayout;
