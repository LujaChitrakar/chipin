import { useEffect, useState } from 'react';
import { Text, ToastAndroid, View } from 'react-native';
import Constants from 'expo-constants';
import { usePrivy } from '@privy-io/expo';
import { useRouter, Stack } from 'expo-router';
import colors from '@/assets/colors';
import LoadingScreen from '@/components/splash/LoadingScreen';
import { useGetMyProfile, useLoginWithPrivy } from '@/services/api/authApi';
import { extractPrivyIdAndEmailFromPrivyUser } from '@/utils/privyUtils';
import * as LocalAuthentication from 'expo-local-authentication'
import { SafeAreaView } from 'react-native-safe-area-context';
import PasskeyAuth from '@/components/common/PassKeyAuth';
import { axiosInstance } from '@/services/api/apiConstants';
import { useNotification } from '@/context/NotificationContext';
import { useCheckEmail } from '@/services/api/userApi';

export default function Index() {
  const router = useRouter();
  const { user, isReady: ready } = usePrivy(); // "ready" tells when Privy has finished initializing
  const {
    mutate: loginToApiWithPrivy,
    isPending: loggingIn,
    error: loginError,
  } = useLoginWithPrivy();

  const { expoPushToken } = useNotification()
  const {
    data: userProfile,
  } = useGetMyProfile();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)


  // ✅ Navigate only after Privy is ready
  useEffect(() => {
    console.log("Current User", userProfile)
    if (!ready) return;

    if (user) {

      loginToApiWithPrivy({ ...extractPrivyIdAndEmailFromPrivyUser(user), expoPushToken }, {
        onSuccess: (response) => {
          // console.log('LOGIN SUCCESS::', response);

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

  useEffect(() => {

    if (isAuthenticated) {
      router.replace('/tabs/home')
    }
  }, [isAuthenticated])

  useEffect(() => {

    if (!loginError) return
    console.log("LOGIN ERROR:::", loginError)
    ToastAndroid.showWithGravity(
      (loginError as any)?.response?.data?.message || 'Login Failed',
      2000,
      ToastAndroid.CENTER
    );
    router.replace('/auth/login');

  }, [loginError])



  // ✅ Show splash/loading until Privy is ready
  if (!ready || loggingIn) {
    console.log("Am ready", ready, "LogginIN", loggingIn)
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}>
        <LoadingScreen />
      </View>
    );
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
      {/* {user && !isAuthenticated && <PasskeyAuth />} */}
      {user && !isAuthenticated ?
        <PasskeyAuth isRegisterPin={!userProfile?.data?.userPIN} setIsAuthenticated={setIsAuthenticated} />
        :
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary.DEFAULT },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name='auth/login' options={{ headerShown: false }} />
          <Stack.Screen name='tabs' options={{ headerShown: false }} />
          <Stack.Screen name='notabs' options={{ headerShown: false }} />
        </Stack>
      }
    </View>
  );
}