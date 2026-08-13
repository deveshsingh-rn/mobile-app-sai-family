import React from "react";

import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
  Image,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import {
  AudioLines,
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Repeat2,
  Share2,
} from "lucide-react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import { useDispatch } from "react-redux";

import {
  toggleLikeRequest,
} from "@/store/experiences/actions";

const formatCount = (value?: number) => {
  const count = Number(value) || 0;

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(
      count >= 10_000_000 ? 0 : 1
    )}M`;
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(
      count >= 10_000 ? 0 : 1
    )}K`;
  }

  return String(count);
};

const formatCreatedAt = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
};

const formatAudioTime = (value?: number) => {
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function ExperienceAudioAttachment({ url }: { url: string }) {
  const player = useAudioPlayer(url, {
    downloadFirst: true,
    updateInterval: 250,
  });
  const status = useAudioPlayerStatus(player);
  const progress =
    status.duration > 0
      ? Math.min(1, status.currentTime / status.duration)
      : 0;

  const togglePlayback = async (event: GestureResponderEvent) => {
    event.stopPropagation();

    try {
      if (status.playing) {
        player.pause();
        return;
      }

      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      player.muted = false;
      player.volume = 1;

      if (
        status.duration > 0 &&
        status.currentTime >= status.duration - 0.2
      ) {
        await player.seekTo(0);
      }

      player.play();
    } catch {
      Alert.alert(
        "Audio unavailable",
        "This audio could not be played. Please try again."
      );
    }
  };

  return (
    <Pressable
      accessibilityLabel={status.playing ? "Pause audio experience" : "Play audio experience"}
      accessibilityRole="button"
      onPress={togglePlayback}
      style={({ pressed }) => [
        styles.audioAttachment,
        pressed && styles.audioAttachmentPressed,
      ]}
    >
      <View style={styles.audioPlayButton}>
        {status.isBuffering ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : status.playing ? (
          <Pause color="#FFFFFF" fill="#FFFFFF" size={19} />
        ) : (
          <Play color="#FFFFFF" fill="#FFFFFF" size={19} />
        )}
      </View>

      <View style={styles.audioAttachmentBody}>
        <View style={styles.audioAttachmentHeading}>
          <AudioLines color="#9A3412" size={17} strokeWidth={2.2} />
          <Text style={styles.audioAttachmentTitle}>Voice experience</Text>
        </View>
        <View style={styles.audioProgressTrack}>
          <View
            style={[
              styles.audioProgressFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
        <View style={styles.audioTimeRow}>
          <Text style={styles.audioTimeText}>
            {formatAudioTime(status.currentTime)}
          </Text>
          <Text style={styles.audioTimeText}>
            {status.duration > 0 ? formatAudioTime(status.duration) : "Audio"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

type Props = {
  currentUserId?: string;
  item: any;
  disableNavigation?: boolean;
  hideBorder?: boolean;
  isActive?: boolean;
  onBookmark?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
};

export function ExperienceCard({
  currentUserId,
  disableNavigation,
  hideBorder,
  item,
  onBookmark,
  onDelete,
  onEdit,
  onLike,
  onComment,
  onRepost,
}: Props) {
  const router = useRouter();

  const dispatch = useDispatch();

  const handleLike = () => {
    if (onLike) {
      onLike();
      return;
    }

    dispatch(
      toggleLikeRequest(item.id)
    );
  };

  const handleOpenDetail = () => {
    if (!disableNavigation) {
      router.push(
        `/experiences/${item.id}`
      );
    }
  };

  const handleActionPress = (
    event: GestureResponderEvent,
    action?: () => void | Promise<void>
  ) => {
    event.stopPropagation();
    action?.();
  };

  const handleShare = async () => {
    await Share.share({
      message: item.content,
    });
  };

  const isOwner =
    Boolean(currentUserId) &&
    currentUserId ===
      (item.authorId || item.author?.id);

  const confirmDelete = () => {
    Alert.alert(
      "Delete experience?",
      "This experience and its conversations will be removed permanently.",
      [
        {
          style: "cancel",
          text: "Keep experience",
        },
        {
          onPress: onDelete,
          style: "destructive",
          text: "Delete",
        },
      ]
    );
  };

  const showOwnerActions = (
    event: GestureResponderEvent
  ) => {
    event.stopPropagation();

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
          options: [
            "Edit experience",
            "Delete experience",
            "Cancel",
          ],
          title: "Manage your experience",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            onEdit?.();
          } else if (buttonIndex === 1) {
            confirmDelete();
          }
        }
      );
      return;
    }

    Alert.alert(
      "Manage your experience",
      "Choose what you would like to do.",
      [
        {
          onPress: onEdit,
          text: "Edit experience",
        },
        {
          onPress: confirmDelete,
          style: "destructive",
          text: "Delete experience",
        },
        {
          style: "cancel",
          text: "Cancel",
        },
      ]
    );
  };

  const authorInitial =
    item.authorName?.charAt(0)?.toUpperCase() || "S";
  const createdLabel = formatCreatedAt(
    item.createdAt
  );
  return (
    <Pressable
      onPress={handleOpenDetail}
      style={({ pressed }) => [
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.card,
          hideBorder && styles.cardNoBorder,
        ]}
      >
        <View style={styles.socialRow}>
          {item.authorProfileImageUrl ? (
            <Image
              accessibilityLabel={`${item.authorName || "Sai devotee"} profile photo`}
              source={{
                uri: item.authorProfileImageUrl,
              }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={[
                "#f6deb0",
                "#ecb96b",
              ]}
              style={styles.avatar}
            >
              <Text
                style={styles.avatarText}
              >
                {authorInitial}
              </Text>
            </LinearGradient>
          )}

          <View style={styles.postBody}>
            <View style={styles.header}>
              <View style={styles.identityLine}>
                <Text
                  numberOfLines={1}
                  style={styles.name}
                >
                  {item.authorName || "Sai Devotee"}
                </Text>

                {!!createdLabel && (
                  <>
                    <View style={styles.metaDot} />
                    <Text style={styles.dateText}>
                      {createdLabel}
                    </Text>
                  </>
                )}
              </View>

              {isOwner ? (
                <Pressable
                  accessibilityLabel="Manage your experience"
                  hitSlop={8}
                  onPress={showOwnerActions}
                  style={({ pressed }) => [
                    styles.moreButton,
                    pressed && styles.actionPressed,
                  ]}
                >
                  <MoreHorizontal
                    color="#6B7280"
                    size={20}
                  />
                </Pressable>
              ) : null}
            </View>

            {(item.category || item.location) && (
              <View style={styles.contextRow}>
                {!!item.category && (
                  <View style={styles.categoryBadge}>
                    <Text numberOfLines={1} style={styles.categoryText}>
                      {String(item.category)}
                    </Text>
                  </View>
                )}

                {!!item.location && (
                  <View style={styles.locationRow}>
                    <MapPin color="#9CA3AF" size={12} />
                    <Text numberOfLines={1} style={styles.locationText}>
                      {item.location}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <Text
          numberOfLines={
            disableNavigation
              ? undefined
              : 2
          }
          style={styles.content}
        >
          {item.content}
        </Text>

        {!disableNavigation &&
          item.content?.length > 90 && (
            <Text style={styles.readMore}>
              Show more
            </Text>
          )}

        {!!item.mediaAttachments?.length &&
          (() => {
            const media =
              item.mediaAttachments[0];
            const isAudio =
              media.type === "audio";
            const isVideo =
              media.type === "video";
            const mediaUri = isVideo
              ? media.thumbnailUrl
              : media.url;

            if (isAudio) {
              return media.url ? (
                <ExperienceAudioAttachment url={media.url} />
              ) : (
                <View style={styles.audioUnavailable}>
                  <AudioLines color="#9A3412" size={20} />
                  <Text style={styles.audioUnavailableText}>
                    Audio is unavailable
                  </Text>
                </View>
              );
            }

            return (
              <Pressable
                accessibilityLabel={
                  isVideo
                    ? "Open experience video"
                    : "Open experience photo"
                }
                style={styles.mediaContainer}
                onPress={(event) => {
                  event.stopPropagation();

                  if (
                    isVideo &&
                    media.url
                  ) {
                    void Linking.openURL(
                      media.url
                    );
                  } else {
                    router.push(
                      `/experiences/${item.id}`
                    );
                  }
                }}
              >
                {mediaUri ? (
                  <Image
                    resizeMode="cover"
                    source={{
                      uri: mediaUri,
                    }}
                    style={styles.media}
                  />
                ) : (
                  <View
                    style={[
                      styles.media,
                      styles.mediaPlaceholder,
                    ]}
                  />
                )}

                {isVideo && (
                  <View
                    style={styles.playOverlay}
                  >
                    <View
                      style={
                        styles.playButtonBackground
                      }
                    >
                      <Play
                        color="#FFFFFF"
                        fill="#FFFFFF"
                        size={24}
                      />
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })()}

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={`${formatCount(item.likes)} likes`}
            accessibilityState={{ selected: Boolean(item.likedByMe) }}
            hitSlop={6}
            onPress={(event) =>
              handleActionPress(
                event,
                handleLike
              )
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Heart
              color={
                item.likedByMe
                  ? "#E11D48"
                  : "#6B7280"
              }
              fill={
                item.likedByMe
                  ? "#E11D48"
                  : "transparent"
              }
              size={18}
            />
            <Text
              style={[
                styles.actionText,
                item.likedByMe &&
                  styles.likeActionText,
              ]}
            >
              {formatCount(item.likes)}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel={`${formatCount(item.comments)} comments`}
            hitSlop={6}
            onPress={(event) =>
              handleActionPress(
                event,
                onComment || handleOpenDetail
              )
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <MessageCircle
              color="#6B7280"
              size={18}
            />
            <Text style={styles.actionText}>
              {formatCount(item.comments)}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel={`${formatCount(item.reposts)} reposts`}
            accessibilityState={{ selected: Boolean(item.repostedByMe) }}
            hitSlop={6}
            onPress={(event) =>
              handleActionPress(
                event,
                onRepost
              )
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Repeat2
              color={
                item.repostedByMe
                  ? "#15803D"
                  : "#6B7280"
              }
              size={18}
            />
            <Text
              style={[
                styles.actionText,
                item.repostedByMe &&
                  styles.repostActionText,
              ]}
            >
              {formatCount(item.reposts)}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel={
              item.bookmarkedByMe
                ? "Remove bookmark"
                : "Bookmark experience"
            }
            accessibilityState={{ selected: Boolean(item.bookmarkedByMe) }}
            hitSlop={6}
            onPress={(event) =>
              handleActionPress(
                event,
                onBookmark
              )
            }
            style={({ pressed }) => [
              styles.iconActionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Bookmark
              color={
                item.bookmarkedByMe
                  ? "#374151"
                  : "#6B7280"
              }
              fill={
                item.bookmarkedByMe
                  ? "#374151"
                  : "transparent"
              }
              size={18}
            />
          </Pressable>

          <Pressable
            accessibilityLabel="Share experience"
            hitSlop={6}
            onPress={(event) =>
              handleActionPress(
                event,
                handleShare
              )
            }
            style={({ pressed }) => [
              styles.iconActionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Share2
              color="#6B7280"
              size={18}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E5E4",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowColor: "#292524",
    shadowOffset: {
      height: 7,
      width: 0,
    },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  cardNoBorder: {
    borderRadius: 0,
    borderWidth: 0,
    marginHorizontal: 0,
    shadowOpacity: 0,
  },

  pressed: {
    opacity: 0.94,
  },

  socialRow: {
    alignItems: "flex-start",
    flexDirection: "row",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 24,
  },

  avatar: {
    alignItems: "center",
    borderColor: "#F1E4CE",
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  avatarText: {
    color: "#6B3F05",
    fontSize: 15,
    fontWeight: "900",
  },

  postBody: {
    flex: 1,
    marginLeft: 11,
  },

  identityLine: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },

  name: {
    color: "#111827",
    flexShrink: 1,
    fontSize: 14.5,
    fontWeight: "900",
  },

  metaDot: {
    backgroundColor: "#9CA3AF",
    borderRadius: 2,
    height: 3,
    marginHorizontal: 5,
    width: 3,
  },

  dateText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "500",
  },

  moreButton: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    marginLeft: 5,
    width: 30,
  },

  actionPressed: {
    backgroundColor: "#F3F4F6",
    opacity: 0.72,
  },

  contextRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
    minHeight: 18,
    minWidth: 0,
  },

  categoryBadge: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 100,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  categoryText: {
    color: "#9A3412",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  content: {
    color: "#292524",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: 9,
  },

  readMore: {
    color: "#C2410C",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  locationRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 3,
    marginLeft: 7,
    minWidth: 0,
  },

  locationText: {
    color: "#6B7280",
    flex: 1,
    fontSize: 10,
    fontWeight: "600",
  },

  audioAttachment: {
    alignItems: "center",
    backgroundColor: "#FFF8ED",
    borderColor: "#F3DFC0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    minHeight: 82,
    padding: 12,
  },

  audioAttachmentPressed: {
    backgroundColor: "#FFF2DE",
    opacity: 0.82,
  },

  audioPlayButton: {
    alignItems: "center",
    backgroundColor: "#292524",
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  audioAttachmentBody: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  audioAttachmentHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  audioAttachmentTitle: {
    color: "#292524",
    fontSize: 13,
    fontWeight: "800",
  },

  audioProgressTrack: {
    backgroundColor: "#E7D7BF",
    borderRadius: 2,
    height: 4,
    marginTop: 9,
    overflow: "hidden",
    width: "100%",
  },

  audioProgressFill: {
    backgroundColor: "#C2410C",
    borderRadius: 2,
    height: "100%",
  },

  audioTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  audioTimeText: {
    color: "#78716C",
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },

  audioUnavailable: {
    alignItems: "center",
    backgroundColor: "#FFF8ED",
    borderColor: "#F3DFC0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    minHeight: 60,
    paddingHorizontal: 14,
  },

  audioUnavailableText: {
    color: "#78716C",
    fontSize: 13,
    fontWeight: "700",
  },

  mediaContainer: {
    aspectRatio: 1.55,
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },

  media: {
    height: "100%",
    width: "100%",
  },

  mediaPlaceholder: {
    backgroundColor: "#F3F4F6",
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,39,0.16)",
  },

  playButtonBackground: {
    alignItems: "center",
    backgroundColor: "rgba(17,24,39,0.78)",
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  actions: {
    alignItems: "center",
    borderTopColor: "#F1F0EE",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
  },

  actionButton: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 4,
    height: 32,
    minWidth: 42,
    paddingHorizontal: 4,
  },

  iconActionButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },

  actionText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "600",
  },

  likeActionText: {
    color: "#E11D48",
  },

  repostActionText: {
    color: "#15803D",
  },
});
