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
  type LayoutChangeEvent,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDispatch, useSelector } from "react-redux";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleStop,
  FileAudio,
  Image as ImageIcon,
  Languages,
  MapPin,
  Mic,
  Play,
  Radio,
  Send,
  Upload,
  Video,
  X,
} from "lucide-react-native";

import {
  createExperienceRequest,
  fetchExperienceCategoriesRequest,
} from "@/store/experiences/actions";

import {
  selectCreateExperienceLoading,
  selectExperienceCategories,
} from "@/store/experiences/selectors";
import { CategoryChips } from "@/components/experiences";
type MediaType =
  | "image"
  | "video"
  | "audio";

type SelectedMedia = {
  uri: string;
  type: MediaType;
  name?: string;
  mimeType?: string;
};

const COMPOSER_ACCESSORY_ID = "experience-post-composer-accessory";

const formatRecordingDuration = (durationMillis: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default function PremiumPostScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

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
  const composerScrollRef = useRef<ScrollView>(null);
  const inputOffsetRef = useRef(0);

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
    const resultSubscription = ExpoSpeechRecognitionModule.addListener(
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
    const errorSubscription = ExpoSpeechRecognitionModule.addListener(
      "error",
      (event: { message?: string }) => {
        setIsDictating(false);
        Alert.alert(
          "Voice typing unavailable",
          event.message || "Please try again or type your experience."
        );
      }
    );
    const endSubscription = ExpoSpeechRecognitionModule.addListener(
      "end",
      () => setIsDictating(false)
    );

    return () => {
      resultSubscription.remove();
      errorSubscription.remove();
      endSubscription.remove();
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
        mimeType: asset.mimeType,
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
        mimeType: asset.mimeType,
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
        mimeType: asset.mimeType || undefined,
      });
    }
  };

  // ───────────────── VOICE INPUT ─────────────────

  const startEnglishDictation = async () => {
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

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
      ExpoSpeechRecognitionModule.start({
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
          mimeType: "audio/mp4",
          name: `voice-experience-${Date.now()}.m4a`,
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

  const revealComposerInput = useCallback(() => {
    setIsComposerFocused(true);

    setTimeout(() => {
      composerScrollRef.current?.scrollTo({
        animated: true,
        y: Math.max(0, inputOffsetRef.current - 14),
      });
    }, Platform.OS === "ios" ? 180 : 120);
  }, []);

  const captureInputOffset = (event: LayoutChangeEvent) => {
    inputOffsetRef.current = event.nativeEvent.layout.y;
  };

  useEffect(() => {
    const eventName =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const subscription = Keyboard.addListener(eventName, () => {
      if (isComposerFocused) {
        revealComposerInput();
      }
    });

    return () => subscription.remove();
  }, [isComposerFocused, revealComposerInput]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/experiences" as never);
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
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable
          accessibilityLabel="Back to experiences"
          accessibilityRole="button"
          hitSlop={6}
          onPress={handleBack}
          style={({ pressed }) => [
            styles.headerIconButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <ArrowLeft color="#292524" size={24} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Create</Text>
          <Text style={styles.headerSubtitle}>New experience</Text>
        </View>

        <Pressable
          accessibilityLabel="Publish experience"
          accessibilityRole="button"
          disabled={isDisabled || creating}
          onPress={handlePost}
          style={({ pressed }) => [
            styles.publishButton,
            (isDisabled || creating) && styles.disabledButton,
            pressed && !isDisabled && styles.headerButtonPressed,
          ]}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Send color="#FFFFFF" size={17} strokeWidth={2.3} />
              <Text style={styles.publishText}>Publish</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* ───────────────── BODY ───────────────── */}

      <ScrollView
        ref={composerScrollRef}
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
        <View style={styles.composerSurface}>
          <View style={styles.categorySection}>
            <View style={styles.categoryHeading}>
              <View style={styles.categoryMetaRow}>
                <Text style={styles.categoryTitle}>Choose category</Text>
                {isLocating ? (
                  <View style={styles.locationPill}>
                    <ActivityIndicator color="#A34A0A" size="small" />
                    <Text numberOfLines={1} style={styles.locationText}>
                      Finding location
                    </Text>
                  </View>
                ) : location ? (
                  <View style={styles.locationPill}>
                    <MapPin color="#A34A0A" size={13} strokeWidth={2.2} />
                    <Text numberOfLines={1} style={styles.locationText}>
                      {location}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.categoryHint}>Helps devotees discover your post</Text>
            </View>
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
          </View>

          <View style={styles.composerHeading}>
            <View>
              <Text style={styles.sectionLabel}>Share your experience</Text>
              <Text style={styles.composerHint}>
                Write from the heart. You can also use voice.
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
            onFocus={revealComposerInput}
            onLayout={captureInputOffset}
            onSubmitEditing={dismissKeyboard}
            returnKeyType="done"
            textAlignVertical="top"
            placeholder="What would you like to share with the Sai Family?"
            placeholderTextColor="#b78c56"
            style={[styles.input, isComposerFocused && styles.inputFocused]}
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

          
        </View>
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

      {!isComposerFocused ? (
        <View
          style={[
            styles.toolbar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
        <View style={styles.actions}>
          <ActionButton
            label="Photo"
            icon={
              <ImageIcon
                size={20}
                color="#292524"
              />
            }
            onPress={pickImage}
          />

          <ActionButton
            label="Video"
            icon={
              <Video
                size={20}
                color="#292524"
              />
            }
            onPress={pickVideo}
          />

          <ActionButton
            active={isDictating || audioRecorderState.isRecording}
            label="Voice"
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
        </View>
      ) : null}

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
      accessibilityLabel={`${label} attachment`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        active && styles.activeActionButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      {icon}
      <Text style={[styles.actionLabel, active && styles.activeActionLabel]}>
        {label}
      </Text>
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
    backgroundColor: "#FFFCF8",
    flex: 1,
  },

  header: {
    alignItems: "center",
    backgroundColor: "#FFFCF8",
    borderBottomColor: "#EDE7DE",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 64,
    paddingBottom: 10,
    paddingHorizontal: 14,
  },

  headerTitle: {
    color: "#292524",
    fontSize: 17,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },

  headerCopy: {
    flex: 1,
    marginLeft: 10,
  },

  headerIconButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  headerButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  publishButton: {
    alignItems: "center",
    backgroundColor: "#292524",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 104,
    paddingHorizontal: 14,
  },

  publishText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  body: {
    flex: 1,
  },

  bodyContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  composerSurface: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    minHeight: 460,
    paddingBottom: 20,
    paddingHorizontal: 18,
  },

  input: {
    backgroundColor: "#FAF8F4",
    borderColor: "#E9E2D8",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 190,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#292524",
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "500",
  },

  inputFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C2410C",
    shadowColor: "#9A3412",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  sectionLabel: {
    color: "#292524",
    fontSize: 16,
    fontWeight: "800",
  },

  categorySection: {
    borderBottomColor: "#ECE7DF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
    marginHorizontal: -18,
    paddingTop: 16,
  },

  categoryHeading: {
    paddingHorizontal: 18,
  },

  categoryMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    minHeight: 34,
  },

  categoryTitle: {
    color: "#292524",
    fontSize: 15,
    fontWeight: "800",
    // borderWidth: 1,
  },

  categoryHint: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  categoryRail: {
    marginTop: 5,
    paddingBottom: 4,
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
    borderColor: "#EEE8DF",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
    overflow: "hidden",
  },

  media: {
    width: "100%",
    aspectRatio: 4 / 3,
    height: undefined,
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
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 999,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "flex-end",
    maxWidth: "62%",
    minHeight: 32,
    paddingHorizontal: 9,
  },

  locationText: {
    color: "#9A3412",
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "700",
  },

  toolbar: {
    alignItems: "center",
    backgroundColor: "#FFFCF8",
    borderTopColor: "#EDE7DE",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  actions: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },

  androidDoneBar: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255,252,247,0.96)",
    borderTopColor: "#E7D7BE",
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  actionButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7DED2",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 48,
    justifyContent: "center",
  },

  activeActionButton: {
    backgroundColor: "#292524",
    borderColor: "#292524",
  },

  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },

  actionLabel: {
    color: "#44403C",
    fontSize: 13,
    fontWeight: "800",
  },

  activeActionLabel: {
    color: "#FFFFFF",
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
