import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Pencil,
  SendHorizonal,
  Trash2,
  UsersRound,
} from "lucide-react-native";

import {
  addEventCommentRequest,
  cancelEventRsvpRequest,
  deleteEventRequest,
  fetchEventCommentsRequest,
  fetchEventDetailRequest,
  rsvpEventRequest,
} from "@/store/events/actions";
import {
  selectEventComments,
  selectEventDetail,
  selectEventsError,
  selectEventsLoading,
  selectIsAddingEventComment,
} from "@/store/events/selectors";
import { validateEventCommentContent } from "@/store/events/validation";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Date pending";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function EventDetailRoute() {
  const { id } =
    useLocalSearchParams<{
      id?: string;
    }>();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(
    selectEventDetail
  );
  const comments = useAppSelector(
    selectEventComments
  );
  const loading = useAppSelector(
    selectEventsLoading
  );
  const addingComment = useAppSelector(
    selectIsAddingEventComment
  );
  const error = useAppSelector(
    selectEventsError
  );
  const [comment, setComment] =
    useState("");

  const eventId = Array.isArray(id)
    ? id[0]
    : id;

  useEffect(() => {
    if (eventId) {
      dispatch(
        fetchEventDetailRequest(eventId)
      );
      dispatch(
        fetchEventCommentsRequest(
          eventId,
          {
            limit: 20,
            offset: 0,
          }
        )
      );
    }
  }, [dispatch, eventId]);

  const handleRsvp = useCallback(() => {
    if (!eventId || !detail) {
      return;
    }

    if (detail.rsvpedByMe) {
      dispatch(
        cancelEventRsvpRequest(eventId)
      );
      return;
    }

    dispatch(rsvpEventRequest(eventId));
  }, [detail, dispatch, eventId]);

  const handleComment = useCallback(() => {
    if (!eventId) {
      return;
    }

    const validation =
      validateEventCommentContent(
        comment
      );

    if (!validation.isValid) {
      Alert.alert(
        "Comment",
        Object.values(
          validation.errors
        )[0]
      );
      return;
    }

    dispatch(
      addEventCommentRequest(
        eventId,
        comment.trim()
      )
    );
    setComment("");
  }, [comment, dispatch, eventId]);

  const handleDelete = useCallback(() => {
    if (!eventId) {
      return;
    }

    Alert.alert(
      "Cancel event",
      "Do you want to cancel this event?",
      [
        {
          style: "cancel",
          text: "No",
        },
        {
          onPress: () => {
            dispatch(
              deleteEventRequest(eventId)
            );
            router.back();
          },
          style: "destructive",
          text: "Cancel event",
        },
      ]
    );
  }, [dispatch, eventId]);

  if (loading && !detail) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          color="#b97813"
          size="large"
        />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyText}>
          {error || "Event not found"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)")
          }
          style={styles.iconButton}
        >
          <ArrowLeft
            color="#5b3b0b"
            size={22}
          />
        </Pressable>

        <Text style={styles.topTitle}>
          Event Detail
        </Text>

        <View style={styles.topActions}>
          <Pressable
            onPress={() =>
              router.push(
                `/events/edit?id=${detail.id}` as any
              )
            }
            style={styles.iconButton}
          >
            <Pencil
              color="#5b3b0b"
              size={18}
            />
          </Pressable>

          <Pressable
            onPress={handleDelete}
            style={styles.iconButton}
          >
            <Trash2
              color="#b42318"
              size={18}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          imageStyle={styles.bannerImage}
          source={
            detail.bannerUrl
              ? { uri: detail.bannerUrl }
              : undefined
          }
          style={[
            styles.banner,
            !detail.bannerUrl &&
              styles.bannerFallback,
          ]}
        >
          <Text style={styles.typePill}>
            {detail.type || "general"}
          </Text>
        </ImageBackground>

        <View style={styles.panel}>
          <Text style={styles.title}>
            {detail.title}
          </Text>

          <Text style={styles.description}>
            {detail.description}
          </Text>

          <View style={styles.metaRow}>
            <CalendarDays
              color="#8b641f"
              size={17}
            />
            <Text style={styles.metaText}>
              {formatDateTime(
                detail.startAt
              )}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Clock3
              color="#8b641f"
              size={17}
            />
            <Text style={styles.metaText}>
              Ends {formatDateTime(detail.endAt)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <MapPin
              color="#8b641f"
              size={17}
            />
            <Text style={styles.metaText}>
              {detail.venueName
                ? `${detail.venueName}, ${detail.address}`
                : detail.address}
            </Text>
          </View>

          <Pressable
            onPress={handleRsvp}
            style={[
              styles.rsvpButton,
              detail.rsvpedByMe &&
                styles.rsvpButtonActive,
            ]}
          >
            <UsersRound
              color={
                detail.rsvpedByMe
                  ? "#fffaf0"
                  : "#7a5311"
              }
              size={18}
            />
            <Text
              style={[
                styles.rsvpButtonText,
                detail.rsvpedByMe &&
                  styles.rsvpButtonTextActive,
              ]}
            >
              {detail.rsvpedByMe
                ? "Going"
                : "RSVP"}{" "}
              · {detail.rsvps || 0}
            </Text>
          </Pressable>
        </View>

        <View style={styles.commentsHeader}>
          <MessageCircle
            color="#8b641f"
            size={18}
          />
          <Text style={styles.commentsTitle}>
            Comments
          </Text>
          <Text style={styles.commentsCount}>
            {comments.length}
          </Text>
        </View>

        <View style={styles.commentComposer}>
          <TextInput
            multiline
            onChangeText={setComment}
            placeholder="Write a comment..."
            placeholderTextColor="#a98b54"
            style={styles.commentInput}
            value={comment}
          />

          <Pressable
            disabled={
              addingComment ||
              !comment.trim()
            }
            onPress={handleComment}
            style={[
              styles.sendButton,
              (!comment.trim() ||
                addingComment) &&
                styles.disabled,
            ]}
          >
            <SendHorizonal
              color="#fffaf0"
              size={18}
            />
          </Pressable>
        </View>

        {comments.length === 0 ? (
          <Text style={styles.emptyComments}>
            No comments yet.
          </Text>
        ) : (
          comments.map((item) => (
            <View
              key={item.id}
              style={styles.commentItem}
            >
              <Text style={styles.commentName}>
                {item.author?.name ||
                  "Devotee"}
              </Text>
              <Text style={styles.commentText}>
                {item.content}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fffaf0",
    flex: 1,
  },
  loader: {
    alignItems: "center",
    backgroundColor: "#fffaf0",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  topBar: {
    alignItems: "center",
    backgroundColor: "#fffaf0",
    borderBottomColor:
      "rgba(224,193,138,0.3)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 54,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor:
      "rgba(183,122,24,0.12)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  topTitle: {
    color: "#2f1b03",
    fontSize: 18,
    fontWeight: "900",
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  content: {
    paddingBottom: 80,
  },
  banner: {
    height: 190,
    justifyContent: "flex-start",
    padding: 16,
  },
  bannerFallback: {
    backgroundColor: "#ead3a7",
  },
  bannerImage: {
    resizeMode: "cover",
  },
  typePill: {
    alignSelf: "flex-start",
    backgroundColor:
      "rgba(79,51,9,0.78)",
    borderRadius: 8,
    color: "#fffaf0",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "capitalize",
  },
  panel: {
    padding: 18,
  },
  title: {
    color: "#2f1b03",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  description: {
    color: "#79571b",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 23,
    marginTop: 10,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  metaText: {
    color: "#60420f",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  rsvpButton: {
    alignItems: "center",
    backgroundColor: "#fffdf8",
    borderColor: "#dfc684",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 50,
  },
  rsvpButtonActive: {
    backgroundColor: "#b97813",
    borderColor: "#b97813",
  },
  rsvpButtonText: {
    color: "#7a5311",
    fontSize: 15,
    fontWeight: "900",
  },
  rsvpButtonTextActive: {
    color: "#fffaf0",
  },
  commentsHeader: {
    alignItems: "center",
    borderTopColor:
      "rgba(224,193,138,0.28)",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  commentsTitle: {
    color: "#2f1b03",
    fontSize: 18,
    fontWeight: "900",
  },
  commentsCount: {
    color: "#9d7a42",
    fontSize: 14,
    fontWeight: "800",
  },
  commentComposer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 10,
    padding: 18,
  },
  commentInput: {
    backgroundColor: "#fff7ea",
    borderRadius: 8,
    color: "#2d1b02",
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 130,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "#b97813",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  commentItem: {
    backgroundColor: "#fffdf8",
    borderColor:
      "rgba(221,187,130,0.38)",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 18,
    padding: 14,
  },
  commentName: {
    color: "#2f1b03",
    fontSize: 14,
    fontWeight: "900",
  },
  commentText: {
    color: "#60420f",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  emptyComments: {
    color: "#79571b",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 18,
  },
  emptyText: {
    color: "#8d6a36",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});
