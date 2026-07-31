import { Mic, Send } from "lucide-react-native";
import { MotiView } from "moti";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AskSaiVoiceCaptureModalProps = {
  error?: string;
  hasCapturedTranscript: boolean;
  isListening: boolean;
  isStarting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  visible: boolean;
};

export function AskSaiVoiceCaptureModal({
  error,
  hasCapturedTranscript,
  isListening,
  isStarting,
  onCancel,
  onSubmit,
  visible,
}: AskSaiVoiceCaptureModalProps) {
  const isSubmitDisabled =
    isStarting || (!isListening && !hasCapturedTranscript);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Cancel voice question"
          accessibilityRole="button"
          onPress={onCancel}
          style={styles.backdropPress}
        />

        <MotiView
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          from={{ opacity: 0, scale: 0.94, translateY: 12 }}
          style={styles.card}
          transition={{ duration: 240, type: "timing" }}
        >
          <View style={styles.micStage}>
            {isListening ? (
              <MotiView
                animate={{ opacity: 0, scale: 1.55 }}
                from={{ opacity: 0.34, scale: 1 }}
                style={styles.micPulse}
                transition={{
                  duration: 1200,
                  loop: true,
                  repeatReverse: false,
                  type: "timing",
                }}
              />
            ) : null}

            <MotiView
              animate={{
                backgroundColor: isListening ? "#16A34A" : "#D1D5DB",
                scale: isListening ? 1.04 : 1,
              }}
              style={styles.micCircle}
              transition={{ duration: 220, type: "timing" }}
            >
              {isStarting ? (
                <ActivityIndicator color="#4B5563" size="small" />
              ) : (
                <Mic color="#FFFFFF" size={34} strokeWidth={2.4} />
              )}
            </MotiView>
          </View>

          <Text accessibilityLiveRegion="polite" style={styles.title}>
            {isListening
              ? "Speak now"
              : error
                ? "Microphone unavailable"
                : "Preparing microphone"}
          </Text>
          <Text style={styles.subtitle}>
            {isListening
              ? "We are listening. Speak naturally in Hindi or English."
              : error || "Please wait until the microphone turns green."}
          </Text>

          {hasCapturedTranscript ? (
            <Text style={styles.capturedHint}>
              Your words are appearing on the Ask Sai screen.
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitDisabled }}
              disabled={isSubmitDisabled}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                isSubmitDisabled && styles.primaryButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryText}>Send</Text>
              <Send color="#FFFFFF" size={17} strokeWidth={2.5} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.44)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdropPress: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(255,255,255,0.72)",
    borderRadius: 28,
    borderWidth: 1,
    elevation: 18,
    maxWidth: 370,
    padding: 24,
    shadowColor: "#111827",
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    width: "100%",
  },
  micStage: {
    alignItems: "center",
    height: 116,
    justifyContent: "center",
    width: 116,
  },
  micPulse: {
    backgroundColor: "#86EFAC",
    borderRadius: 52,
    height: 104,
    position: "absolute",
    width: 104,
  },
  micCircle: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 42,
    borderWidth: 4,
    elevation: 6,
    height: 84,
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: 84,
  },
  title: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4,
    textAlign: "center",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  capturedHint: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    color: "#166534",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
    textAlign: "center",
  },
  actions: {
    alignSelf: "stretch",
    gap: 10,
    marginTop: 22,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#15803D",
    borderRadius: 15,
    flexDirection: "row",
    gap: 8,
    height: 52,
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
  },
  secondaryText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.76,
  },
});
