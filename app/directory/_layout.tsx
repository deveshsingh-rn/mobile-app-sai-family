import { Stack } from 'expo-router';

export default function DirectoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="business-details" />
      <Stack.Screen name="business-review" />
      <Stack.Screen name="business-search" />
      <Stack.Screen name="category" />
      <Stack.Screen name="create-listing" />
    </Stack>
  );
}
