import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  Share,
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
  Bookmark,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Clock3,
  Flag,
  Image as ImageIcon,
  Map,
  MapPin,
  Navigation,
  Pencil,
  SendHorizonal,
  Share2,
  Trash2,
  Users,
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
  selectEventCommentsError,
  selectEventCommentsLoading,
  selectEventDetail,
  selectEventsError,
  selectEventsLoading,
  selectIsAddingEventComment,
  selectIsEventRsvpPending,
} from "@/store/events/selectors";
import { validateEventCommentContent } from "@/store/events/validation";
import type {
  EventComment,
  EventFaq,
  EventUserSummary,
  SaiEvent,
} from "@/store/events/types";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

const formatLongDate = (value?: string) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  });
};

const getEventLocation = (event: SaiEvent) =>
  event.venueName || event.address || event.city || "Location pending";

const getCityLine = (event: SaiEvent) =>
  [event.city, event.state, event.country].filter(Boolean).join(", ");

const openEventMaps = (event: SaiEvent) => {
  const destination =
    event.latitude && event.longitude
      ? `${event.latitude},${event.longitude}`
      : encodeURIComponent(getEventLocation(event));

  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destination}`);
};

type EventDetailWithExtras = SaiEvent & {
  attendeesPreview?: EventUserSummary[];
};

const formatTime = (value?: string) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Time pending";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function EventDetailRoute() {
  const {id} = useLocalSearchParams<{id?: string}>();
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectEventDetail);
  const comments = useAppSelector(selectEventComments);
  const loading = useAppSelector(selectEventsLoading);
  const commentsLoading = useAppSelector(selectEventCommentsLoading);
  const commentsError = useAppSelector(selectEventCommentsError);
  const addingComment = useAppSelector(selectIsAddingEventComment);
  const error = useAppSelector(selectEventsError);
  const [comment, setComment] = useState("");

  const eventId = Array.isArray(id) ? id[0] : id;
  const rsvpPending = useAppSelector((state) =>
    selectIsEventRsvpPending(state, eventId)
  );

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventDetailRequest(eventId));
      dispatch(
        fetchEventCommentsRequest(eventId, {
          limit: 20,
          offset: 0,
        })
      );
    }
  }, [dispatch, eventId]);

  const handleRsvp = useCallback(() => {
    if (!eventId || !detail) {
      return;
    }

    if (detail.rsvpedByMe) {
      dispatch(cancelEventRsvpRequest(eventId));
      return;
    }

    dispatch(rsvpEventRequest(eventId));
  }, [detail, dispatch, eventId]);

  const handleComment = useCallback(() => {
    if (!eventId) {
      return;
    }

    const validation = validateEventCommentContent(comment);

    if (!validation.isValid) {
      Alert.alert("Comment", Object.values(validation.errors)[0]);
      return;
    }

    dispatch(addEventCommentRequest(eventId, comment.trim()));
    setComment("");
  }, [comment, dispatch, eventId]);

  const handleDelete = useCallback(() => {
    if (!eventId) {
      return;
    }

    Alert.alert("Cancel event", "Do you want to cancel this event?", [
      {style: "cancel", text: "No"},
      {
        onPress: () => {
          dispatch(deleteEventRequest(eventId));
          router.back();
        },
        style: "destructive",
        text: "Cancel event",
      },
    ]);
  }, [dispatch, eventId]);

  const handleShare = useCallback(() => {
    if (!detail) {
      return;
    }

    Share.share({
      message: `${detail.title}\n${formatLongDate(detail.startAt)} · ${formatTime(detail.startAt)}\n${getEventLocation(detail)}`,
      title: detail.title,
    });
  }, [detail]);

  if (loading && !detail) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#1F2937" size="large" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyText}>{error || "Event not found"}</Text>
      </View>
    );
  }

  const liveDetail = detail as EventDetailWithExtras;
  const location = getEventLocation(detail);
  const cityLine = getCityLine(detail);
  const canEdit = Boolean(detail.permissions?.canEdit || detail.isOwner);
  const canDelete = Boolean(detail.permissions?.canDelete || detail.isOwner);
  const mediaCount = (detail.media?.length || 0) + (detail.bannerUrl ? 1 : 0);
  const tags = [
    detail.type,
    ...(detail.tags || []),
  ].filter(Boolean) as string[];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          imageStyle={styles.heroImage}
          source={detail.bannerUrl ? {uri: detail.bannerUrl} : undefined}
          style={[styles.hero, !detail.bannerUrl && styles.heroFallback]}
        >
          {!detail.bannerUrl ? (
            <ImageIcon color="rgba(255,255,255,0.45)" size={58} />
          ) : null}
          <View style={styles.heroShade} />

          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(tabs)")
            }
            style={[styles.heroButton, styles.heroBack]}
          >
            <ArrowLeft color="#FFFFFF" size={19} />
          </Pressable>

          <View style={styles.heroActions}>
            {canEdit && (
              <Pressable
                onPress={() => router.push(`/events/edit?id=${detail.id}` as any)}
                style={styles.heroButton}
              >
                <Pencil color="#FFFFFF" size={17} />
              </Pressable>
            )}
            {canDelete && (
              <Pressable onPress={handleDelete} style={styles.heroButton}>
                <Trash2 color="#FFFFFF" size={17} />
              </Pressable>
            )}
            <Pressable onPress={handleShare} style={styles.heroButton}>
              <Share2 color="#FFFFFF" size={18} />
            </Pressable>
          </View>

          {mediaCount > 1 && (
            <View style={styles.galleryDots}>
            {Array.from({length: Math.min(mediaCount, 4)}).map((_, item) => (
              <View
                key={item}
                style={[styles.galleryDot, item === 0 && styles.galleryDotActive]}
              />
            ))}
          </View>
          )}
        </ImageBackground>

        <Section style={styles.eventHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{detail.title}</Text>
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Bookmark",
                  "Bookmark API exists in backend; frontend Redux wiring is the next integration step."
                )
              }
              style={styles.bookmarkButton}
            >
              <Bookmark
                color="#1F2937"
                fill={detail.bookmarkedByMe ? "#1F2937" : "transparent"}
                size={22}
              />
            </Pressable>
          </View>

          <QuickInfo
            icon={<Calendar color="#4B5563" size={19} />}
            primary={formatLongDate(detail.startAt)}
            secondary={`${formatTime(detail.startAt)} - ${formatTime(detail.endAt)} ${detail.timezone || ""}`.trim()}
          />
          <QuickInfo
            icon={<MapPin color="#4B5563" size={20} />}
            primary={location}
            secondary={cityLine || detail.address || "Address pending"}
          />
        </Section>

        <OrganizerSection event={detail} />
        <AttendeesSection
          count={detail.rsvps || 0}
          preview={liveDetail.attendeesPreview || []}
        />
        <AboutSection description={detail.description} />
        {!!detail.guidelines?.length && (
          <GuidelinesSection guidelines={detail.guidelines} />
        )}
        <LocationSection
          event={detail}
          location={location}
          address={detail.address}
          cityLine={cityLine}
        />
        {!!detail.faq?.length && <FaqSection faq={detail.faq} />}
        {!!detail.similarEvents?.length && (
          <SimilarEventsSection events={detail.similarEvents} />
        )}
        {!!tags.length && <TagsSection tags={tags} />}
        <CommentsSection
          addingComment={addingComment}
          comment={comment}
          comments={comments}
          commentsError={commentsError}
          commentsLoading={commentsLoading}
          onChangeComment={setComment}
          onSubmitComment={handleComment}
        />
        <ShareReportSection
          canReport={Boolean(canEdit || detail.isOwner)}
          onShare={handleShare}
        />
      </ScrollView>

      <View style={styles.fixedCta}>
        <View style={styles.fixedTopRow}>
          <View style={styles.fixedCopy}>
            <Text style={styles.fixedMeta}>Free Event</Text>
            <Text style={styles.fixedTitle}>{detail.rsvpedByMe ? "You're attending" : "Join Us"}</Text>
          </View>
          <Pressable
            disabled={rsvpPending}
            onPress={handleRsvp}
            style={[styles.attendButton, detail.rsvpedByMe && styles.attendButtonActive]}
          >
            {rsvpPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <CalendarCheck color="#FFFFFF" size={18} />
            )}
            <Text style={styles.attendText}>
              {rsvpPending
                ? "Updating"
                : detail.rsvpedByMe
                  ? "Going"
                  : "I'm Attending"}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert(
              "Calendar",
              "Use the RSVP button to include this event in your live calendar feed."
            )
          }
          style={styles.calendarButton}
        >
          <CalendarPlus color="#1F2937" size={15} />
          <Text style={styles.calendarText}>Add to Calendar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Section({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.section, style]}>{children}</View>;
}

function SectionTitle({action, title}: {action?: string; title: string}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!action && <Text style={styles.sectionAction}>{action}</Text>}
    </View>
  );
}

function QuickInfo({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary: string;
}) {
  return (
    <View style={styles.quickInfo}>
      <View style={styles.quickIcon}>{icon}</View>
      <View style={styles.quickCopy}>
        <Text style={styles.quickPrimary}>{primary}</Text>
        <Text style={styles.quickSecondary}>{secondary}</Text>
      </View>
    </View>
  );
}

function OrganizerSection({event}: {event: SaiEvent}) {
  const organizer = event.organizer;
  const organizerName =
    organizer?.name || event.ownerName || "Event organizer";

  return (
    <Section>
      <SectionTitle title="Organized By" />
      <View style={styles.organizerRow}>
        <View style={styles.organizerAvatar}>
          <Users color="#F97316" size={22} />
        </View>
        <View style={styles.organizerBody}>
          <Text style={styles.organizerName}>{organizerName}</Text>
          {!!organizer?.eventsOrganized && (
            <View style={styles.inlineMeta}>
              <Text style={styles.inlineText}>
                {organizer.eventsOrganized} events organized
              </Text>
            </View>
          )}
          <View style={styles.activeRow}>
            <View style={styles.activeDot} />
            <Text style={styles.inlineMuted}>Active organizer</Text>
          </View>
        </View>
      </View>
      {!!organizer?.bio && <Text style={styles.paragraph}>{organizer.bio}</Text>}
    </Section>
  );
}

function AttendeesSection({
  count,
  preview,
}: {
  count: number;
  preview: EventUserSummary[];
}) {
  return (
    <Section>
      <SectionTitle title="Who's Attending" />
      <View style={styles.attendeeSummary}>
        <View style={styles.attendeeAvatar}>
          <Users color="#FFFFFF" size={18} />
        </View>
        <View>
          <Text style={styles.attendeeCount}>{count} attending</Text>
          <Text style={styles.attendeeSub}>
            {preview.length
              ? preview.map((item) => item.name).slice(0, 3).join(", ")
              : "RSVP devotees will appear here when backend sends preview."}
          </Text>
        </View>
      </View>
    </Section>
  );
}

function AboutSection({description}: {description: string}) {
  return (
    <Section>
      <SectionTitle title="About This Event" />
      <Text style={styles.paragraph}>{description}</Text>
    </Section>
  );
}

function LocationSection({
  address,
  cityLine,
  event,
  location,
}: {
  address?: string;
  cityLine: string;
  event: SaiEvent;
  location: string;
}) {
  return (
    <Section>
      <SectionTitle title="Location" />
      <View style={styles.mapPreview}>
        <Map color="#9CA3AF" size={54} />
        <MapPin color="#1F2937" size={36} style={styles.mapPin} />
      </View>
      <Text style={styles.locationTitle}>{location}</Text>
      <Text style={styles.locationAddress}>{address || cityLine || "Address pending"}</Text>
      <View style={styles.twoButtons}>
        <Pressable
          onPress={() => openEventMaps(event)}
          style={styles.primarySmallButton}
        >
          <Navigation color="#FFFFFF" size={16} />
          <Text style={styles.primarySmallText}>Open in Maps</Text>
        </Pressable>
      </View>
    </Section>
  );
}

function GuidelinesSection({guidelines}: {guidelines: string[]}) {
  return (
    <Section>
      <SectionTitle title="Event Guidelines" />
      {guidelines.map((item) => (
        <Guideline
          key={item}
          icon={<Clock3 color="#4B5563" size={16} />}
          text={item}
          title="Guideline"
        />
      ))}
    </Section>
  );
}

function Guideline({icon, text, title}: {icon: React.ReactNode; text: string; title: string}) {
  return (
    <View style={styles.guideline}>
      <View style={styles.guidelineIcon}>{icon}</View>
      <View style={styles.guidelineCopy}>
        <Text style={styles.guidelineTitle}>{title}</Text>
        <Text style={styles.guidelineText}>{text}</Text>
      </View>
    </View>
  );
}

function FaqSection({faq}: {faq: EventFaq[]}) {
  return (
    <Section>
      <SectionTitle title="Frequently Asked Questions" />
      {faq.map((item) => (
        <View key={item.question} style={styles.faqRow}>
          <Text style={styles.faqText}>{item.question}</Text>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      ))}
    </Section>
  );
}

function SimilarEventsSection({events}: {events: SaiEvent[]}) {
  return (
    <Section>
      <SectionTitle title="Similar Events" />
      {events.map((event) => (
        <Pressable
          key={event.id}
          onPress={() => router.push(`/events/${event.id}` as any)}
          style={styles.similarCard}
        >
          <View style={styles.similarImage}>
            <ImageIcon color="#6B7280" size={24} />
          </View>
          <View style={styles.similarBody}>
            <Text numberOfLines={1} style={styles.similarTitle}>{event.title}</Text>
            <Text style={styles.similarMeta}>{formatLongDate(event.startAt)}</Text>
            <Text numberOfLines={1} style={styles.similarMeta}>
              {getEventLocation(event)}
            </Text>
          </View>
        </Pressable>
      ))}
    </Section>
  );
}

function TagsSection({tags}: {tags: string[]}) {
  return (
    <Section>
      <SectionTitle title="Tags" />
      <View style={styles.tags}>
        {Array.from(new Set(tags)).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function CommentsSection({
  addingComment,
  comment,
  comments,
  commentsError,
  commentsLoading,
  onChangeComment,
  onSubmitComment,
}: {
  addingComment: boolean;
  comment: string;
  comments: EventComment[];
  commentsError?: string | null;
  commentsLoading: boolean;
  onChangeComment: (value: string) => void;
  onSubmitComment: () => void;
}) {
  return (
    <Section>
      <SectionTitle action={`${comments.length}`} title="Comments" />
      <View style={styles.commentComposer}>
        <TextInput
          multiline
          onChangeText={onChangeComment}
          placeholder="Write a comment..."
          placeholderTextColor="#9CA3AF"
          style={styles.commentInput}
          value={comment}
        />
        <Pressable
          disabled={addingComment || !comment.trim()}
          onPress={onSubmitComment}
          style={[styles.sendButton, (!comment.trim() || addingComment) && styles.disabled]}
        >
          <SendHorizonal color="#FFFFFF" size={17} />
        </Pressable>
      </View>
      {commentsLoading && comments.length === 0 ? (
        <ActivityIndicator color="#1F2937" />
      ) : comments.length === 0 ? (
        <Text style={styles.emptyComments}>{commentsError || "No comments yet."}</Text>
      ) : (
        <>
          {!!commentsError && <Text style={styles.commentsError}>{commentsError}</Text>}
          {comments.map((item) => (
            <View key={item.id} style={styles.commentItem}>
              <Text style={styles.commentName}>{item.author?.name || "Devotee"}</Text>
              <Text style={styles.commentText}>{item.content}</Text>
            </View>
          ))}
        </>
      )}
    </Section>
  );
}

function ShareReportSection({
  canReport,
  onShare,
}: {
  canReport: boolean;
  onShare: () => void;
}) {
  return (
    <Section style={styles.shareSection}>
      <View style={styles.twoButtons}>
        <Pressable onPress={onShare} style={styles.secondarySmallButton}>
          <Share2 color="#1F2937" size={16} />
          <Text style={styles.secondarySmallText}>Share Event</Text>
        </Pressable>
        {canReport && (
          <Pressable
            onPress={() =>
              Alert.alert(
                "Event report",
                "Backend report API exists; frontend report form wiring is the next step."
              )
            }
            style={styles.secondarySmallButton}
          >
            <Flag color="#1F2937" size={16} />
            <Text style={styles.secondarySmallText}>Report</Text>
          </Pressable>
        )}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: "#6B7280",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  activeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  activityLine: {
    alignItems: "center",
    borderTopColor: "#FFF7ED",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
  },
  activityText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  askButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
    marginTop: 14,
  },
  askText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
  },
  attendeeAvatar: {
    borderColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    width: 40,
  },
  attendeeCount: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "800",
  },
  attendeeSub: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  attendeeSummary: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  avatarOverlap: {
    marginLeft: -9,
  },
  avatarStack: {
    flexDirection: "row",
  },
  badgeRow: {
    borderTopColor: "#FFF7ED",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
  },
  bigAvatarOverlap: {
    marginLeft: -12,
  },
  bookmarkButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  calendarButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    height: 40,
    justifyContent: "center",
    marginTop: 9,
  },
  calendarText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "800",
  },
  checkBlock: {
    marginTop: 16,
  },
  checkRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 9,
    marginTop: 9,
  },
  checkText: {
    color: "#4B5563",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  commentComposer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 10,
  },
  commentInput: {
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 12,
    borderWidth: 1,
    color: "#1F2937",
    flex: 1,
    fontSize: 14,
    maxHeight: 120,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentItem: {
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  commentName: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
  },
  commentText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  commentsError: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
  },
  connectionBox: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#F6EFD9",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    padding: 12,
  },
  connectionText: {
    color: "#1F2937",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  content: {
    paddingBottom: 132,
  },
  disabled: {
    opacity: 0.48,
  },
  emptyComments: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  eventHeader: {
    paddingTop: 20,
  },
  facilityRow: {
    gap: 8,
    marginTop: 12,
  },
  facilityText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
  faqRow: {
    alignItems: "flex-start",
    borderColor: "#F6EFD9",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  faqAnswer: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 7,
  },
  faqText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  fixedCopy: {
    flex: 1,
  },
  fixedCta: {
    backgroundColor: "#FAFAF9",
    borderTopColor: "#F6EFD9",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: "absolute",
    right: 0,
  },
  fixedMeta: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
  fixedTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  fixedTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  followButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  followText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  galleryDot: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderRadius: 2,
    height: 4,
    width: 32,
  },
  galleryDotActive: {
    backgroundColor: "#FFFFFF",
  },
  galleryDots: {
    bottom: 16,
    flexDirection: "row",
    gap: 6,
    left: 0,
    position: "absolute",
    right: 0,
    justifyContent: "center",
  },
  guideline: {
    alignItems: "flex-start",
    backgroundColor: "#FAFAF9",
    borderRadius: 12,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  guidelineCopy: {
    flex: 1,
  },
  guidelineIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F6EFD9",
    borderRadius: 9,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  guidelineText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },
  guidelineTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  helpfulRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
  },
  helpfulText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 8,
  },
  hero: {
    alignItems: "center",
    backgroundColor: "#2B1308",
    height: 280,
    justifyContent: "center",
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    right: 16,
    top: 48,
  },
  heroBack: {
    left: 16,
    position: "absolute",
    top: 48,
  },
  heroButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.42)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  heroFallback: {
    backgroundColor: "#2B1308",
  },
  heroImage: {
    resizeMode: "cover",
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.26)",
  },
  inlineMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  inlineMuted: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  inlineText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "800",
  },
  loader: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  locationAddress: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 4,
  },
  locationTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 14,
  },
  mapPin: {
    position: "absolute",
  },
  mapPreview: {
    alignItems: "center",
    backgroundColor: "#F6EFD9",
    borderRadius: 16,
    height: 180,
    justifyContent: "center",
    overflow: "hidden",
  },
  organizerAvatar: {
    borderColor: "#F6EFD9",
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    width: 56,
  },
  organizerBody: {
    flex: 1,
  },
  organizerName: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
  },
  organizerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  paragraph: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    marginBottom: 12,
  },
  plusAvatar: {
    alignItems: "center",
    backgroundColor: "#F97316",
    justifyContent: "center",
  },
  plusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  primarySmallButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
  },
  primarySmallText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  quickCopy: {
    flex: 1,
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  quickInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  quickPrimary: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "800",
  },
  quickSecondary: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  ratingBars: {
    flex: 1,
    gap: 7,
  },
  ratingBox: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderRadius: 16,
    flexDirection: "row",
    gap: 22,
    padding: 16,
  },
  ratingFill: {
    backgroundColor: "#F97316",
    borderRadius: 3,
    height: "100%",
  },
  ratingLabel: {
    color: "#6B7280",
    fontSize: 11,
    width: 28,
  },
  ratingLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  ratingNumber: {
    color: "#1F2937",
    fontSize: 32,
    fontWeight: "900",
  },
  ratingScore: {
    alignItems: "center",
    width: 78,
  },
  ratingSub: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  ratingTrack: {
    backgroundColor: "#F6EFD9",
    borderRadius: 3,
    flex: 1,
    height: 6,
    overflow: "hidden",
  },
  readMore: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 12,
  },
  readMoreText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
  },
  review: {
    alignItems: "flex-start",
    borderTopColor: "#FFF7ED",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
  },
  reviewAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  reviewBody: {
    flex: 1,
  },
  reviewDate: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
  },
  reviewName: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  reviewText: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  reviewTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondarySmallButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
  },
  secondarySmallText: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "800",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#F6EFD9",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionAction: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  shareSection: {
    borderBottomWidth: 0,
  },
  similarBody: {
    flex: 1,
    minWidth: 0,
  },
  similarCard: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderColor: "#FFF7ED",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  similarImage: {
    alignItems: "center",
    backgroundColor: "#F1E8DA",
    borderRadius: 10,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  similarMeta: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  similarTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },
  smallAvatar: {
    borderColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    width: 32,
  },
  smallAvatarStack: {
    flexDirection: "row",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  subhead: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  tag: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  title: {
    color: "#1F2937",
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  trustBadge: {
    alignItems: "center",
    backgroundColor: "#FAFAF9",
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  trustText: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "700",
  },
  twoButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  attendButton: {
    alignItems: "center",
    backgroundColor: "#F97316",
    borderRadius: 24,
    flexDirection: "row",
    gap: 8,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  attendButtonActive: {
    backgroundColor: "#262626",
  },
  attendText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
