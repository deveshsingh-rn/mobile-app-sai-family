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
} from "lucide-react-native";

import { BlurView } from "expo-blur";

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

  return (
    <Pressable
      onPress={() => {
        if (!disableNavigation) {
          router.push(
            `/experiences/${item.id}`
          );
        }
      }}
    >
      <BlurView
        intensity={40}
        tint="light"
        style={[styles.card, hideBorder && styles.cardNoBorder]}
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
              {item.authorName?.charAt(
                0
              )}
            </Text>
          </LinearGradient>

          <View
            style={styles.headerInfo}
          >
            <Text
              style={styles.name}
            >
              {item.authorName}
            </Text>

            <Text
              style={styles.handle}
            >
              @{item.authorHandle}
            </Text>
          </View>
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
              Read more
            </Text>
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
                event
              )
            }
          >
            <MessageCircle
              size={20}
              color="#7a7a7a"
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
              color="#1ea672"
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
              color="#b0851d"
              fill={
                item.bookmarkedByMe
                  ? "#b0851d"
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
            <Text
              style={styles.share}
            >
              Share
            </Text>
          </Pressable>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginBottom: 18,

    padding: 18,

    borderRadius: 28,

    overflow: "hidden",

    backgroundColor:
      "rgba(255,255,255,0.55)",

    borderWidth: 1,

    borderColor:
      "rgba(231,208,170,0.45)",
  },
  cardNoBorder: {
    borderWidth: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#5d3902",

    fontSize: 18,
    fontWeight: "800",
  },

  headerInfo: {
    marginLeft: 12,
  },

  name: {
    color: "#2d1a03",

    fontSize: 15,
    fontWeight: "800",
  },

  handle: {
    marginTop: 2,

    color: "#8b6a3d",

    fontSize: 12,
  },

  content: {
    marginTop: 16,

    color: "#3c2503",

    fontSize: 16,
    lineHeight: 28,
  },

  readMore: {
    color: "#9d6912",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },

  mediaContainer: {
    width: "100%",
    height: 320,
    marginTop: 16,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
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
    marginTop: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionText: {
    color: "#6f5220",

    fontSize: 13,
    fontWeight: "700",
  },

  share: {
    color: "#8b6515",

    fontWeight: "700",
  },
});
