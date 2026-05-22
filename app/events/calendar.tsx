import { StyleSheet, Text, View } from "react-native";

export default function EventCalendarRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Event Calendar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fffaf0",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    color: "#4e3309",
    fontSize: 24,
    fontWeight: "800",
  },
});
