import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Mic2,
  Pause,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react-native";

import { ExperienceTopTabs } from "@/components/experiences";
import {
  AskDevoteeQuestionResponse,
  askDevoteeQuestion,
} from "@/services/devotee-ai";
import { trackProductEvent } from "@/services/product-analytics";

const SUGGESTED_QUESTIONS = [
  "How can I keep faith during a difficult time?",
  "What is a simple Sai prayer I can do daily?",
  "How do I share my experience with other devotees?",
  "What should I do before attending a Sai event?",
];

export default function AskSaiScreen() {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [lastResponse, setLastResponse] =
    useState<AskDevoteeQuestionResponse | null>(null);
  const [safetyNote, setSafetyNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canSubmit = useMemo(
    () => question.trim().length >= 3 && !isSubmitting,
    [isSubmitting, question]
  );

  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  const stopSpeech = useCallback(async () => {
    await Speech.stop();
    setIsSpeaking(false);
  }, []);

  const speakAnswer = useCallback(async () => {
    if (!answer.trim()) {
      return;
    }

    const speaking = await Speech.isSpeakingAsync();

    if (speaking || isSpeaking) {
      await stopSpeech();
      return;
    }

    setIsSpeaking(true);
    Speech.speak(answer, {
      language: "en-IN",
      pitch: 1,
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });

    trackProductEvent("Devotee Answer Spoken", {
      pillar: "experiences",
    });
  }, [answer, isSpeaking, stopSpeech]);

  const submitQuestion = useCallback(
    async (nextQuestion?: string) => {
      const questionToAsk = (nextQuestion || question).trim();

      if (questionToAsk.length < 3) {
        Alert.alert(
          "Question required",
          "Please write a little more so Sai assistant can understand."
        );
        return;
      }

      try {
        await stopSpeech();
        setIsSubmitting(true);
        setAnswer("");
        setLastResponse(null);
        setSafetyNote("");

        const response = await askDevoteeQuestion({
          conversationId,
          locale: "en-IN",
          pillar: "experiences",
          question: questionToAsk,
          voice: false,
        });

        setQuestion(questionToAsk);
        setAnswer(response.answer);
        setConversationId(response.conversationId || conversationId);
        setLastResponse(response);
        setSafetyNote(response.safetyNote || "");

        trackProductEvent("Devotee Question Asked", {
          cached: Boolean(response.cached),
          has_answer: true,
          latency_ms: response.latencyMs || null,
          pillar: "experiences",
        });
      } catch (error) {
        Alert.alert(
          "Sai assistant",
          error instanceof Error
            ? error.message
            : "Unable to get reply right now."
        );

        trackProductEvent("Devotee Question Asked", {
          has_answer: false,
          pillar: "experiences",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [conversationId, question, stopSpeech]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <LinearGradient
        colors={["#FFF8E7", "#FFFFFF", "#F7FBFF"]}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.titleRow}>
            <View style={styles.iconBubble}>
              <Sparkles color="#B45309" size={22} strokeWidth={2.4} />
            </View>
            <View style={styles.titleCopy}>
              <Text style={styles.eyebrow}>SAI GUIDANCE</Text>
              <Text style={styles.title}>Ask Sai</Text>
            </View>
          </View>

          <ExperienceTopTabs activeTab="ask" />
        </View>

        <ScrollView
          bounces
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroPanel}>
            <Text style={styles.heroTitle}>
              Ask with faith. Receive a calm, practical reply.
            </Text>
            <Text style={styles.heroText}>
              This assistant is here for spiritual reflection and app help. For
              medical, legal, or emergency matters, please speak with the right
              professional.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Your question</Text>
            <TextInput
              multiline
              onChangeText={setQuestion}
              placeholder="Write your question here..."
              placeholderTextColor="#A8A29E"
              returnKeyType="done"
              style={styles.input}
              textAlignVertical="top"
              value={question}
            />

            <Pressable
              disabled={!canSubmit}
              onPress={() => submitQuestion()}
              style={({ pressed }) => [
                styles.askButton,
                pressed && styles.pressed,
                !canSubmit && styles.disabledButton,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Send color="#FFFFFF" size={18} strokeWidth={2.4} />
                  <Text style={styles.askButtonText}>Ask now</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.suggestionsBlock}>
            <Text style={styles.sectionTitle}>Helpful starts</Text>
            {SUGGESTED_QUESTIONS.map((item) => (
              <Pressable
                disabled={isSubmitting}
                key={item}
                onPress={() => submitQuestion(item)}
                style={({ pressed }) => [
                  styles.suggestion,
                  pressed && styles.pressed,
                ]}
              >
                <Mic2 color="#B45309" size={17} strokeWidth={2.2} />
                <Text style={styles.suggestionText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {answer ? (
            <View style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <View>
                  <Text style={styles.answerEyebrow}>REPLY</Text>
                  <Text style={styles.answerTitle}>Sai assistant says</Text>
                </View>
                <Pressable
                  onPress={speakAnswer}
                  style={({ pressed }) => [
                    styles.speakButton,
                    pressed && styles.pressed,
                  ]}
                >
                  {isSpeaking ? (
                    <Pause color="#FFFFFF" size={18} fill="#FFFFFF" />
                  ) : (
                    <Volume2 color="#FFFFFF" size={18} strokeWidth={2.4} />
                  )}
                </Pressable>
              </View>

              <Text style={styles.answerText}>{answer}</Text>

              <View style={styles.metaRow}>
                {typeof lastResponse?.latencyMs === "number" ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>
                      {lastResponse.latencyMs} ms
                    </Text>
                  </View>
                ) : null}

                {lastResponse?.cached ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>Cached</Text>
                  </View>
                ) : null}

                {lastResponse?.model ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>
                      {lastResponse.model}
                    </Text>
                  </View>
                ) : null}
              </View>

              {safetyNote ? (
                <Text style={styles.safetyNote}>{safetyNote}</Text>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#FFF8E7",
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(255, 248, 231, 0.96)",
    borderBottomColor: "#F3E1BE",
    borderBottomWidth: 1,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: "#FFE8B6",
    borderRadius: 18,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  titleCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  title: {
    color: "#1F2933",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heroPanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F3E1BE",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#92400E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  heroTitle: {
    color: "#23201D",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
  },
  heroText: {
    color: "#6B6257",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F3E1BE",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  label: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFDF8",
    borderColor: "#F1DEC0",
    borderRadius: 18,
    borderWidth: 1,
    color: "#23201D",
    fontSize: 16,
    fontWeight: "700",
    minHeight: 136,
    paddingHorizontal: 15,
    paddingTop: 14,
  },
  askButton: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderRadius: 18,
    flexDirection: "row",
    gap: 9,
    height: 54,
    justifyContent: "center",
    marginTop: 14,
  },
  askButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: {
    backgroundColor: "#D6B38D",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  suggestionsBlock: {
    marginTop: 18,
  },
  sectionTitle: {
    color: "#23201D",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },
  suggestion: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    padding: 14,
  },
  suggestionText: {
    color: "#4B5563",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  answerCard: {
    backgroundColor: "#23201D",
    borderRadius: 24,
    marginTop: 10,
    padding: 18,
  },
  answerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  answerEyebrow: {
    color: "#FACC15",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  answerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },
  speakButton: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderRadius: 17,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  answerText: {
    color: "#FFF7ED",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 25,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  metaPill: {
    backgroundColor: "rgba(255, 247, 237, 0.12)",
    borderColor: "rgba(253, 230, 138, 0.24)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: "900",
  },
  safetyNote: {
    color: "#FDE68A",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 14,
  },
});
