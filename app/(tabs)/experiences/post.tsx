import React, {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import {
  Globe2,
  Image as ImageIcon,
  MapPin,
  Mic,
  Play,
  Sparkles,
  UserCircle2,
  Video,
  X,
} from "lucide-react-native";

import { ExperienceTopTabs } from "@/components/experiences";

import {
  createExperienceRequest,
} from "@/store/experiences/actions";

import {
  selectCreateExperienceLoading,
} from "@/store/experiences/selectors";

type MediaType =
  | "image"
  | "video"
  | "audio";

type SelectedMedia = {
  uri: string;
  type: MediaType;
  name?: string;
};

export default function PremiumPostScreen() {
  const dispatch = useDispatch();

  const creating = useSelector(
    selectCreateExperienceLoading
  );

  const account = useSelector(
    (state: any) =>
      state.devoteeAccount?.account
  );

  const [content, setContent] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [selectedMedia, setSelectedMedia] =
    useState<SelectedMedia | null>(
      null
    );

  const category = "miracles";

  const isDisabled = useMemo(() => {
    return (
      !content.trim() &&
      !selectedMedia
    );
  }, [content, selectedMedia]);

  // ───────────────── IMAGE ─────────────────

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes:
            ImagePicker
              .MediaTypeOptions.Images,

          quality: 1,
          allowsEditing: true,
        }
      );

    if (!result.canceled) {
      const asset = result.assets[0];

      setSelectedMedia({
        uri: asset.uri,
        type: "image",
        name: asset.fileName,
      });
    }
  };

  // ───────────────── VIDEO ─────────────────

  const pickVideo = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes:
            ImagePicker
              .MediaTypeOptions.Videos,
        }
      );

    if (!result.canceled) {
      const asset = result.assets[0];

      setSelectedMedia({
        uri: asset.uri,
        type: "video",
        name: asset.fileName,
      });
    }
  };

  // ───────────────── AUDIO ─────────────────

  const pickAudio = async () => {
    const result =
      await DocumentPicker.getDocumentAsync(
        {
          type: "audio/*",
        }
      );

    if (!result.canceled) {
      const asset = result.assets[0];

      setSelectedMedia({
        uri: asset.uri,
        type: "audio",
        name: asset.name,
      });
    }
  };

  // ───────────────── LOCATION ─────────────────

  const pickLocation = async () => {
    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const current =
      await Location.getCurrentPositionAsync();

    const reverse =
      await Location.reverseGeocodeAsync(
        {
          latitude:
            current.coords.latitude,

          longitude:
            current.coords.longitude,
        }
      );

    const place = reverse[0];

    const formatted = [
      place.city,
      place.region,
      place.country,
    ]
      .filter(Boolean)
      .join(", ");

    setLocation(formatted);
  };

  // ───────────────── POST ─────────────────

  const handlePost = () => {
    dispatch(
      createExperienceRequest({
        content,
        category,
        location,
        media: selectedMedia,
      })
    );

    setContent("");
    setLocation("");
    setSelectedMedia(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      {/* ───────────────── BACKGROUND ───────────────── */}

      <LinearGradient
        colors={[
          "#fffef9",
          "#fff7eb",
          "#fff4e4",
        ]}
        style={
          StyleSheet.absoluteFillObject
        }
      />

      {/* ───────────────── HEADER ───────────────── */}

      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <UserCircle2
            size={30}
            color="#8c5d11"
          />

          <Text style={styles.headerTitle}>
            Leela Feed
          </Text>

          <Sparkles
            size={22}
            color="#8c5d11"
          />
        </View>

        <ExperienceTopTabs activeTab="post" />
      </View>

      {/* ───────────────── BODY ───────────────── */}

      <ScrollView
        style={styles.body}
        contentContainerStyle={
          styles.bodyContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <BlurView
          intensity={45}
          tint="light"
          style={styles.card}
        >
          {/* ───────────────── USER ───────────────── */}

          <View style={styles.userRow}>
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
                {account?.name?.charAt(
                  0
                ) || "D"}
              </Text>
            </LinearGradient>

            <View
              style={styles.userInfo}
            >
              <Text
                style={styles.userName}
              >
                {account?.name ||
                  "Devotee"}
              </Text>

              <View
                style={styles.publicRow}
              >
                <Globe2
                  size={12}
                  color="#9d6912"
                />

                <Text
                  style={
                    styles.publicText
                  }
                >
                  Public Experience
                </Text>
              </View>
            </View>
          </View>

          {/* ───────────────── INPUT ───────────────── */}

          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholder="Share your divine experience..."
            placeholderTextColor="#b78c56"
            style={styles.input}
          />

          {/* ───────────────── MEDIA PREVIEW ───────────────── */}

          {selectedMedia && (
            <View
              style={
                styles.mediaContainer
              }
            >
              <Pressable
                onPress={() =>
                  setSelectedMedia(
                    null
                  )
                }
                style={
                  styles.closeButton
                }
              >
                <X
                  size={16}
                  color="#fff"
                />
              </Pressable>

              {selectedMedia.type ===
                "image" && (
                <Image
                  source={{
                    uri:
                      selectedMedia.uri,
                  }}
                  style={styles.media}
                />
              )}

              {selectedMedia.type ===
                "video" && (
                <View>
                  <Image
                    source={{
                      uri:
                        selectedMedia.uri,
                    }}
                    style={styles.media}
                  />

                  <View
                    style={
                      styles.playButton
                    }
                  >
                    <Play
                      size={24}
                      color="#fff"
                      fill="#fff"
                    />
                  </View>
                </View>
              )}

              {selectedMedia.type ===
                "audio" && (
                <View
                  style={
                    styles.audioCard
                  }
                >
                  <Mic
                    size={24}
                    color="#a66d11"
                  />

                  <View
                    style={
                      styles.audioInfo
                    }
                  >
                    <Text
                      style={
                        styles.audioTitle
                      }
                    >
                      Audio Selected
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={
                        styles.audioName
                      }
                    >
                      {
                        selectedMedia.name
                      }
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ───────────────── LOCATION ───────────────── */}

          {!!location && (
            <View
              style={
                styles.locationPill
              }
            >
              <MapPin
                size={14}
                color="#a66d11"
              />

              <Text
                style={
                  styles.locationText
                }
              >
                {location}
              </Text>
            </View>
          )}
        </BlurView>
      </ScrollView>

      {/* ───────────────── TOOLBAR ───────────────── */}

      <BlurView
        intensity={80}
        tint="light"
        style={styles.toolbar}
      >
        <View style={styles.actions}>
          <ActionButton
            icon={
              <ImageIcon
                size={20}
                color="#d18b1c"
              />
            }
            onPress={pickImage}
          />

          <ActionButton
            icon={
              <Video
                size={20}
                color="#d18b1c"
              />
            }
            onPress={pickVideo}
          />

          <ActionButton
            icon={
              <Mic
                size={20}
                color="#d18b1c"
              />
            }
            onPress={pickAudio}
          />

          <ActionButton
            icon={
              <MapPin
                size={20}
                color="#d18b1c"
              />
            }
            onPress={pickLocation}
          />
        </View>

        <Pressable
          disabled={
            isDisabled || creating
          }
          onPress={handlePost}
          style={[
            styles.postButton,
            (isDisabled ||
              creating) &&
              styles.disabledButton,
          ]}
        >
          <LinearGradient
            colors={[
              "#e0a03a",
              "#ba7512",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.postGradient
            }
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={
                  styles.postText
                }
              >
                Post
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

// ───────────────── ACTION BUTTON ─────────────────

function ActionButton({
  icon,
  onPress,
}: {
  icon: React.ReactNode;

  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.actionButton}
      onPress={onPress}
    >
      {icon}
    </Pressable>
  );
}

// ───────────────── STYLES ─────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
 marginBottom:100  },

  fixedTop: {
    paddingTop: 55,
    zIndex: 20,
    backgroundColor:
      "rgba(255,248,238,0.94)",
  },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  headerTitle: {
    color: "#432604",
    fontSize: 22,
    fontWeight: "800",
  },

  body: {
    flex: 1,
  },

  bodyContent: {
    padding: 18,
    paddingBottom: 160,
  },

  card: {
    borderRadius: 34,
    overflow: "hidden",
    padding: 20,

    backgroundColor:
      "rgba(255,255,255,0.58)",

    borderWidth: 1,

    borderColor:
      "rgba(236,210,167,0.55)",
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#6b4304",
    fontSize: 22,
    fontWeight: "800",
  },

  userInfo: {
    marginLeft: 12,
  },

  userName: {
    color: "#311c03",
    fontSize: 16,
    fontWeight: "700",
  },

  publicRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 5,
  },

  publicText: {
    color: "#9d6912",
    fontSize: 12,
    fontWeight: "600",
  },

  input: {
    marginTop: 22,
    minHeight: 180,

    color: "#3a2203",
    fontSize: 24,
    lineHeight: 38,
    fontWeight: "500",
  },

  mediaContainer: {
    marginTop: 18,
    borderRadius: 26,
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: 350,
    borderRadius: 26,
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,

    width: 32,
    height: 32,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(0,0,0,0.6)",
  },

  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",

    width: 60,
    height: 60,
    borderRadius: 30,

    marginLeft: -30,
    marginTop: -30,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(0,0,0,0.55)",
  },

  audioCard: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 22,

    padding: 18,

    backgroundColor:
      "rgba(255,239,210,0.9)",
  },

  audioInfo: {
    marginLeft: 14,
    flex: 1,
  },

  audioTitle: {
    color: "#5d3902",
    fontSize: 15,
    fontWeight: "700",
  },

  audioName: {
    marginTop: 4,
    color: "#87622c",
    fontSize: 13,
  },

  locationPill: {
    marginTop: 18,

    alignSelf: "flex-start",

    borderRadius: 999,

    paddingHorizontal: 14,
    paddingVertical: 8,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      "rgba(249,228,188,0.7)",
  },

  locationText: {
    marginLeft: 6,

    color: "#8b5b0f",
    fontSize: 13,
    fontWeight: "700",
  },

  toolbar: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 18,

    paddingTop: 14,

    paddingBottom:
      Platform.OS === "ios"
        ? 34
        : 16,

    borderTopWidth: 1,

    borderTopColor:
      "rgba(236,209,168,0.5)",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.75)",

    borderWidth: 1,

    borderColor:
      "rgba(236,209,168,0.5)",
  },

  postButton: {
    position: "absolute",
    right: 18,
    bottom:
      Platform.OS === "ios"
        ? 34
        : 16,

    overflow: "hidden",
    borderRadius: 999,
  },

  disabledButton: {
    opacity: 0.5,
  },

  postGradient: {
    paddingHorizontal: 34,
    paddingVertical: 14,
    borderRadius: 999,
  },

  postText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});