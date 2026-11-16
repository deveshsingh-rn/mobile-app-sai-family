import { Stack } from 'expo-router';

// Deep links (e.g. /directory/business-details) get the directory home underneath, so Back works.
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function DirectoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="business-details" />
      <Stack.Screen name="business-review" />
      <Stack.Screen name="business-search" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="category" />
      <Stack.Screen name="create-listing" />
      <Stack.Screen name="discovery-list" />
      <Stack.Screen name="my-listings" />
      <Stack.Screen name="saved-listings" />
    </Stack>
  );
}
