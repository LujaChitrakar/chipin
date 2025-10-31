import Constants from "expo-constants";
import { useState } from "react";

import { View, Text, Button } from "react-native";
import { useLinkWithPasskey } from "@privy-io/expo/passkey";
import { useLinkWithOAuth } from "@privy-io/expo";
export default function LinkAccounts() {
  const [error, setError] = useState("");

  const { linkWithPasskey } = useLinkWithPasskey({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });
  const oauth = useLinkWithOAuth({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });
  return (
    <View>
      {/* Links Accounts */}
      <Text>Link Accounts</Text>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          margin: 10,
          flexWrap: "wrap",
        }}
      >
        {(["google"] as const).map((provider) => (
          <View key={provider}>
            <Button
              title={`Link ${provider}`}
              disabled={oauth.state.status === "loading"}
              onPress={() => oauth.link({ provider })}
            ></Button>
          </View>
        ))}
      </View>

      <Button
        title="Link Passkey"
        onPress={() =>
          linkWithPasskey({
            relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
          })
        }
      />

      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
    </View>
  );
}
