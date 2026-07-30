import React from "react";

import {
  ActionSheetIOS,
  Alert,
  Image,
  GestureResponderEvent,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  Linking,
} from "react-native";

import { useRouter } from "expo-router";

import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Play,
  MapPin,
  Share2,
} from "lucide-react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useDispatch } from "react-redux";

import {
  toggleLikeRequest,
} from "@/store/experiences/actions";

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
  const createdLabel = item.createdAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
      }).format(new Date(item.createdAt))
    : "";

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
        {/* USER */}

        <View style={styles.header}>
          {item.authorProfileImageUrl ? (
            <Image
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

          <View
            style={styles.headerInfo}
          >
            <Text
              numberOfLines={1}
              style={styles.name}
            >
              {item.authorName || "Sai Devotee"}
            </Text>

            <View style={styles.authorMeta}>
              <Text
                numberOfLines={1}
                style={styles.handle}
              >
                @{item.authorHandle || "saifamily"}
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
                color="#57534E"
                size={24}
              />
            </Pressable>
          ) : null}
        </View>

        {/* CONTENT */}

        {!!item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {String(item.category)}
            </Text>
          </View>
        )}

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
              Read full experience
            </Text>
          )}

        {!!item.location && (
          <View style={styles.locationRow}>
            <MapPin color="#9CA3AF" size={14} />
            <Text numberOfLines={1} style={styles.locationText}>
              {item.location}
            </Text>
          </View>
        )}

        {/* MEDIA */}

        {!!item.mediaAttachments?.length && (() => {
          const media = item.mediaAttachments[0];
          const isVideo = media.type === "video";
          const mediaUri = isVideo ? media.thumbnailUrl : media.url;

          return (
            <Pressable
              style={styles.mediaContainer}
              onPress={(e) => {
                e.stopPropagation();
                if (isVideo && media.url) {
                  Linking.openURL(media.url);
                } else {
                  router.push(`/experiences/${item.id}`);
                }
              }}
            >
              {mediaUri ? (
                <Image
                  source={{ uri: mediaUri }}
                  style={styles.media}
                />
              ) : (
                <View style={[styles.media, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
              )}
              {isVideo && (
                <View style={styles.playOverlay}>
                  <View style={styles.playButtonBackground}>
                    <Play size={32} color="#fff" fill="#fff" />
                  </View>
                </View>
              )}
            </Pressable>
          );
        })()}

        {/* ACTIONS */}

        <View style={styles.actions}>
          {/* LIKE */}

          <Pressable
            style={styles.actionButton}
            onPress={(event) =>
              handleActionPress(
                event,
                handleLike
              )
            }
          >
            <Heart
              size={20}
              color={
                item.likedByMe
                  ? "#dc2626"
                  : "#e45b5b"
              }
              fill={
                item.likedByMe
                  ? "#dc2626"
                  : "transparent"
              }
            />

            <Text
              style={styles.actionText}
            >
              {item.likes}
            </Text>
          </Pressable>

          {/* COMMENT */}

          <Pressable
            style={styles.actionButton}
            onPress={(event) =>
              handleActionPress(
                event,
                handleOpenDetail
              )
            }
          >
            <MessageCircle
              size={20}
              color="#6B7280"
            />

            <Text
              style={styles.actionText}
            >
              {item.comments}
            </Text>
          </Pressable>

          {/* REPOST */}

          <Pressable
            style={styles.actionButton}
            onPress={(event) =>
              handleActionPress(
                event,
                onRepost
              )
            }
          >
            <Repeat2
              size={20}
              color="#16A34A"
            />

            <Text
              style={styles.actionText}
            >
              {item.reposts}
            </Text>
          </Pressable>

          {/* BOOKMARK */}

          <Pressable
            style={styles.actionButton}
            onPress={(event) =>
              handleActionPress(
                event,
                onBookmark
              )
            }
          >
            <Bookmark
              size={20}
              color="#F97316"
              fill={
                item.bookmarkedByMe
                  ? "#F97316"
                  : "transparent"
              }
            />
          </Pressable>

          {/* SHARE */}

          <Pressable
            style={styles.actionButton}
            onPress={(event) =>
              handleActionPress(
                event,
                handleShare
              )
            }
          >
            <Share2 color="#6B7280" size={19} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 17,
    borderRadius: 18,

    overflow: "hidden",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E9D8BD",
    shadowColor: "#7C2D12",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 2,
  },
  cardNoBorder: {
    borderWidth: 0,
    marginHorizontal: 0,
    shadowOpacity: 0,
  },

  pressed: {
    opacity: 0.9,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 48,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#6B3F05",

    fontSize: 18,
    fontWeight: "900",
  },

  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },

  authorMeta: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 3,
  },

  name: {
    color: "#1F2937",

    fontSize: 16,
    fontWeight: "900",
  },

  handle: {
    color: "#78716C",
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
  },

  metaDot: {
    backgroundColor: "#A8A29E",
    borderRadius: 2,
    height: 3,
    marginHorizontal: 7,
    width: 3,
  },

  dateText: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "700",
  },

  moreButton: {
    alignItems: "center",
    backgroundColor: "#FAF7F2",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  actionPressed: {
    opacity: 0.65,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 112,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  categoryText: {
    color: "#C2410C",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  content: {
    marginTop: 16,

    color: "#1F2937",

    fontSize: 16,
    lineHeight: 25,
    fontWeight: "700",
  },

  readMore: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 8,
  },

  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },

  locationText: {
    color: "#78716C",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },

  mediaContainer: {
    width: "100%",
    height: 280,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F8F0DC",
  },

  media: {
    width: "100%",
    height: "100%",
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  playButtonBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },

  actions: {
    marginTop: 15,
    borderTopColor: "#F1E4CE",
    borderTopWidth: 1,
    paddingTop: 13,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionButton: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    minWidth: 42,
    paddingHorizontal: 5,
  },

  actionText: {
    color: "#6B7280",

    fontSize: 13,
    fontWeight: "800",
  },
});
