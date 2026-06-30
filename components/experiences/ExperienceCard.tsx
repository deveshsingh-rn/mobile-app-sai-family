import React from "react";

import {
  Image,
  GestureResponderEvent,
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
  item: any;
  disableNavigation?: boolean;
  hideBorder?: boolean;
  isActive?: boolean;
  onBookmark?: () => void;
  onLike?: () => void;
  onRepost?: () => void;
};

export function ExperienceCard({
  disableNavigation,
  hideBorder,
  item,
  onBookmark,
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

  const authorInitial =
    item.authorName?.charAt(0)?.toUpperCase() || "S";

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

          <View
            style={styles.headerInfo}
          >
            <Text
              numberOfLines={1}
              style={styles.name}
            >
              {item.authorName || "Sai Devotee"}
            </Text>

            <Text
              numberOfLines={1}
              style={styles.handle}
            >
              @{item.authorHandle || "saifamily"}
            </Text>
          </View>

          {!!item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {String(item.category)}
              </Text>
            </View>
          )}
        </View>

        {/* CONTENT */}

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

  name: {
    color: "#1F2937",

    fontSize: 16,
    fontWeight: "900",
  },

  handle: {
    marginTop: 2,

    color: "#78716C",

    fontSize: 13,
    fontWeight: "700",
  },

  categoryBadge: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 112,
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
