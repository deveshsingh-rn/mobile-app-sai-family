import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        animationDuration: 260,
        contentStyle: { backgroundColor: "#FAFAF9" },
        gestureEnabled: true,
        headerShown: false,
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="attendees" />
      <Stack.Screen name="bookmarks" />
      <Stack.Screen name="calendar" />
      <Stack.Screen
        name="create"
        options={{ animation: "slide_from_bottom", gestureEnabled: true }}
      />
      <Stack.Screen
        name="edit"
        options={{ animation: "slide_from_bottom", gestureEnabled: true }}
      />
      <Stack.Screen name="my-events" />
      <Stack.Screen name="rsvps" />
    </Stack>
  );
}
