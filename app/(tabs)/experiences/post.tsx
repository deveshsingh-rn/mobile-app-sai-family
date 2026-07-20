import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  InputAccessoryView,
  Keyboard,
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
  Check,
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
import { requestLocationPermissionWithSettingsFallback } from "@/services/location-permissions";

type MediaType =
  | "image"
  | "video"
  | "audio";

type SelectedMedia = {
  uri: string;
  type: MediaType;
  name?: string;
};

const COMPOSER_ACCESSORY_ID = "experience-post-composer-accessory";

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

  const [isComposerFocused, setIsComposerFocused] =
    useState(false);

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
    const hasPermission =
      await requestLocationPermissionWithSettingsFallback({
        message:
          "Please allow location access to add your current place to this experience.",
        settingsMessage:
          "Location access is turned off for Sai Family. Please enable it from Settings to add your current place.",
      });

    if (!hasPermission) {
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setIsComposerFocused(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={0}
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
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
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
            inputAccessoryViewID={
              Platform.OS === "ios"
                ? COMPOSER_ACCESSORY_ID
                : undefined
            }
            onBlur={() =>
              setIsComposerFocused(false)
            }
            onFocus={() =>
              setIsComposerFocused(true)
            }
            onSubmitEditing={dismissKeyboard}
            returnKeyType="done"
            textAlignVertical="top"
            placeholder="Write your experience in your own words..."
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

      {Platform.OS !== "ios" && isComposerFocused && (
        <View style={styles.androidDoneBar}>
          <Pressable
            onPress={dismissKeyboard}
            style={styles.keyboardDoneButton}
          >
            <Check
              color="#FFFFFF"
              size={16}
              strokeWidth={2.5}
            />
            <Text style={styles.keyboardDoneText}>
              Done
            </Text>
          </Pressable>
        </View>
      )}

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

      {Platform.OS === "ios" && (
        <InputAccessoryView
          nativeID={
            COMPOSER_ACCESSORY_ID
          }
        >
          <View style={styles.keyboardAccessory}>
            <Text style={styles.keyboardAccessoryHint}>
              Experience note
            </Text>
            <Pressable
              onPress={dismissKeyboard}
              style={styles.keyboardDoneButton}
            >
              <Check
                color="#FFFFFF"
                size={16}
                strokeWidth={2.5}
              />
              <Text style={styles.keyboardDoneText}>
                Done
              </Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
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
    backgroundColor: "#FFFCF7",
    borderBottomColor: "#E9D8BD",
    borderBottomWidth: 1,
  },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  headerTitle: {
    color: "#1F2937",
    fontSize: 23,
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
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  eyebrow: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },

  primaryAction: {
    alignItems: "center",
    backgroundColor: "#23201D",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  body: {
    flex: 1,
  },

  bodyContent: {
    padding: 17,
    paddingBottom: 160,
  },

  card: {
    borderRadius: 18,
    overflow: "hidden",
    padding: 17,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E9D8BD",
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
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
    fontSize: 17,
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
    fontSize: 13,
    fontWeight: "800",
  },

  input: {
    backgroundColor: "#FFFBF5",
    borderColor: "#E9D8BD",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
    minHeight: 170,
    padding: 14,

    color: "#1F2937",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700",
  },

  sectionLabel: {
    marginTop: 24,
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
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
    paddingVertical: 11,
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
    fontSize: 14,
    fontWeight: "800",
  },

  categoryTextActive: {
    color: "#fffaf0",
  },

  mediaContainer: {
    marginTop: 18,
    borderRadius: 16,
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: 280,
    borderRadius: 16,
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

    borderRadius: 16,

    padding: 18,

    backgroundColor: "#FFF7ED",
  },

  audioInfo: {
    marginLeft: 14,
    flex: 1,
  },

  audioTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
  },

  audioName: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },

  locationPill: {
    marginTop: 18,

    alignSelf: "flex-start",

    borderRadius: 999,

    paddingHorizontal: 14,
    paddingVertical: 9,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderWidth: 1,
  },

  locationText: {
    marginLeft: 6,

    color: "#C2410C",
    fontSize: 14,
    fontWeight: "800",
  },

  toolbar: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 18,

    paddingTop: 15,

    paddingBottom:
      Platform.OS === "ios"
        ? 34
        : 16,

    borderTopWidth: 1,

    borderTopColor: "#E7D7BE",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  androidDoneBar: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255,252,247,0.96)",
    borderTopColor: "#E7D7BE",
    borderTopWidth: 1,
    bottom:
      Platform.OS === "ios"
        ? 102
        : 84,
    left: 0,
    paddingHorizontal: 18,
    paddingVertical: 10,
    position: "absolute",
    right: 0,
  },

  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E9D8BD",
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

  keyboardAccessory: {
    alignItems: "center",
    backgroundColor: "#FFFCF7",
    borderTopColor: "#E7D7BE",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  keyboardAccessoryHint: {
    color: "#78716C",
    fontSize: 13,
    fontWeight: "800",
  },

  keyboardDoneButton: {
    alignItems: "center",
    backgroundColor: "#23201D",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
  },

  keyboardDoneText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  postGradient: {
    paddingHorizontal: 36,
    paddingVertical: 15,
    borderRadius: 999,
  },

  postText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});
