import { Pressable, StyleSheet, Text, View } from "react-native";

type AuthScreenProps = {
  onContinue: () => void;
};

export default function AuthScreen({ onContinue }: AuthScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.content}>
        <Text style={styles.brand}>SAI FAMILY</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.description}>Login or create an account to continue your Sai Family journey.</Text>

        <View style={styles.actions}>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={onContinue}>
            <Text style={styles.primaryText}>Login</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} onPress={onContinue}>
            <Text style={styles.secondaryText}>Create Account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
  },
  topGlow: {
    position: "absolute",
    top: -120,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#ffe7a3",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  brand: {
    color: "#8e5d10",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 18,
  },
  title: {
    color: "#4e3309",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 41,
  },
  description: {
    color: "#79571b",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 320,
  },
  actions: {
    gap: 14,
    marginTop: 38,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#8e5d10",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#d9bd7a",
    borderRadius: 8,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  primaryText: {
    color: "#fffaf0",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryText: {
    color: "#6d4810",
    fontSize: 16,
    fontWeight: "800",
  },
});
