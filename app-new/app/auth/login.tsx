import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Image } from "react-native";
import colors from "@/assets/colors";
import fonts from "@/assets/fonts";
import { useRouter } from "expo-router";
import { useLogin } from "@privy-io/expo/ui";

// privy logo is located at @/assets/images/privy.png

const Login = () => {
  const [error, setError] = useState("");

  const { login } = useLogin();

  const router = useRouter();

  const handleLogin = () => {
    login({ loginMethods: ["email"] })
      .then((session) => {
        console.log("User logged in", session.user);
        router.navigate("/");
      })
      .catch((err) => {
        setError(JSON.stringify(err.error) as string);
      });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: colors.background.DEFAULT,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.heading,
          fontSize: 28,
          color: colors.primary.DEFAULT,
          marginBottom: 40,
        }}
      >
        Welcome Back
      </Text>

      <Pressable
        onPress={handleLogin}
        style={{
          width: "100%",
          backgroundColor: colors.white,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 16,
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Text
          style={{
            color: colors.black,
            fontSize: 16,
            fontFamily: fonts.heading,
          }}
        >
          Continue with Privy
        </Text>
        <Image
          source={require("@/assets/images/privy.png")}
          style={{
            width: 22,
            height: 22,
            resizeMode: "contain",
          }}
        />
      </Pressable>
      <Text style={{ color: colors.red.DEFAULT }}>{error}</Text>
    </View>
  );
};

export default Login;
