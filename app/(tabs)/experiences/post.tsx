import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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
  Modal,
} from "react-native";

import { router } from "expo-router";

import { useDispatch, useSelector } from "react-redux";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import {
  Check,
  ChevronRight,
  CircleStop,
  FileAudio,
  Globe2,
  Image as ImageIcon,
  Languages,
  MapPin,
  Mic,
  Play,
  Radio,
  Upload,
  Video,
  X,
} from "lucide-react-native";

import {
  CategoryChips,
  ExperienceTopTabs,
} from "@/components/experiences";

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

const COMPOSER_ACCESSORY_ID = "experience-post-composer-accessory";

const formatRecordingDuration = (durationMillis: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

async function getSpeechRecognitionModule() {
  const speechRecognition = await import("expo-speech-recognition");

  if (!speechRecognition.ExpoSpeechRecognitionModule) {
    throw new Error("Speech recognition is unavailable in this build.");
  }

  return speechRecognition.ExpoSpeechRecognitionModule;
}

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

  const [isLocating, setIsLocating] = useState(true);
  const [isDictating, setIsDictating] = useState(false);
  const [voiceMenuVisible, setVoiceMenuVisible] = useState(false);
  const contentBeforeDictationRef = useRef("");

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioRecorderState = useAudioRecorderState(audioRecorder, 250);

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

  const attachCurrentLocation = useCallback(async () => {
    setIsLocating(true);

    try {
      let permission = await Location.getForegroundPermissionsAsync();

      if (!permission.granted && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        return;
      }

      const cachedLocation = await Location.getLastKnownPositionAsync({
        maxAge: 5 * 60 * 1000,
        requiredAccuracy: 500,
      });
      const current =
        cachedLocation ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));
      const reverse = await Location.reverseGeocodeAsync({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
      const place = reverse[0];
      const formatted = [place?.city, place?.region, place?.country]
        .filter(Boolean)
        .join(", ");

      setLocation(formatted);
    } catch {
      // Location enriches a post but must never block composing or publishing it.
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    void attachCurrentLocation();
  }, [attachCurrentLocation]);

  useEffect(() => {
    let mounted = true;
    let resultSubscription: { remove: () => void } | undefined;
    let errorSubscription: { remove: () => void } | undefined;
    let endSubscription: { remove: () => void } | undefined;

    void getSpeechRecognitionModule()
      .then((speechRecognitionModule) => {
        if (!mounted) {
          return;
        }

        resultSubscription = speechRecognitionModule.addListener(
          "result",
          (event: {
            isFinal: boolean;
            results?: { transcript?: string }[];
          }) => {
            const transcript = event.results?.[0]?.transcript?.trim();

            if (!transcript) {
              return;
            }

            setContent(
              [contentBeforeDictationRef.current, transcript]
                .filter(Boolean)
                .join(" ")
            );

            if (event.isFinal) {
              setIsDictating(false);
            }
          }
        );
        errorSubscription = speechRecognitionModule.addListener(
          "error",
          (event: { message?: string }) => {
            setIsDictating(false);
            Alert.alert(
              "Voice typing unavailable",
              event.message || "Please try again or type your experience."
            );
          }
        );
        endSubscription = speechRecognitionModule.addListener("end", () => {
          setIsDictating(false);
        });
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      resultSubscription?.remove();
      errorSubscription?.remove();
      endSubscription?.remove();
    };
  }, []);

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

  // ───────────────── VOICE INPUT ─────────────────

  const startEnglishDictation = async () => {
    try {
      const speechRecognitionModule = await getSpeechRecognitionModule();
      const permission = await speechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission required",
          "Allow microphone and speech recognition access to type by speaking."
        );
        return;
      }

      contentBeforeDictationRef.current = content.trim();
      setVoiceMenuVisible(false);
      setIsDictating(true);
      speechRecognitionModule.start({
        continuous: false,
        interimResults: true,
        lang: "en-IN",
        maxAlternatives: 1,
      });
    } catch (error) {
      setIsDictating(false);
      Alert.alert(
        "Voice typing unavailable",
        error instanceof Error
          ? error.message
          : "Please use the keyboard for now."
      );
    }
  };

  const startAudioRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission required",
          "Allow microphone access to record an audio experience."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      Alert.alert(
        "Recording unavailable",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const stopAudioRecording = async () => {
    try {
      await audioRecorder.stop();

      if (audioRecorder.uri) {
        setSelectedMedia({
          name: `Sai voice experience ${new Date().toLocaleTimeString()}.m4a`,
          type: "audio",
          uri: audioRecorder.uri,
        });
      }

      await setAudioModeAsync({ allowsRecording: false });
      setVoiceMenuVisible(false);
    } catch (error) {
      Alert.alert(
        "Could not save recording",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const chooseAudioFile = async () => {
    await pickAudio();
    setVoiceMenuVisible(false);
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

          <Text style={styles.sectionLabel}>Experience category</Text>
          <View style={styles.categoryRail}>
            <CategoryChips
              activeValue={selectedCategory}
              categories={categories.map(
                (item: { category: string; label: string }) => ({
                  label: item.label,
                  value: item.category,
                })
              )}
              onChange={setSelectedCategory}
            />
          </View>

          <View style={styles.composerHeading}>
            <View>
              <Text style={styles.sectionLabel}>Your experience</Text>
              <Text style={styles.composerHint}>
                Type naturally or use voice typing.
              </Text>
            </View>
            {isDictating ? (
              <View style={styles.listeningBadge}>
                <View style={styles.listeningDot} />
                <Text style={styles.listeningText}>Listening</Text>
              </View>
            ) : null}
          </View>

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
            placeholder="Share what happened and how Sai touched your life..."
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
                  <FileAudio
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

          {isLocating ? (
            <View style={styles.locationPill}>
              <ActivityIndicator color="#A34A0A" size="small" />
              <Text style={styles.locationText}>Adding current location</Text>
            </View>
          ) : !!location ? (
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
          ) : null}
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
            label="Choose an image"
            icon={
              <ImageIcon
                size={20}
                color="#d18b1c"
              />
            }
            onPress={pickImage}
          />

          <ActionButton
            label="Choose a video"
            icon={
              <Video
                size={20}
                color="#d18b1c"
              />
            }
            onPress={pickVideo}
          />

          <ActionButton
            active={isDictating || audioRecorderState.isRecording}
            label="Voice and audio options"
            icon={
              <Mic
                size={20}
                color={
                  isDictating || audioRecorderState.isRecording
                    ? "#FFFFFF"
                    : "#292524"
                }
              />
            }
            onPress={() => setVoiceMenuVisible(true)}
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

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!audioRecorderState.isRecording) {
            setVoiceMenuVisible(false);
          }
        }}
        transparent
        visible={voiceMenuVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            disabled={audioRecorderState.isRecording}
            onPress={() => setVoiceMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.voiceSheet}>
            <View style={styles.sheetHandle} />

            {audioRecorderState.isRecording ? (
              <View style={styles.recordingPanel}>
                <View style={styles.recordingIcon}>
                  <Radio color="#FFFFFF" size={28} strokeWidth={2.2} />
                </View>
                <Text style={styles.sheetTitle}>Recording your experience</Text>
                <Text style={styles.recordingTimer}>
                  {formatRecordingDuration(audioRecorderState.durationMillis)}
                </Text>
                <Text style={styles.sheetDescription}>
                  Speak clearly. Tap stop when your message is complete.
                </Text>
                <Pressable
                  accessibilityLabel="Stop and save audio recording"
                  accessibilityRole="button"
                  onPress={stopAudioRecording}
                  style={styles.stopRecordingButton}
                >
                  <CircleStop color="#FFFFFF" size={21} strokeWidth={2.4} />
                  <Text style={styles.stopRecordingText}>Stop and save</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeadingCopy}>
                    <Text style={styles.sheetEyebrow}>VOICE TOOLS</Text>
                    <Text style={styles.sheetTitle}>How would you like to share?</Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Close voice options"
                    accessibilityRole="button"
                    onPress={() => setVoiceMenuVisible(false)}
                    style={styles.sheetCloseButton}
                  >
                    <X color="#57534E" size={21} />
                  </Pressable>
                </View>

                <VoiceOption
                  description="Speak in English and add it to your written post."
                  icon={<Languages color="#9A3412" size={23} />}
                  onPress={startEnglishDictation}
                  title="Type with your voice"
                />
                <VoiceOption
                  description="Record and publish your voice as an audio experience."
                  icon={<Radio color="#9A3412" size={23} />}
                  onPress={startAudioRecording}
                  title="Record audio now"
                />
                <VoiceOption
                  description="Choose an existing audio file from this device."
                  icon={<Upload color="#9A3412" size={23} />}
                  onPress={chooseAudioFile}
                  title="Upload audio file"
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ───────────────── ACTION BUTTON ─────────────────

function ActionButton({
  active = false,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        active && styles.activeActionButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}

function VoiceOption({
  description,
  icon,
  onPress,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.voiceOption,
        pressed && styles.voiceOptionPressed,
      ]}
    >
      <View style={styles.voiceOptionIcon}>{icon}</View>
      <View style={styles.voiceOptionCopy}>
        <Text style={styles.voiceOptionTitle}>{title}</Text>
        <Text style={styles.voiceOptionDescription}>{description}</Text>
      </View>
      <ChevronRight color="#A8A29E" size={20} />
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
    marginTop: 12,
    minHeight: 160,
    padding: 14,

    color: "#1F2937",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700",
  },

  sectionLabel: {
    marginTop: 22,
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

  categoryRail: {
    marginHorizontal: -17,
    marginTop: 6,
  },

  composerHeading: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  composerHint: {
    color: "#78716C",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },

  listeningBadge: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 10,
  },

  listeningDot: {
    backgroundColor: "#059669",
    borderRadius: 4,
    height: 8,
    width: 8,
  },

  listeningText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "800",
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
    width: 46,
    height: 46,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E7DED2",
  },

  activeActionButton: {
    backgroundColor: "#292524",
    borderColor: "#292524",
  },

  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
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

  modalBackdrop: {
    backgroundColor: "rgba(28,25,23,0.42)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },

  voiceSheet: {
    backgroundColor: "#FFFCF7",
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#D6D3D1",
    borderRadius: 2,
    height: 4,
    marginBottom: 6,
    width: 38,
  },

  sheetHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  sheetHeadingCopy: {
    flex: 1,
    paddingRight: 12,
  },

  sheetEyebrow: {
    color: "#C2410C",
    fontSize: 11,
    fontWeight: "800",
  },

  sheetTitle: {
    color: "#292524",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginTop: 3,
  },

  sheetDescription: {
    color: "#78716C",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },

  sheetCloseButton: {
    alignItems: "center",
    backgroundColor: "#F5F0E8",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  voiceOption: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#ECE4D8",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 76,
    padding: 12,
  },

  voiceOptionPressed: {
    backgroundColor: "#FFF7ED",
    opacity: 0.76,
  },

  voiceOptionIcon: {
    alignItems: "center",
    backgroundColor: "#FFF2E3",
    borderRadius: 13,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  voiceOptionCopy: {
    flex: 1,
    marginHorizontal: 12,
  },

  voiceOptionTitle: {
    color: "#292524",
    fontSize: 16,
    fontWeight: "800",
  },

  voiceOptionDescription: {
    color: "#78716C",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  recordingPanel: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },

  recordingIcon: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    marginBottom: 12,
    width: 64,
  },

  recordingTimer: {
    color: "#C2410C",
    fontSize: 34,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    marginTop: 10,
  },

  stopRecordingButton: {
    alignItems: "center",
    backgroundColor: "#292524",
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 50,
    paddingHorizontal: 22,
  },

  stopRecordingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
