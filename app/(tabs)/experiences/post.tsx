import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
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

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";

import {
  Image as ImageIcon,
  MapPin,
  Mic,
  Sparkles,
  Video,
  X,
  Globe2,
  Play,
  UserCircle2,
} from "lucide-react-native";

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ExperienceTopTabs } from "@/components/experiences";

type MediaType = "image" | "video" | "audio";

type SelectedMedia = {
  uri: string;
  type: MediaType;
  name?: string;
};

export default function PremiumPostScreen() {
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] =
    useState<SelectedMedia | null>(null);

  const [location, setLocation] =
    useState<string>("");

  const inputHeight = useRef(
    new Animated.Value(160)
  ).current;

  const isDisabled = useMemo(() => {
    return (
      !content.trim() &&
      !selectedMedia &&
      !location
    );
  }, [content, selectedMedia, location]);

  // ───────────────── IMAGE ─────────────────

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

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
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Videos,
      });

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
      await DocumentPicker.getDocumentAsync({
        type: "audio/*",
      });

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
      await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });

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
    console.log({
      content,
      selectedMedia,
      location,
    });

    setContent("");
    setSelectedMedia(null);
    setLocation("");
  };

  // ───────────────── INPUT ANIMATION ─────────────────

  const handleFocus = () => {
    Animated.spring(inputHeight, {
      toValue: 220,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!content.trim()) {
      Animated.spring(inputHeight, {
        toValue: 160,
        useNativeDriver: false,
      }).start();
    }
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
          "#fffdf8",
          "#fff7e8",
          "#fff3df",
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ───────────────── HEADER ───────────────── */}

      {/* <BlurView
        intensity={65}
        tint="light"
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>
              Create Experience
            </Text>

            <Text style={styles.subtitle}>
              Share your divine moment
            </Text>
          </View>

          <View style={styles.sparkleWrapper}>
            <Sparkles
              size={18}
              color="#d18b1c"
            />
          </View>
        </View>
      </BlurView> */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <UserCircle2 size={32} color="#8e5d10" strokeWidth={1.5} />
          <Text style={styles.title}>Leela Feed</Text>
          <Sparkles size={24} color="#8e5d10" strokeWidth={1.5} />
        </View>
       <ExperienceTopTabs activeTab="post" />
      </View>

      {/* ───────────────── CONTENT ───────────────── */}

      <ScrollView
        style={styles.body}
        contentContainerStyle={
          styles.bodyContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ───────────────── CARD ───────────────── */}

        <BlurView
          intensity={45}
          tint="light"
          style={styles.composer}
        >
          {/* ───────────────── USER ───────────────── */}

          <View style={styles.userRow}>
            <LinearGradient
              colors={[
                "#f8deb0",
                "#eab96b",
              ]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                D
              </Text>
            </LinearGradient>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                Devotee
              </Text>

              <View
                style={styles.publicRow}
              >
                <Globe2
                  size={13}
                  color="#9c6a11"
                />

                <Text
                  style={styles.publicText}
                >
                  Public Experience
                </Text>
              </View>
            </View>
          </View>

          {/* ───────────────── INPUT ───────────────── */}

          <Animated.View
            style={{
              minHeight: inputHeight,
            }}
          >
            <TextInput
              value={content}
              onChangeText={setContent}
              onFocus={handleFocus}
              onBlur={handleBlur}
              multiline
              placeholder="What divine experience would you like to share today?"
              placeholderTextColor="#b38b58"
              style={styles.input}
              textAlignVertical="top"
            />
          </Animated.View>

          {/* ───────────────── MEDIA PREVIEW ───────────────── */}

          {selectedMedia && (
            <View style={styles.mediaContainer}>
              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setSelectedMedia(null)
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
                    uri: selectedMedia.uri,
                  }}
                  style={styles.media}
                />
              )}

              {selectedMedia.type ===
                "video" && (
                <View
                  style={styles.videoWrapper}
                >
                  <Image
                    source={{
                      uri: selectedMedia.uri,
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
                <LinearGradient
                  colors={[
                    "#fff6e5",
                    "#ffe7bf",
                  ]}
                  style={styles.audioCard}
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
                      style={
                        styles.audioName
                      }
                      numberOfLines={1}
                    >
                      {
                        selectedMedia.name
                      }
                    </Text>
                  </View>
                </LinearGradient>
              )}
            </View>
          )}

          {/* ───────────────── LOCATION ───────────────── */}

          {!!location && (
            <View
              style={styles.locationPill}
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

      {/* ───────────────── BOTTOM BAR ───────────────── */}

      <BlurView
        intensity={85}
        tint="light"
        style={styles.bottomBar}
      >
        <View style={styles.bottomContent}>
          <View style={styles.actionRow}>
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
            disabled={isDisabled}
            style={[
              styles.postButton,
              isDisabled &&
                styles.disabledButton,
            ]}
            onPress={handlePost}
          >
            <LinearGradient
              colors={[
                "#e2a43c",
                "#b97211",
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
              <Text
                style={styles.postText}
              >
                Post
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
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
    marginBottom:100
  },
  fixedTop: {
    backgroundColor: 'rgba(249, 208, 105, 0.22)',
    paddingTop: 54,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // header: {
  //   paddingTop: 58,
  //   paddingBottom: 16,
  //   paddingHorizontal: 20,
  //   borderBottomWidth: 1,
  //   borderBottomColor:
  //     "rgba(233, 208, 167, 0.45)",
  // },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#2f1b03",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 4,
    color: "#8f6a39",
    fontSize: 14,
    fontWeight: "500",
  },

  sparkleWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    flex: 1,
  },

  bodyContent: {
    padding: 18,
    paddingBottom: 160,
  },

  composer: {
    borderRadius: 34,
    overflow: "hidden",
    padding: 20,
    backgroundColor:
      "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor:
      "rgba(241, 214, 172, 0.6)",
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
    color: "#6d4202",
    fontSize: 22,
    fontWeight: "800",
  },

  userInfo: {
    marginLeft: 12,
  },

  userName: {
    color: "#352003",
    fontSize: 16,
    fontWeight: "700",
  },

  publicRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  publicText: {
    color: "#9c6a11",
    fontSize: 12,
    fontWeight: "600",
  },

  input: {
    marginTop: 22,
    color: "#3b2403",
    fontSize: 24,
    lineHeight: 38,
    fontWeight: "500",
  },

  mediaContainer: {
    marginTop: 18,
    borderRadius: 28,
    overflow: "hidden",
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor:
      "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  media: {
    width: "100%",
    height: 360,
    borderRadius: 28,
  },

  videoWrapper: {
    position: "relative",
  },

  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  audioCard: {
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  audioInfo: {
    marginLeft: 14,
    flex: 1,
  },

  audioTitle: {
    color: "#5e3903",
    fontSize: 15,
    fontWeight: "700",
  },

  audioName: {
    marginTop: 4,
    color: "#8b642c",
    fontSize: 13,
  },

  locationPill: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor:
      "rgba(248, 223, 184, 0.5)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  locationText: {
    color: "#8b5c10",
    fontSize: 13,
    fontWeight: "700",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingBottom:
      Platform.OS === "ios" ? 34 : 16,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor:
      "rgba(234, 208, 170, 0.45)",
  },

  bottomContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      "rgba(236, 208, 165, 0.5)",
  },

  postButton: {
    borderRadius: 999,
    overflow: "hidden",
  },

  disabledButton: {
    opacity: 0.45,
  },

  postGradient: {
    paddingHorizontal: 32,
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