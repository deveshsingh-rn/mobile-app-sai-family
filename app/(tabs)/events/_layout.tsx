import { Stack } from "expo-router";

// Deep links (e.g. /events/123 from a notification) get the events home underneath, so Back works.
export const unstable_settings = {
  initialRouteName: "index",
};

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
      <Stack.Screen name="index" />
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
