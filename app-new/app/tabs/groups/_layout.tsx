import { Stack } from 'expo-router';

export default function GroupsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[groupId]/index" options={{
                animation: 'slide_from_right',
            }} />
            <Stack.Screen name="[groupId]/settings" options={{
                animation: 'slide_from_right',
            }} />
        </Stack>
    );
}
