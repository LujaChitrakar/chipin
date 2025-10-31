import { Linking, Text, View } from "react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";
import PrivyUI from "./login/PrivyUI";
import PasskeyLogin from "./login/PasskeyLogin";
import OAuth from "./login/OAuth";

export default function LoginScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 10,
      }}
    >
      <Text>Privy App ID:</Text>
      <Text style={{ fontSize: 10 }}>
        {Constants.expoConfig?.extra?.privyAppId}
      </Text>
      <Text>Privy Client ID:</Text>
      <Text style={{ fontSize: 10 }}>
        {Constants.expoConfig?.extra?.privyClientId}
      </Text>
      <Text style={{ fontSize: 10 }}>{Application.applicationId}</Text>

      <Text style={{ fontSize: 10 }}>
        {Application.applicationId === "host.exp.Exponent"
          ? "exp"
          : Constants.expoConfig?.scheme}
      </Text>

      <PrivyUI />
      <PasskeyLogin />
      <OAuth />
    </View>
  );
}
