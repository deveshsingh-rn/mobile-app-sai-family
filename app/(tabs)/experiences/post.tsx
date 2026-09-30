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
  CheckCircle2,
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
  selectExperiencesError,
} from "@/store/experiences/selectors";
import { CategoryChips } from "@/components/experiences";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";
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

const formatRecordingDuration = (durationMillis: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const MAX_EXPERIENCE_LENGTH = 2000;

export default function PremiumPostScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const creating = useSelector(
    selectCreateExperienceLoading
  );
  const createError = useSelector(selectExperiencesError);

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
  const [submitted, setSubmitted] = useState(false);
  const contentBeforeDictationRef = useRef("");
  const composerScrollRef = useRef<ScrollView>(null);
  const inputOffsetRef = useRef(0);
  const wasCreatingRef = useRef(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioRecorderState = useAudioRecorderState(audioRecorder, 250);

  const isDisabled = useMemo(() => {
    const hasContent = Boolean(content.trim());
    const audioNeedsDescription =
      selectedMedia?.type === "audio" && !hasContent;

    return (
      (!hasContent && !selectedMedia) ||
      !selectedCategory ||
      audioNeedsDescription
    );
  }, [content, selectedMedia, selectedCategory]);

  const profileImageUrl =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;
  const profileInitial = account?.name?.trim().charAt(0).toUpperCase() || "S";

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
      Alert.alert(
        "Photo access required",
        "Allow photo access in Settings to add an image to your experience."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes:
            ImagePicker
              .MediaTypeOptions.Images,

          quality: 0.86,
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
      Alert.alert(
        "Video access required",
        "Allow photo library access in Settings to add a video to your experience."
      );
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
    if (selectedMedia?.type === "audio" && !content.trim()) {
      Alert.alert(
        "Add a description",
        "Please write a short description before publishing an audio experience."
      );
      return;
    }

    const userId =
      account?.id ||
      account?.authorId;

    setSubmitted(true);
    dispatch(
      createExperienceRequest({
        content: content.trim(),
        category: selectedCategory,
        location,
        media: selectedMedia,
        userId,
      })
    );
  };

  useEffect(() => {
    if (!submitted) {
      wasCreatingRef.current = creating;
      return;
    }

    if (creating) {
      wasCreatingRef.current = true;
      return;
    }

    if (!wasCreatingRef.current) {
      return;
    }

    wasCreatingRef.current = false;

    if (createError) {
      setSubmitted(false);
      Alert.alert(
        "Could not publish",
        createError || "Your experience was not published. Please try again."
      );
      return;
    }

    setContent("");
    setLocation("");
    setSelectedMedia(null);
    setSubmitted(false);
    router.replace("/(tabs)/experiences" as never);
  }, [createError, creating, submitted]);

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

  const leaveComposer = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/experiences" as never);
  };

  const handleBack = () => {
    if (creating) {
      return;
    }

    if (!content.trim() && !selectedMedia) {
      leaveComposer();
      return;
    }

    Alert.alert(
      "Discard this experience?",
      "Your writing and attachment will be removed.",
      [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: leaveComposer },
      ]
    );
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
          disabled={creating}
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
          <Text style={styles.headerTitle}>Share Experience</Text>
          <Text style={styles.headerSubtitle}>With Sai Family</Text>
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
              <Text style={styles.publishText}>Post</Text>
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
          <View style={styles.authorRow}>
            {profileImageUrl ? (
              <Image
                accessibilityLabel={`${account?.name || "Sai Devotee"} profile photo`}
                source={{ uri: profileImageUrl }}
                style={styles.authorAvatar}
              />
            ) : (
              <View style={[styles.authorAvatar, styles.authorAvatarFallback]}>
                <Text style={styles.authorAvatarInitial}>{profileInitial}</Text>
              </View>
            )}

            <View style={styles.authorCopy}>
              <Text numberOfLines={1} style={styles.authorName}>
                {account?.name || "Sai Devotee"}
              </Text>
              <View style={styles.audienceRow}>
                <CheckCircle2 color="#A34A0A" size={14} strokeWidth={2.2} />
                <Text style={styles.audienceText}>Sharing with Sai Family</Text>
              </View>
            </View>
          </View>

          <View style={styles.categorySection}>
            <View style={styles.categoryHeading}>
              <View style={styles.categoryMetaRow}>
                <Text style={styles.categoryTitle}>Experience category</Text>
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
              <Text style={styles.categoryHint}>Choose the closest match</Text>
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

          <View style={styles.composerCard}>
            <View style={styles.composerHeading}>
              <View style={styles.composerHeadingCopy}>
                <Text style={styles.sectionLabel}>Your Sai experience</Text>
                <Text style={styles.composerHint}>
                  Share the moment in your own words
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
              accessibilityLabel="Write your Sai experience"
              maxLength={MAX_EXPERIENCE_LENGTH}
              multiline
              onBlur={() => setIsComposerFocused(false)}
              onChangeText={setContent}
              onFocus={revealComposerInput}
              onLayout={captureInputOffset}
              onSubmitEditing={dismissKeyboard}
              placeholder="What happened? How did Sai guide or bless you?"
              placeholderTextColor="#9A8979"
              returnKeyType="done"
              style={[styles.input, isComposerFocused && styles.inputFocused]}
              submitBehavior="blurAndSubmit"
              textAlignVertical="top"
              value={content}
            />

            <View style={styles.composerFooter}>
              {content.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear written experience"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setContent("")}
                  style={({ pressed }) => [
                    styles.clearTextButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.clearTextLabel}>Clear</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Text style={styles.characterCount}>
                {content.length}/{MAX_EXPERIENCE_LENGTH}
              </Text>
            </View>

            {/* ───────────────── MEDIA PREVIEW ───────────────── */}

            {selectedMedia ? (
              <View style={styles.mediaContainer}>
                <Pressable
                  accessibilityLabel="Remove attachment"
                  accessibilityRole="button"
                  onPress={() => setSelectedMedia(null)}
                  style={styles.closeButton}
                >
                  <X size={18} color="#fff" strokeWidth={2.5} />
                </Pressable>

                {selectedMedia.type === "image" ? (
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    style={styles.media}
                  />
                ) : null}

                {selectedMedia.type === "video" ? (
                  <View style={styles.videoPreview}>
                    <Video color="#7C2D12" size={38} strokeWidth={1.8} />
                    <Text style={styles.videoPreviewTitle}>Video ready to share</Text>
                    <Text numberOfLines={1} style={styles.videoPreviewName}>
                      {selectedMedia.name || "Selected video"}
                    </Text>

                    <View style={styles.playButton}>
                      <Play
                        size={20}
                        color="#fff"
                        fill="#fff"
                      />
                    </View>
                  </View>
                ) : null}

                {selectedMedia.type === "audio" ? (
                  <View style={styles.audioSelection}>
                    <View style={styles.audioCard}>
                      <View style={styles.audioIconBubble}>
                        <FileAudio size={24} color="#9A3412" />
                      </View>

                      <View style={styles.audioInfo}>
                        <Text style={styles.audioTitle}>Audio ready to share</Text>

                        <Text numberOfLines={1} style={styles.audioName}>
                          {selectedMedia.name || "Recorded experience"}
                        </Text>
                      </View>
                    </View>
                    {!content.trim() ? (
                      <Text style={styles.audioRequirement}>
                        Add a short description above to publish this audio.
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* ───────────────── TOOLBAR ───────────────── */}

      <View
        style={[
          styles.toolbar,
          {
            paddingBottom: isComposerFocused
              ? 10
              : Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.actions}>
          <ActionButton
            active={selectedMedia?.type === "image"}
            label="Photo"
            icon={
              <ImageIcon
                size={20}
                color={selectedMedia?.type === "image" ? "#FFFFFF" : "#7C2D12"}
              />
            }
            onPress={pickImage}
          />

          <ActionButton
            active={selectedMedia?.type === "video"}
            label="Video"
            icon={
              <Video
                size={20}
                color={selectedMedia?.type === "video" ? "#FFFFFF" : "#7C2D12"}
              />
            }
            onPress={pickVideo}
          />

          <ActionButton
            active={
              selectedMedia?.type === "audio" ||
              isDictating ||
              audioRecorderState.isRecording
            }
            label="Audio"
            icon={
              <Mic
                size={20}
                color={
                  selectedMedia?.type === "audio" ||
                  isDictating ||
                  audioRecorderState.isRecording
                    ? "#FFFFFF"
                    : "#292524"
                }
              />
            }
            onPress={() => setVoiceMenuVisible(true)}
          />
        </View>
      </View>

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
    backgroundColor: EXPERIENCE_THEME.background,
    flex: 1,
  },

  header: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.background,
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 64,
    paddingBottom: 10,
    paddingHorizontal: 14,
  },

  headerTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },

  headerSubtitle: {
    color: EXPERIENCE_THEME.paragraph,
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
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 88,
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
    paddingBottom: 28,
  },

  composerSurface: {
    backgroundColor: EXPERIENCE_THEME.background,
    flex: 1,
    minHeight: 460,
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 58,
  },

  authorAvatar: {
    borderColor: "#E9C998",
    borderRadius: 25,
    borderWidth: 1,
    height: 50,
    width: 50,
  },

  authorAvatarFallback: {
    alignItems: "center",
    backgroundColor: "#F8E6CB",
    justifyContent: "center",
  },

  authorAvatarInitial: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 19,
    fontWeight: "900",
  },

  authorCopy: {
    flex: 1,
    marginLeft: 12,
  },

  authorName: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 17,
    fontWeight: "900",
  },

  audienceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 4,
  },

  audienceText: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "600",
  },

  composerCard: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    shadowColor: "#7C2D12",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  input: {
    backgroundColor: "#FFFCF7",
    borderColor: "#EAD5B7",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 176,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 17,
    lineHeight: 27,
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

  composerFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 34,
    paddingHorizontal: 3,
    paddingTop: 6,
  },

  clearTextButton: {
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 4,
  },

  clearTextLabel: {
    color: "#A33A16",
    fontSize: 13,
    fontWeight: "800",
  },

  characterCount: {
    color: "#8C7A6C",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },

  sectionLabel: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "800",
  },

  categorySection: {
    borderBottomColor: EXPERIENCE_THEME.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
    marginHorizontal: -18,
    marginTop: 12,
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
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "800",
    // borderWidth: 1,
  },

  categoryHint: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  categoryRail: {
    marginTop: 4,
    paddingBottom: 8,
  },

  composerHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  composerHeadingCopy: {
    flex: 1,
    paddingRight: 10,
  },

  composerHint: {
    color: EXPERIENCE_THEME.paragraph,
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
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    overflow: "hidden",
  },

  media: {
    width: "100%",
    aspectRatio: 16 / 10,
    height: undefined,
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,

    width: 36,
    height: 36,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(0,0,0,0.6)",
  },

  playButton: {
    position: "absolute",
    bottom: 14,
    right: 14,

    width: 44,
    height: 44,
    borderRadius: 22,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(0,0,0,0.55)",
  },

  videoPreview: {
    alignItems: "center",
    aspectRatio: 16 / 8,
    backgroundColor: "#FFF4E8",
    justifyContent: "center",
    paddingHorizontal: 54,
  },

  videoPreviewTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
  },

  videoPreviewName: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    marginTop: 4,
    maxWidth: "100%",
  },

  audioCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFF7ED",
  },

  audioIconBubble: {
    alignItems: "center",
    backgroundColor: "#FCE4C6",
    borderRadius: 13,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  audioSelection: {
    backgroundColor: "#FFF7ED",
  },

  audioInfo: {
    marginLeft: 14,
    flex: 1,
  },

  audioTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "900",
  },

  audioName: {
    marginTop: 4,
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 14,
  },

  audioRequirement: {
    borderTopColor: EXPERIENCE_THEME.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    color: "#B42318",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    paddingBottom: 11,
    paddingHorizontal: 14,
    paddingTop: 9,
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
    backgroundColor: "#FFFDF9",
    borderTopColor: EXPERIENCE_THEME.border,
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

  actionButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 48,
    justifyContent: "center",
  },

  activeActionButton: {
    backgroundColor: EXPERIENCE_THEME.heading,
    borderColor: EXPERIENCE_THEME.heading,
  },

  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },

  actionLabel: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    fontWeight: "800",
  },

  activeActionLabel: {
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.5,
  },

  modalBackdrop: {
    backgroundColor: "rgba(28,25,23,0.42)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },

  voiceSheet: {
    backgroundColor: EXPERIENCE_THEME.background,
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
    color: EXPERIENCE_THEME.heading,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginTop: 3,
  },

  sheetDescription: {
    color: EXPERIENCE_THEME.paragraph,
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
    borderColor: EXPERIENCE_THEME.border,
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
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "800",
  },

  voiceOptionDescription: {
    color: EXPERIENCE_THEME.paragraph,
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
