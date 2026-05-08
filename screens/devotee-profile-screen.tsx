import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { DevoteeAccount } from "@/store/devotee-account/types";

type DevoteeProfileScreenProps = {
  account: DevoteeAccount;
  onContinue: () => void;
};

export default function DevoteeProfileScreen({ account, onContinue }: DevoteeProfileScreenProps) {
  const imageUri = account.profileImage?.uri || account.profileImageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.content}>
        <Text style={styles.brand}>SAI FAMILY</Text>
        <View style={styles.card}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{account.name.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.success}>Account Created</Text>
          <Text style={styles.name}>{account.name}</Text>
          <View style={styles.memberBox}>
            <Text style={styles.memberLabel}>Devotee ID</Text>
            <Text style={styles.memberId}>{account.memberId}</Text>
          </View>
          <Text style={styles.detail}>{account.mobileNumber}</Text>
          <Text style={styles.detail}>{account.city}, {account.state}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onContinue}>
          <Text style={styles.buttonText}>Enter Sai Family</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
  },
  glow: {
    position: "absolute",
    top: -130,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#ffe7a3",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brand: {
    alignSelf: "center",
    color: "#6d4810",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 28,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#e5c878",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 30,
    shadowColor: "#c8942f",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  avatar: {
    borderColor: "#d9bd7a",
    borderRadius: 46,
    borderWidth: 2,
    height: 92,
    width: 92,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#f5e4b8",
    borderRadius: 46,
    height: 92,
    justifyContent: "center",
    width: 92,
  },
  avatarText: {
    color: "#8e5d10",
    fontSize: 34,
    fontWeight: "800",
  },
  success: {
    color: "#12805c",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 22,
    textTransform: "uppercase",
  },
  name: {
    color: "#4e3309",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  memberBox: {
    alignItems: "center",
    backgroundColor: "#fff7df",
    borderRadius: 8,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 14,
    width: "100%",
  },
  memberLabel: {
    color: "#8e5d10",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  memberId: {
    color: "#3f2b0c",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 5,
  },
  detail: {
    color: "#79571b",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#8e5d10",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    marginTop: 28,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: "#fffaf0",
    fontSize: 16,
    fontWeight: "800",
  },
});
