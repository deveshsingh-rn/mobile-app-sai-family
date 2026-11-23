import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CommentInput from "@/components/experiences/CommentInput";
import CommentItem from "@/components/experiences/CommentItem";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";
import { apiAddExperienceComment, apiFetchExperienceDetail } from "@/services/experiences";
import { normalizeComment } from "@/store/experiences/saga";

type Props = {
  experienceId: string | null;
  onClose: () => void;
  onCommentAdded: (experienceId: string) => void;
};

/** Comments over the reel (the video keeps its frame; the screen pauses it while open). */
export function ReelCommentsSheet({ experienceId, onClose, onCommentAdded }: Props) {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!experienceId) return;
    let cancelled = false;
    setComments([]);
    setError("");
    setLoading(true);
    apiFetchExperienceDetail(experienceId)
      .then((data) => {
        if (cancelled) return;
        const list = data?.experience?.comments ?? data?.comments ?? [];
        setComments(Array.isArray(list) ? list.map(normalizeComment) : []);
      })
      .catch(() => {
        if (!cancelled) setError("Comments could not load. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [experienceId]);

  const submit = async (text: string) => {
    if (!experienceId || sending) return;
    setSending(true);
    try {
      const response = await apiAddExperienceComment({ content: text, experienceId });
      const comment = response?.comment ?? response?.data?.comment ?? response;
      setComments((current) => [normalizeComment(comment), ...current]);
      onCommentAdded(experienceId);
    } catch {
      setError("Your comment was not sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(experienceId)}>
      <Pressable accessibilityLabel="Close comments" onPress={onClose} style={styles.backdrop} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.sheetWrap}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <Pressable accessibilityLabel="Close comments" accessibilityRole="button" hitSlop={10} onPress={onClose}>
              <X color={EXPERIENCE_THEME.heading} size={22} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color="#C2410C" style={styles.loader} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item, index) => String(item?.id ?? index)}
              ListEmptyComponent={<Text style={styles.empty}>{error || "No comments yet. Be the first to share a thought."}</Text>}
              renderItem={({ item }) => <CommentItem item={item} />}
              style={styles.list}
            />
          )}

          {error && comments.length > 0 ? <Text style={styles.error}>{error}</Text> : null}
          <CommentInput loading={sending} onSubmit={(text) => void submit(text)} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  empty: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
  },
  error: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  list: {
    flexGrow: 0,
    maxHeight: 420,
  },
  loader: {
    marginVertical: 32,
  },
  sheet: {
    backgroundColor: EXPERIENCE_THEME.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "75%",
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "900",
  },
});
