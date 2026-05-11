import { Stack } from 'expo-router';

export default function ExperiencesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="post" />
      <Stack.Screen name="search" />
      <Stack.Screen name="category" />
      <Stack.Screen name="bookmarks" />
    </Stack>
  );
}
