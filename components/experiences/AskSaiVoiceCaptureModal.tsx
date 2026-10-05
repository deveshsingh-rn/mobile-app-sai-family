import { useEffect, useRef } from "react";
import { Mic, Square } from "lucide-react-native";
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
  canStart: boolean;
  error?: string;
  hasCapturedTranscript: boolean;
  isListening: boolean;
  isStarting: boolean;
  level: number;
  onCancel: () => void;
  onEnd: () => void;
  onStart: () => void;
  visible: boolean;
};

export function AskSaiVoiceCaptureModal({
  canStart,
  error,
  hasCapturedTranscript,
  isListening,
  isStarting,
  level,
  onCancel,
  onEnd,
  onStart,
  visible,
}: AskSaiVoiceCaptureModalProps) {
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
                backgroundColor: isListening ? "#15803D" : "#8C7A6C",
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
              ? "Listening to You"
              : error
                ? "Voice is unavailable"
                : isStarting
                  ? "Preparing Voice Connection"
                  : "Ready When You Are"}
          </Text>
          <Text style={styles.subtitle}>
            {isListening
              ? "Speak naturally. Pause for 2 seconds or tap End & Send when you finish."
              : error || (isStarting
                ? "Please read the instructions while we securely connect your microphone."
                : "Tap Start Listening, then share your question. Nothing is recorded before you tap Start.")}
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Start listening"
              accessibilityRole="button"
              disabled={!canStart || isListening || isStarting}
              onPress={onStart}
              style={({ pressed }) => [
                styles.startButton,
                (!canStart || isListening || isStarting) && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {isStarting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Mic color="#FFFFFF" size={19} strokeWidth={2.3} />
              )}
              <Text style={styles.startButtonText}>
                {isListening ? "Listening" : isStarting ? "Connecting" : "Start Listening"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="End listening and send question"
              accessibilityRole="button"
              disabled={!isListening && !hasCapturedTranscript}
              onPress={onEnd}
              style={({ pressed }) => [
                styles.endButton,
                (!isListening && !hasCapturedTranscript) && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              <Square color={EXPERIENCE_THEME.heading} fill={EXPERIENCE_THEME.heading} size={16} />
              <Text style={styles.endButtonText}>End &amp; Send</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="Cancel voice question"
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
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
    marginBottom: 14,
    textAlign: "center",
  },
  actions: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  startButton: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    height: 52,
    justifyContent: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  endButton: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    height: 52,
    justifyContent: "center",
  },
  endButtonText: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.42,
  },
  cancelButton: {
    alignItems: "center",
    alignSelf: "stretch",
    height: 42,
    justifyContent: "center",
    marginTop: 6,
  },
  cancelText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.76,
  },
});
