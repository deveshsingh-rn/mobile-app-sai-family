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
  History,
  Mic2,
  Pause,
  Plus,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Volume2,
} from "lucide-react-native";

import { ExperienceTopTabs } from "@/components/experiences";
import {
  AskDevoteeQuestionResponse,
  deleteDevoteeAiConversation,
  DevoteeAiConversation,
  DevoteeAiMessage,
  fetchDevoteeAiConversationDetail,
  fetchDevoteeAiConversations,
  askDevoteeQuestion,
  submitDevoteeAiFeedback,
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
  const [conversations, setConversations] = useState<DevoteeAiConversation[]>(
    []
  );
  const [messages, setMessages] = useState<DevoteeAiMessage[]>([]);
  const [lastResponse, setLastResponse] =
    useState<AskDevoteeQuestionResponse | null>(null);
  const [safetyNote, setSafetyNote] = useState("");
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(
    null
  );
  const [authMessage, setAuthMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetchDevoteeAiConversations({
        limit: 8,
        offset: 0,
      });
      setAuthMessage("");
      setConversations(response.items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load guidance.";

      if (message.toLowerCase().includes("login again")) {
        setAuthMessage(message);
      } else {
        console.warn("[AskSai] Unable to load conversations", error);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const stopSpeech = useCallback(async () => {
    await Speech.stop();
    setIsSpeaking(false);
  }, []);

  const resetConversation = useCallback(() => {
    void stopSpeech();
    setAnswer("");
    setConversationId(undefined);
    setFeedbackMessageId(null);
    setLastResponse(null);
    setMessages([]);
    setQuestion("");
    setSafetyNote("");
  }, [stopSpeech]);

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
        setFeedbackMessageId(null);
        setLastResponse(null);
        setMessages([]);
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
        setFeedbackMessageId(response.messageId || null);
        setLastResponse(response);
        setMessages([
          {
            content: questionToAsk,
            id: `${Date.now()}-user`,
            role: "user",
          },
          {
            cached: response.cached,
            content: response.answer,
            id: response.messageId || `${Date.now()}-assistant`,
            latencyMs: response.latencyMs,
            model: response.model,
            role: "assistant",
          },
        ]);
        setSafetyNote(response.safetyNote || "");
        void loadConversations();

        trackProductEvent("Devotee Question Asked", {
          cached: Boolean(response.cached),
          has_answer: true,
          latency_ms: response.latencyMs || null,
          pillar: "experiences",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to get reply right now.";

        if (message.toLowerCase().includes("login again")) {
          setAuthMessage(message);
        }

        Alert.alert(
          "Sai assistant",
          message
        );

        trackProductEvent("Devotee Question Asked", {
          has_answer: false,
          pillar: "experiences",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [conversationId, loadConversations, question, stopSpeech]
  );

  const openConversation = useCallback(
    async (id: string) => {
      try {
        await stopSpeech();
        setIsLoadingHistory(true);
        const detail = await fetchDevoteeAiConversationDetail(id);
        const assistantMessage = [...detail.messages]
          .reverse()
          .find((message) => message.role === "assistant");
        const userMessage = [...detail.messages]
          .reverse()
          .find((message) => message.role === "user");

        setConversationId(detail.conversation.id);
        setMessages(detail.messages);
        setQuestion(userMessage?.content || detail.conversation.title || "");
        setAnswer(assistantMessage?.content || "");
        setFeedbackMessageId(assistantMessage?.id || null);
        setLastResponse(
          assistantMessage
            ? {
                answer: assistantMessage.content,
                cached: assistantMessage.cached,
                conversationId: detail.conversation.id,
                latencyMs: assistantMessage.latencyMs || undefined,
                messageId: assistantMessage.id,
                model: assistantMessage.model || undefined,
              }
            : null
        );
        setSafetyNote("");

        trackProductEvent("Devotee Conversation Opened", {
          pillar: detail.conversation.pillar || "experiences",
        });
      } catch (error) {
        Alert.alert(
          "Conversation",
          error instanceof Error
            ? error.message
            : "Unable to open this conversation."
        );
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [stopSpeech]
  );

  const deleteCurrentConversation = useCallback(() => {
    if (!conversationId) {
      return;
    }

    Alert.alert(
      "Delete conversation?",
      "This will remove this Sai assistant conversation from your history.",
      [
        { style: "cancel", text: "Cancel" },
        {
          style: "destructive",
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDevoteeAiConversation(conversationId);
              resetConversation();
              await loadConversations();
              trackProductEvent("Devotee Conversation Deleted", {
                pillar: "experiences",
              });
            } catch (error) {
              Alert.alert(
                "Delete failed",
                error instanceof Error
                  ? error.message
                  : "Unable to delete this conversation."
              );
            }
          },
        },
      ]
    );
  }, [conversationId, loadConversations, resetConversation]);

  const sendFeedback = useCallback(
    async (rating: "helpful" | "not_helpful") => {
      if (!feedbackMessageId) {
        return;
      }

      try {
        await submitDevoteeAiFeedback(feedbackMessageId, {
          rating,
          reason:
            rating === "helpful"
              ? "Helpful and easy to understand."
              : "Needs improvement for this devotee.",
        });

        Alert.alert("Thank you", "Your feedback helps improve Sai assistant.");
        trackProductEvent("Devotee Answer Feedback Sent", {
          pillar: "experiences",
          rating,
        });
      } catch (error) {
        Alert.alert(
          "Feedback failed",
          error instanceof Error
            ? error.message
            : "Unable to save feedback."
        );
      }
    },
    [feedbackMessageId]
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
            <View style={styles.heroActions}>
              <Pressable
                onPress={resetConversation}
                style={({ pressed }) => [
                  styles.smallActionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Plus color="#B45309" size={16} strokeWidth={2.4} />
                <Text style={styles.smallActionText}>New</Text>
              </Pressable>

              {conversationId ? (
                <Pressable
                  onPress={deleteCurrentConversation}
                  style={({ pressed }) => [
                    styles.smallActionButton,
                    styles.deleteActionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Trash2 color="#B91C1C" size={16} strokeWidth={2.4} />
                  <Text style={styles.deleteActionText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.heroTitle}>
              Ask with faith. Receive a calm, practical reply.
            </Text>
            <Text style={styles.heroText}>
              This assistant is here for spiritual reflection and app help. For
              medical, legal, or emergency matters, please speak with the right
              professional.
            </Text>
          </View>

          {authMessage ? (
            <View style={styles.authCard}>
              <Text style={styles.authTitle}>Secure login needed</Text>
              <Text style={styles.authText}>{authMessage}</Text>
            </View>
          ) : null}

          <View style={styles.historyBlock}>
            <View style={styles.historyHeader}>
              <View style={styles.historyTitleRow}>
                <History color="#B45309" size={18} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>Recent guidance</Text>
              </View>
              {isLoadingHistory ? (
                <ActivityIndicator color="#B45309" size="small" />
              ) : null}
            </View>

            {conversations.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.historyScroller}
              >
                {conversations.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openConversation(item.id)}
                    style={({ pressed }) => [
                      styles.historyCard,
                      item.id === conversationId && styles.activeHistoryCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text numberOfLines={2} style={styles.historyTitle}>
                      {item.title || "Sai guidance"}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {item.messageCount || 0} messages
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyHistoryText}>
                Your recent questions will appear here.
              </Text>
            )}
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

              {feedbackMessageId ? (
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackTitle}>Was this helpful?</Text>
                  <View style={styles.feedbackActions}>
                    <Pressable
                      onPress={() => sendFeedback("helpful")}
                      style={({ pressed }) => [
                        styles.feedbackButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThumbsUp color="#FFFFFF" size={16} strokeWidth={2.4} />
                      <Text style={styles.feedbackText}>Yes</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => sendFeedback("not_helpful")}
                      style={({ pressed }) => [
                        styles.feedbackButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThumbsDown color="#FFFFFF" size={16} strokeWidth={2.4} />
                      <Text style={styles.feedbackText}>No</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {messages.length > 2 ? (
            <View style={styles.threadCard}>
              <Text style={styles.threadTitle}>Conversation</Text>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === "assistant"
                      ? styles.assistantBubble
                      : styles.userBubble,
                  ]}
                >
                  <Text style={styles.messageRole}>
                    {message.role === "assistant" ? "Sai assistant" : "You"}
                  </Text>
                  <Text style={styles.messageText}>{message.content}</Text>
                </View>
              ))}
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
  heroActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  smallActionButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#F1DEC0",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallActionText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "900",
  },
  deleteActionButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  deleteActionText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "900",
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
  authCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  authTitle: {
    color: "#991B1B",
    fontSize: 15,
    fontWeight: "900",
  },
  authText: {
    color: "#7F1D1D",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 5,
  },
  historyBlock: {
    marginTop: 18,
  },
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  historyTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  historyScroller: {
    gap: 10,
    paddingRight: 18,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 86,
    padding: 14,
    width: 210,
  },
  activeHistoryCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#B45309",
  },
  historyTitle: {
    color: "#23201D",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
  },
  historyMeta: {
    color: "#8B735F",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyHistoryText: {
    color: "#8B735F",
    fontSize: 13,
    fontWeight: "700",
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
  feedbackRow: {
    borderTopColor: "rgba(255, 247, 237, 0.14)",
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
  },
  feedbackTitle: {
    color: "#FFF7ED",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  feedbackActions: {
    flexDirection: "row",
    gap: 10,
  },
  feedbackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  feedbackText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  threadCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  threadTitle: {
    color: "#23201D",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  messageBubble: {
    borderRadius: 18,
    marginBottom: 10,
    padding: 13,
  },
  assistantBubble: {
    backgroundColor: "#FFF7ED",
  },
  userBubble: {
    backgroundColor: "#F7FBFF",
  },
  messageRole: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 5,
  },
  messageText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
