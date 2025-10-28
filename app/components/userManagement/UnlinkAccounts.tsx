import { useState } from "react";
import { View, Text, Button } from "react-native";

import { usePrivy, useUnlinkOAuth } from "@privy-io/expo";
export default function UnlinkAccounts() {
  const [error, setError] = useState("");
  const { user } = usePrivy();

  const oauth = useUnlinkOAuth({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });

  return (
    <View>
      {/* Links Accounts */}
      <Text>Unlink Accounts</Text>

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
              title={`Unlink ${provider}`}
              onPress={() =>
                oauth.unlinkOAuth({
                  provider,
                  subject: (
                    user?.linked_accounts.find(
                      (account) => (account as any).type === `${provider}_oauth`
                    ) as any
                  )?.subject,
                })
              }
              disabled={
                user?.linked_accounts.find(
                  (account) => (account as any).type === `${provider}_oauth`
                ) === undefined
              }
            ></Button>
          </View>
        ))}
      </View>

      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
    </View>
  );
}
