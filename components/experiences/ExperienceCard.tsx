import React from "react";

import {
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import {
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react-native";

import { BlurView } from "expo-blur";

import { LinearGradient } from "expo-linear-gradient";

import { useDispatch } from "react-redux";

import {
  toggleLikeRequest,
} from "@/store/experiences/actions";

import ExperienceActions from "./ExperienceActions";

type Props = {
  item: any;
};

export function ExperienceCard({
  item,
}: Props) {
  const router = useRouter();

  const dispatch = useDispatch();

  const handleLike = () => {
    dispatch(
      toggleLikeRequest(item.id)
    );
  };

  const handleShare = async () => {
    await Share.share({
      message: item.content,
    });
  };

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/experiences/${item.id}`
        )
      }
    >
      <BlurView
        intensity={40}
        tint="light"
        style={styles.card}
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

        <Text style={styles.content}>
          {item.content}
        </Text>

        {/* MEDIA */}

        {!!item.mediaAttachments
          ?.length && (
          <Image
            source={{
              uri:
                item
                  .mediaAttachments[0]
                  .url,
            }}
            style={styles.media}
          />
        )}

        {/* ACTIONS */}

        <View style={styles.actions}>
          {/* LIKE */}

          <Pressable
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Heart
              size={20}
              color="#e45b5b"
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
          >
            <Bookmark
              size={20}
              color="#b0851d"
            />
          </Pressable>

          {/* SHARE */}

          <Pressable
            style={styles.actionButton}
            onPress={handleShare}
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

  media: {
    width: "100%",
    height: 320,

    marginTop: 16,

    borderRadius: 22,
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