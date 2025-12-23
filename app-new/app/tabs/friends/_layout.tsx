import { Stack } from 'expo-router';

export default function FriendsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[friendId]/index" options={{
                animation: 'slide_from_right',
            }} />
        </Stack>
    );
}
