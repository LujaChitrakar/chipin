import { useEffect } from 'react';
import { Text, ToastAndroid, View } from 'react-native';
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
    if (!ready) return;

    if (user) {
      // @ts-ignore
      loginToApiWithPrivy(extractPrivyIdAndEmailFromPrivyUser(user), {
        onSuccess: (response) => {
          console.log('LOGIN SUCCESS::', response);
          router.replace('/tabs/groups');
        },
        onError: (e: any) => {
          ToastAndroid.showWithGravity(
            e.response?.data?.message || 'Login Failed',
            2000,
            ToastAndroid.CENTER
          );
          console.log('ERROR e::', e?.response?.data);
        },
      });
    } else {
      router.replace('/auth/login');
    }
  }, [user, ready]);

  // ✅ Show splash/loading until Privy is ready
  if (!ready || loggingIn) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}>
        <LoadingScreen />
      </View>
    );
  }

  if (loginError) {
    console.log("LOGIN ERROR:::", loginError)
    ToastAndroid.showWithGravity(
      (loginError as any)?.response?.data?.message || 'Login Failed',
      2000,
      ToastAndroid.CENTER
    );
    router.replace('/auth/login');
    if ((loginError as any)?.response?.status > 500) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}>
          <Text>Something went wrong. Please try again later.</Text>
        </View>
      );
    } else {

    }
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
    <View style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary.DEFAULT },
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
