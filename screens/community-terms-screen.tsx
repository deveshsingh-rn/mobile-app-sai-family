import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, ExternalLink, ShieldCheck } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CommunityTermsScreen({ onAccept }: { onAccept: () => void }) {
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);
  const open = (url: string) => void Linking.openURL(url).catch(() => Alert.alert("Unable to open page", "Please check your connection and try again."));
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ShieldCheck color="#7C2D12" size={32} />
        <Text style={styles.title}>Our Community Agreement</Text>
        <Text style={styles.copy}>Before you sign in or create an account, please read and accept these Terms of Use.</Text>
        <Text style={styles.heading}>Respect every devotee</Text>
        <Text style={styles.copy}>There is no tolerance for objectionable content or abusive users. Do not post harassment, threats, hate speech, sexual exploitation, illegal content or spam. Share only content you have permission to use, and respect other people's privacy.</Text>
        <Text style={styles.heading}>Report and block</Text>
        <Text style={styles.copy}>Use a post's options menu to report objectionable content or block its author. Blocking removes that author's posts from your feed and sends a report to our moderation team. You can also block a devotee from their profile.</Text>
        <Text style={styles.heading}>Keeping the community safe</Text>
        <Text style={styles.copy}>We review reports and may remove content or restrict accounts that violate these rules. Contact vikasahuja1971@gmail.com for community safety concerns.</Text>
        <Text style={styles.heading}>Ask Sai</Text>
        <Text style={styles.copy}>Ask Sai is an AI assistant and can make mistakes. It does not provide medical, legal, financial or emergency services.</Text>
        <Pressable onPress={() => open("https://saikifamily.com/terms/")} style={styles.link} accessibilityRole="link">
          <Text style={styles.linkText}>Read the full Terms of Use</Text><ExternalLink size={17} color="#7C2D12" />
        </Pressable>
        <Pressable onPress={() => open("https://saikifamily.com/privacy-policy/")} style={styles.link} accessibilityRole="link">
          <Text style={styles.linkText}>Privacy Policy</Text><ExternalLink size={17} color="#7C2D12" />
        </Pressable>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={styles.agreement}>
          <View style={[styles.check, accepted && styles.checked]}>{accepted && <Check size={19} color="#FFFFFF" />}</View>
          <Text style={[styles.copy, { flex: 1 }]}>I agree to the Terms of Use and community rules.</Text>
        </Pressable>
        <Pressable disabled={!accepted} accessibilityRole="button" onPress={onAccept} style={[styles.button, !accepted && styles.disabled]}>
          <Text style={styles.buttonText}>Agree and Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF8EC" },
  content: { padding: 24, gap: 14 },
  title: { fontSize: 25, fontWeight: "800", color: "#7C2D12" },
  heading: { fontSize: 18, fontWeight: "700", color: "#7C2D12", marginTop: 8 },
  copy: { fontSize: 16, lineHeight: 25, color: "#4B4037" },
  link: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  linkText: { fontSize: 16, fontWeight: "700", color: "#7C2D12", flexShrink: 1 },
  footer: { padding: 20, gap: 16, borderTopWidth: 1, borderColor: "#F1D9B5" },
  agreement: { flexDirection: "row", alignItems: "center", gap: 12 },
  check: { width: 28, height: 28, borderRadius: 5, borderWidth: 1, borderColor: "#7C2D12", alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: "#7C2D12" },
  button: { backgroundColor: "#7C2D12", borderRadius: 8, padding: 16, alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  disabled: { opacity: 0.4 },
});
