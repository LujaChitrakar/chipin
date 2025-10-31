import Constants from "expo-constants";
import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import { useFonts } from "expo-font";
import { useColorScheme } from "react-native";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function RootLayout() {
  useFonts({
   Outfit_400Regular,
   Outfit_500Medium,
   Outfit_600SemiBold,
  });
  const colorScheme = useColorScheme() ?? "dark";
  return (
    <PrivyProvider
      appId={Constants.expoConfig?.extra?.privyAppId}
      clientId={Constants.expoConfig?.extra?.privyClientId}
      config={{
        embedded: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <QueryClientProvider client={new QueryClient()}>
        <Slot />
      </QueryClientProvider>
      <PrivyElements config={{ appearance: { colorScheme } }} />
    </PrivyProvider>
  );
}
