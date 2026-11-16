import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { MessageCircleQuestionMark, Plus, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import type { DevoteeAiConversation } from "@/services/devotee-ai";

/**
 * Left-side "Recent questions" panel for Ask Sai (ChatGPT-style history).
 * Tap a question → the parent opens that conversation (question + Baba's answer).
 */

type Props = {
  activeConversationId?: string;
  conversations: DevoteeAiConversation[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onClose: () => void;
  onLoadMore: () => void;
  onNewQuestion: () => void;
  onSelect: (conversationId: string) => void;
  visible: boolean;
};

const SAFFRON = "#C2410C";
const PEACH = "#FED7AA";
const CARD_TINT = "#FFF4E8";
const MUTED = "#8A7461";

function relativeDay(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(date)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function AskSaiHistoryDrawer({
  activeConversationId,
  conversations,
  hasMore,
  isLoading,
  isLoadingMore,
  onClose,
  onLoadMore,
  onNewQuestion,
  onSelect,
  visible,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(340, Math.round(screenWidth * 0.84));
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(progress, {
      duration: visible ? 240 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [progress, visible]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-panelWidth, 0],
  });

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={mounted}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable
            accessibilityLabel="Close recent questions"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              paddingTop: insets.top + 14,
              transform: [{ translateX }],
              width: panelWidth,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Recent questions</Text>
            <Pressable
              accessibilityLabel="Close recent questions"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <X color={EXPERIENCE_THEME.heading} size={20} strokeWidth={2.4} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onNewQuestion}
            style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}
          >
            <Plus color="#FFFFFF" size={18} strokeWidth={2.6} />
            <Text style={styles.newButtonText}>Ask a new question</Text>
          </Pressable>

          {isLoading && conversations.length === 0 ? (
            <ActivityIndicator color={SAFFRON} style={styles.loader} />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Your questions to Sai will appear here.
                </Text>
              }
              ListFooterComponent={
                hasMore ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isLoadingMore}
                    onPress={onLoadMore}
                    style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
                  >
                    {isLoadingMore ? (
                      <ActivityIndicator color={SAFFRON} />
                    ) : (
                      <Text style={styles.moreText}>Show older questions</Text>
                    )}
                  </Pressable>
                ) : null
              }
              renderItem={({ item }) => {
                const isActive = item.id === activeConversationId;
                return (
                  <Pressable
                    accessibilityHint="Opens this question and Sai's answer"
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => onSelect(item.id)}
                    style={({ pressed }) => [
                      styles.row,
                      isActive && styles.rowActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.rowIcon, isActive && styles.rowIconActive]}>
                      <MessageCircleQuestionMark
                        color={isActive ? "#FFFFFF" : SAFFRON}
                        size={17}
                        strokeWidth={2.3}
                      />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text numberOfLines={2} style={styles.rowTitle}>
                        {item.title || "Question to Sai"}
                      </Text>
                      <Text style={styles.rowMeta}>
                        {relativeDay(item.lastMessageAt || item.updatedAt || item.createdAt)}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 28, 15, 0.42)",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: CARD_TINT,
    borderColor: PEACH,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  emptyText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 18,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
  loader: {
    marginTop: 30,
  },
  moreButton: {
    alignItems: "center",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 46,
  },
  moreText: {
    color: SAFFRON,
    fontSize: 14,
    fontWeight: "800",
  },
  newButton: {
    alignItems: "center",
    backgroundColor: SAFFRON,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
  },
  newButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  panel: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderColor: EXPERIENCE_THEME.border,
    borderRightWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    position: "absolute",
    shadowColor: EXPERIENCE_THEME.heading,
    shadowOffset: { height: 0, width: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    top: 0,
    elevation: 12,
  },
  pressed: {
    opacity: 0.78,
  },
  root: {
    flex: 1,
  },
  row: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  rowActive: {
    backgroundColor: CARD_TINT,
    borderColor: PEACH,
    borderWidth: 1,
  },
  rowCopy: {
    flex: 1,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: CARD_TINT,
    borderColor: PEACH,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  rowIconActive: {
    backgroundColor: SAFFRON,
    borderColor: SAFFRON,
  },
  rowMeta: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  rowTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  title: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 21,
    fontWeight: "900",
  },
});
