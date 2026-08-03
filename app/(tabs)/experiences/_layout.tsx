import { Stack } from 'expo-router';

export default function ExperiencesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="ask-sai"
        options={{
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="post"
        options={{ animation: "slide_from_right", gestureEnabled: true }}
      />
      <Stack.Screen
        name="edit"
        options={{ animation: "slide_from_right", gestureEnabled: true }}
      />
      <Stack.Screen
        name="search"
        options={{ animation: "slide_from_right", gestureEnabled: true }}
      />
      {/* <Stack.Screen name="category" /> */}
      <Stack.Screen
        name="bookmarks"
        options={{ animation: "slide_from_right", gestureEnabled: true }}
      />
    </Stack>
  );
}
