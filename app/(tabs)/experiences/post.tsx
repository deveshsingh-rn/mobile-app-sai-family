import React, {
  useEffect,
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

import { router } from "expo-router";

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
  fetchExperienceCategoriesRequest,
} from "@/store/experiences/actions";

import {
  selectCreateExperienceLoading,
  selectExperienceCategories,
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

  const categories = useSelector(
    selectExperienceCategories
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

  const [selectedCategory, setSelectedCategory] =
    useState("miracles");

  const isDisabled = useMemo(() => {
    return (
      (!content.trim() &&
        !selectedMedia) ||
      !selectedCategory
    );
  }, [content, selectedMedia, selectedCategory]);

  useEffect(() => {
    dispatch(
      fetchExperienceCategoriesRequest()
    );
  }, [dispatch]);

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
        name: asset.fileName || undefined,
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
        name: asset.fileName || undefined,
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
    const userId =
      account?.id ||
      account?.authorId;

    dispatch(
      createExperienceRequest({
        content,
        category: selectedCategory,
        location,
        media: selectedMedia,
        userId,
      })
    );

    setContent("");
    setLocation("");
    setSelectedMedia(null);
    router.push("/experiences");
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
          "#FAFAF9",
          "#FFF7ED",
          "#FAFAF9",
        ]}
        style={
          StyleSheet.absoluteFillObject
        }
      />

      {/* ───────────────── HEADER ───────────────── */}

      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <UserCircle2
                size={23}
                color="#1F2937"
              />
            </View>

            <View>
              <Text style={styles.eyebrow}>Create</Text>
              <Text style={styles.headerTitle}>
                Share Experience
              </Text>
            </View>
          </View>

          <View style={styles.primaryAction}>
            <Sparkles
              size={17}
              color="#FFFFFF"
            />
          </View>
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

          <Text style={styles.sectionLabel}>
            Choose Category
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.categoryRow
            }
          >
            {categories.map(
              (item: {
                category: string;
                label: string;
              }) => {
                const isActive =
                  selectedCategory ===
                  item.category;

                return (
                  <Pressable
                    key={item.category}
                    onPress={() =>
                      setSelectedCategory(
                        item.category
                      )
                    }
                    style={[
                      styles.categoryChip,
                      isActive &&
                        styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isActive &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

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
    marginBottom: 100,
  },

  fixedTop: {
    paddingTop: 55,
    zIndex: 20,
    backgroundColor: "#FAFAF9",
    borderBottomColor: "#E7D7BE",
    borderBottomWidth: 1,
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
    color: "#1F2937",
    fontSize: 21,
    fontWeight: "900",
  },

  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  headerIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  eyebrow: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },

  primaryAction: {
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  body: {
    flex: 1,
  },

  bodyContent: {
    padding: 16,
    paddingBottom: 160,
  },

  card: {
    borderRadius: 14,
    overflow: "hidden",
    padding: 16,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E7D7BE",
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
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
  },

  publicRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 5,
  },

  publicText: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "600",
  },

  input: {
    marginTop: 18,
    minHeight: 150,

    color: "#1F2937",
    fontSize: 19,
    lineHeight: 29,
    fontWeight: "600",
  },

  sectionLabel: {
    marginTop: 24,
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  categoryRow: {
    gap: 10,
    paddingTop: 12,
    paddingBottom: 4,
  },

  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7D7BE",
  },

  categoryChipActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },

  categoryText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "800",
  },

  categoryTextActive: {
    color: "#fffaf0",
  },

  mediaContainer: {
    marginTop: 18,
    borderRadius: 12,
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: 280,
    borderRadius: 12,
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

    borderRadius: 12,

    padding: 18,

    backgroundColor: "#FFF7ED",
  },

  audioInfo: {
    marginLeft: 14,
    flex: 1,
  },

  audioTitle: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
  },

  audioName: {
    marginTop: 4,
    color: "#6B7280",
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

    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderWidth: 1,
  },

  locationText: {
    marginLeft: 6,

    color: "#C2410C",
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
      "#E7D7BE",
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

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E7D7BE",
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
  },
});
