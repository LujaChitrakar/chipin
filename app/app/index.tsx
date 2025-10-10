import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Constants from 'expo-constants';
import { usePrivy } from '@privy-io/expo';
import { useRouter, Stack } from 'expo-router';
import colors from '@/assets/colors';
import LoadingScreen from '@/components/splash/LoadingScreen';
import { useLoginWithPrivy } from '@/services/api/authApi';
import { extractPrivyIdAndEmailFromPrivyUser } from '@/utils/privyUtils';

export default function Index() {
  const router = useRouter();
  const { user, isReady: ready } = usePrivy(); // "ready" tells when Privy has finished initializing

  const {
    mutate: loginToApiWithPrivy,
    isPending: loggingIn,
    error: loginError,
  } = useLoginWithPrivy();

  // ✅ Navigate only after Privy is ready
  useEffect(() => {
    setTimeout(() => {
      router.replace('/tabs/groups');
    }, 4000);
    if (!ready) return;

    if (user) {
      // @ts-ignore
      loginToApiWithPrivy(extractPrivyIdAndEmailFromPrivyUser(user), {
        onSuccess: () => {
          router.replace('/tabs/groups');
        },
        onError: (e: any) => {
          console.log('ERROR e::', e?.response?.data);
        },
      });
    } else {
      router.replace('/auth/login');
    }
  }, [user, ready]);

  // ✅ Show splash/loading until Privy is ready
  if (!ready) {
    return <LoadingScreen />;
  }

  // ✅ Validate Privy IDs
  if ((Constants.expoConfig?.extra?.privyAppId as string).length !== 25) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Text>You have not set a valid `privyAppId` in app.json</Text>
      </View>
    );
  }

  if (
    !(Constants.expoConfig?.extra?.privyClientId as string).startsWith(
      'client-'
    )
  ) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Text>You have not set a valid `privyClientId` in app.json</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name='auth/login' options={{ headerShown: false }} />
        <Stack.Screen name='tabs' options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
