import { useEffect, useRef } from "react";
import { Mic, Send } from "lucide-react-native";
import { MotiView } from "moti";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

const WAVE_SIZE = 224;
const WAVE_CENTER = WAVE_SIZE / 2;

function makeWavePath(phase: number, detail: number) {
  const points: string[] = [];
  for (let index = 0; index <= 240; index += 1) {
    const angle = (index / 240) * Math.PI * 2;
    const ripple = Math.sin(angle * 7 + phase) * 9 +
      Math.sin(angle * 11 - phase * 1.5) * detail;
    const radius = 77 + ripple;
    const x = WAVE_CENTER + Math.cos(angle) * radius;
    const y = WAVE_CENTER + Math.sin(angle) * radius;
    points.push(`${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${points.join(" ")} Z`;
}

const WAVE_PATHS = [
  makeWavePath(0, 6),
  makeWavePath(0.8, 8),
  makeWavePath(1.6, 9),
  makeWavePath(2.4, 7),
  makeWavePath(3.2, 5),
  makeWavePath(4, 8),
];

type AskSaiVoiceCaptureModalProps = {
  error?: string;
  hasCapturedTranscript: boolean;
  isListening: boolean;
  isStarting: boolean;
  level: number;
  onCancel: () => void;
  onSubmit: () => void;
  visible: boolean;
};

export function AskSaiVoiceCaptureModal({
  error,
  hasCapturedTranscript,
  isListening,
  isStarting,
  level,
  onCancel,
  onSubmit,
  visible,
}: AskSaiVoiceCaptureModalProps) {
  const isSubmitDisabled =
    isStarting || (!isListening && !hasCapturedTranscript);
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      rotation.setValue(0);
      return;
    }
    const motion = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: isListening ? 12000 : 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    motion.start();
    return () => motion.stop();
  }, [isListening, rotation, visible]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
            <Animated.View style={{ transform: [{ rotate }] }}>
              <MotiView
                animate={{ scale: isListening ? 1 + level * 0.2 : 0.94 }}
                transition={{ duration: 160, type: "timing" }}
              >
                <Svg height={WAVE_SIZE} width={WAVE_SIZE}>
                  <Defs>
                    <LinearGradient id="voiceWave" x1="0" x2="1" y1="0" y2="1">
                      <Stop offset="0" stopColor={EXPERIENCE_THEME.heading} />
                      <Stop offset="0.5" stopColor="#D97706" />
                      <Stop offset="1" stopColor="#F0B84C" />
                    </LinearGradient>
                  </Defs>
                  {WAVE_PATHS.map((path, index) => (
                    <Path
                      d={path}
                      fill="url(#voiceWave)"
                      fillOpacity={isListening ? 0.035 : 0.015}
                      key={index}
                      opacity={isListening ? 0.55 - index * 0.06 : 0.25 - index * 0.025}
                      stroke="url(#voiceWave)"
                      strokeWidth={index === 0 ? 2.3 : 1.2}
                    />
                  ))}
                  <Circle
                    cx={WAVE_CENTER}
                    cy={WAVE_CENTER}
                    fill="none"
                    opacity={isListening ? 0.9 : 0.45}
                    r={62}
                    stroke="url(#voiceWave)"
                    strokeWidth={2.5}
                  />
                </Svg>
              </MotiView>
            </Animated.View>
            <MotiView
              animate={{
                backgroundColor: isListening ? EXPERIENCE_THEME.heading : "#8C7A6C",
                scale: isListening ? 1 + level * 0.08 : 1,
              }}
              style={styles.micCircle}
              transition={{ duration: 160, type: "timing" }}
            >
              {isStarting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Mic color="#FFFFFF" size={30} strokeWidth={2.2} />
              )}
            </MotiView>
          </View>

          <Text accessibilityLiveRegion="polite" style={styles.title}>
            {isListening
              ? "Speak now"
              : error
                ? "Could not start listening"
                : "Getting ready to listen"}
          </Text>
          <Text style={styles.subtitle}>
            {isListening
              ? "We are listening. Speak naturally in Hindi or English."
              : error || "Start speaking when the ring lights up."}
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
              <Text style={styles.primaryText}>
                {isStarting ? "Please wait" : "Done"}
              </Text>
              {!isStarting ? (
                <Send color="#FFFFFF" size={17} strokeWidth={2.5} />
              ) : null}
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
    backgroundColor: "rgba(35, 22, 12, 0.62)",
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
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 18,
    maxWidth: 370,
    padding: 24,
    shadowColor: EXPERIENCE_THEME.heading,
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    width: "100%",
  },
  micStage: {
    alignItems: "center",
    height: 224,
    justifyContent: "center",
    width: 224,
  },
  micCircle: {
    alignItems: "center",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 30,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    position: "absolute",
    width: 60,
  },
  title: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4,
    textAlign: "center",
  },
  subtitle: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  capturedHint: {
    backgroundColor: "#FFF0D8",
    borderRadius: 6,
    color: EXPERIENCE_THEME.heading,
    fontSize: 13,
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
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    height: 52,
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.68,
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
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.76,
  },
});
