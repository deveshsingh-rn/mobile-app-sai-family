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
  Animated,
  Easing,
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
} from "react-native";

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDispatch, useSelector } from "react-redux";

import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
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
  CircleStop,
  Image as ImageIcon,
  MapPin,
  Mic,
  Music2,
  Play,
  RotateCw,
  Send,
  Video,
  X,
} from "lucide-react-native";

import { createExperienceRequest } from "@/store/experiences/actions";

import { selectCreateExperienceLoading } from "@/store/experiences/selectors";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

const ACCENT = "#C2410C";
const ACCENT_DEEP = "#9A3412";
const ACCENT_SOFT = "#FFF2E3";
const SAFFRON_GRADIENT = ["#F97316", "#C2410C"] as const;
// Category picking is hidden on this screen; every post goes to this category.
const DEFAULT_CATEGORY = "miracles";

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

export default function PremiumPostScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

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

  const [isComposerFocused, setIsComposerFocused] =
    useState(false);

  const [isLocating, setIsLocating] = useState(true);
  const [isDictating, setIsDictating] = useState(false);
  const contentBeforeDictationRef = useRef("");
  const composerScrollRef = useRef<ScrollView>(null);
  const inputOffsetRef = useRef(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioRecorderState = useAudioRecorderState(audioRecorder, 250);

  const profileImageUrl =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;
  const profileInitial = account?.name?.trim().charAt(0).toUpperCase() || "S";

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content]
  );

  const isDisabled = useMemo(() => {
    return !content.trim();
  }, [content]);

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

  const stopDictation = () => {
    ExpoSpeechRecognitionModule.stop();
    setIsDictating(false);
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
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert(
        "Could not save recording",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const toggleAudioRecording = () => {
    if (audioRecorderState.isRecording) {
      void stopAudioRecording();
      return;
    }

    if (isDictating) {
      stopDictation();
    }

    void startAudioRecording();
  };

  // ───────────────── POST ─────────────────

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert(
        "Write your experience",
        "Please add some text before publishing your experience."
      );
      return;
    }

    const userId =
      account?.id ||
      account?.authorId;

    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );

    dispatch(
      createExperienceRequest({
        content,
        category: DEFAULT_CATEGORY,
        location,
        media: selectedMedia,
        userId,
      })
    );

    setContent("");
    setLocation("");
    setSelectedMedia(null);
    router.replace("/(tabs)/experiences" as never);
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

  const publishDisabled = isDisabled || creating;
  const isRecording = audioRecorderState.isRecording;

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
      {/* ───────────────── HEADER ───────────────── */}

      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable
          accessibilityLabel="Back to experiences"
          accessibilityRole="button"
          hitSlop={6}
          onPress={handleBack}
          style={({ pressed }) => [
            styles.headerIconButton,
            pressed && styles.pressed,
          ]}
        >
          <ArrowLeft color={EXPERIENCE_THEME.heading} size={22} strokeWidth={2.3} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>New Experience</Text>
          <Text style={styles.headerSubtitle}>Share with Sai Family</Text>
        </View>

        <Pressable
          accessibilityLabel="Publish experience"
          accessibilityRole="button"
          accessibilityState={{ disabled: publishDisabled }}
          disabled={publishDisabled}
          onPress={handlePost}
          style={({ pressed }) => [
            styles.publishButtonWrap,
            publishDisabled && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <LinearGradient
            colors={
              publishDisabled
                ? ["#D6C4AE", "#C9B59C"]
                : SAFFRON_GRADIENT
            }
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.publishButton}
          >
            {creating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.publishText}>Publish</Text>
                <Send color="#FFFFFF" size={15} strokeWidth={2.5} />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      {/* ───────────────── BODY ───────────────── */}

      <ScrollView
        ref={composerScrollRef}
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          // The custom tab bar floats over the screen, so keep content clear of it.
          { paddingBottom: 76 + Math.max(insets.bottom, 8) + 24 },
        ]}
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
        {/* Author + location */}
        <View style={styles.authorRow}>
          {profileImageUrl ? (
            <Image
              accessibilityLabel={`${account?.name || "Devotee"} profile photo`}
              source={{ uri: profileImageUrl }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={SAFFRON_GRADIENT}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarInitial}>{profileInitial}</Text>
            </LinearGradient>
          )}

          <View style={styles.authorCopy}>
            <Text numberOfLines={1} style={styles.authorName}>
              {account?.name || "Sai Devotee"}
            </Text>

            {isLocating ? (
              <View style={styles.locationRow}>
                <ActivityIndicator color={ACCENT} size="small" style={styles.locationSpinner} />
                <Text numberOfLines={1} style={styles.locationMuted}>
                  Finding your location…
                </Text>
              </View>
            ) : location ? (
              <View style={styles.locationRow}>
                <MapPin color={ACCENT} size={13} strokeWidth={2.4} />
                <Text numberOfLines={1} style={styles.locationText}>
                  {location}
                </Text>
                <Pressable
                  accessibilityLabel="Remove location"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setLocation("")}
                  style={styles.locationClear}
                >
                  <X color={EXPERIENCE_THEME.paragraph} size={12} strokeWidth={2.6} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityLabel="Add current location"
                accessibilityRole="button"
                hitSlop={6}
                onPress={() => void attachCurrentLocation()}
                style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]}
              >
                <MapPin color={EXPERIENCE_THEME.paragraph} size={13} strokeWidth={2.2} />
                <Text style={styles.locationAdd}>Add location</Text>
                <RotateCw color={EXPERIENCE_THEME.paragraph} size={11} strokeWidth={2.4} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Composer */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Your Experience</Text>
          <Text style={styles.sectionHint}>Write Something to Publish Your Experience</Text>
        </View>

        <View
          onLayout={captureInputOffset}
          style={[styles.composerCard, isComposerFocused && styles.composerCardFocused]}
        >
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            onBlur={() =>
              setIsComposerFocused(false)
            }
            onFocus={revealComposerInput}
            onSubmitEditing={dismissKeyboard}
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            textAlignVertical="top"
            placeholder="What would you like to share with the Sai Family?"
            placeholderTextColor="#B8A48C"
            selectionColor={ACCENT}
            style={styles.input}
          />

          <View style={styles.composerFooter}>
            {isDictating ? (
              <Pressable
                accessibilityLabel="Stop voice typing"
                accessibilityRole="button"
                onPress={stopDictation}
                style={({ pressed }) => [styles.listeningBadge, pressed && styles.pressed]}
              >
                <PulseDot />
                <Text style={styles.listeningText}>Listening… tap to stop</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityLabel="Type with your voice"
                accessibilityRole="button"
                onPress={startEnglishDictation}
                style={({ pressed }) => [styles.dictateButton, pressed && styles.pressed]}
              >
                <Mic color={ACCENT_DEEP} size={15} strokeWidth={2.4} />
                <Text style={styles.dictateText}>Speak</Text>
              </Pressable>
            )}

            <Text style={styles.wordCount}>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </Text>
          </View>
        </View>

        {/* ───────────────── ATTACHMENTS ───────────────── */}

        <View style={styles.attachSection}>
          <Text style={styles.toolbarLabel}>Add to your post</Text>
          <View style={styles.actions}>
            <ActionButton
              label="Photo"
              icon={<ImageIcon size={18} color="#15803D" strokeWidth={2.3} />}
              iconBackground="#DCFCE7"
              onPress={pickImage}
            />

            <ActionButton
              label="Video"
              icon={<Video size={18} color="#1D4ED8" strokeWidth={2.3} />}
              iconBackground="#DBEAFE"
              onPress={pickVideo}
            />

            <ActionButton
              active={isRecording}
              label={isRecording ? "Stop" : "Voice"}
              icon={
                isRecording ? (
                  <CircleStop size={18} color="#FFFFFF" strokeWidth={2.3} />
                ) : (
                  <Mic size={18} color={ACCENT_DEEP} strokeWidth={2.3} />
                )
              }
              iconBackground={ACCENT_SOFT}
              onPress={toggleAudioRecording}
            />
          </View>

          {isRecording ? (
            <View style={styles.recordingBar}>
              <PulseDot color="#DC2626" />
              <Text style={styles.recordingLabel}>Recording</Text>
              <Text style={styles.recordingTimer}>
                {formatRecordingDuration(audioRecorderState.durationMillis)}
              </Text>
              <Pressable
                accessibilityLabel="Stop and save audio recording"
                accessibilityRole="button"
                onPress={() => void stopAudioRecording()}
                style={({ pressed }) => [
                  styles.stopRecordingButton,
                  pressed && styles.pressed,
                ]}
              >
                <CircleStop color="#FFFFFF" size={15} strokeWidth={2.5} />
                <Text style={styles.stopRecordingText}>Stop & save</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* ───────────────── MEDIA PREVIEW ───────────────── */}

        {selectedMedia && (
          <View style={styles.mediaContainer}>
            {selectedMedia.type === "image" && (
              <Image
                source={{ uri: selectedMedia.uri }}
                style={styles.media}
              />
            )}

            {selectedMedia.type === "video" && (
              <View style={styles.videoFrame}>
                <Image
                  source={{ uri: selectedMedia.uri }}
                  style={styles.media}
                />
                <View style={styles.playButton}>
                  <Play size={24} color="#fff" fill="#fff" />
                </View>
              </View>
            )}

            {selectedMedia.type === "audio" && (
              <View>
                <View style={styles.audioCard}>
                  <LinearGradient
                    colors={SAFFRON_GRADIENT}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={styles.audioIcon}
                  >
                    <Music2 color="#FFFFFF" size={22} strokeWidth={2.3} />
                  </LinearGradient>

                  <View style={styles.audioInfo}>
                    <Text style={styles.audioTitle}>Audio attached</Text>
                    <Text numberOfLines={1} style={styles.audioName}>
                      {selectedMedia.name}
                    </Text>
                  </View>
                </View>
                {!content.trim() ? (
                  <View style={styles.audioRequirement}>
                    <Text style={styles.audioRequirementText}>
                      Add a short description above to publish this audio.
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            {selectedMedia.type !== "audio" ? (
              <View style={styles.mediaBadge}>
                {selectedMedia.type === "image" ? (
                  <ImageIcon color="#FFFFFF" size={12} strokeWidth={2.4} />
                ) : (
                  <Video color="#FFFFFF" size={12} strokeWidth={2.4} />
                )}
                <Text style={styles.mediaBadgeText}>
                  {selectedMedia.type === "image" ? "Photo" : "Video"}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityLabel="Remove attachment"
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => setSelectedMedia(null)}
              style={({ pressed }) => [
                styles.closeButton,
                selectedMedia.type === "audio" && styles.closeButtonLight,
                pressed && styles.pressed,
              ]}
            >
              <X
                size={16}
                color={selectedMedia.type === "audio" ? EXPERIENCE_THEME.paragraph : "#fff"}
                strokeWidth={2.6}
              />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ───────────────── ANIMATED INDICATORS ─────────────────

function useLoopingValue(duration: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(value, {
        duration,
        easing: Easing.out(Easing.ease),
        toValue: 1,
        useNativeDriver: true,
      })
    );
    loop.start();

    return () => loop.stop();
  }, [duration, value]);

  return value;
}

function PulseDot({ color = "#059669" }: { color?: string }) {
  const progress = useLoopingValue(1200);

  return (
    <View style={styles.pulseDotWrap}>
      <Animated.View
        style={[
          styles.pulseDotHalo,
          {
            backgroundColor: color,
            opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
            transform: [
              { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) },
            ],
          },
        ]}
      />
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
    </View>
  );
}

// ───────────────── ACTION BUTTON ─────────────────

function ActionButton({
  active = false,
  icon,
  iconBackground,
  label,
  onPress,
}: {
  active?: boolean;
  icon: React.ReactNode;
  iconBackground: string;
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
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: active ? "rgba(255,255,255,0.18)" : iconBackground },
        ]}
      >
        {icon}
      </View>
      <Text style={[styles.actionLabel, active && styles.activeActionLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ───────────────── STYLES ─────────────────

const cardShadow = {
  elevation: 2,
  shadowColor: "#7C2D12",
  shadowOffset: { height: 4, width: 0 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: EXPERIENCE_THEME.background,
    flex: 1,
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },

  // Header

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

  headerIconButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  headerSubtitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
    opacity: 0.8,
  },

  publishButtonWrap: {
    borderRadius: 999,
    shadowColor: ACCENT,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },

  publishButton: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 108,
    paddingHorizontal: 18,
  },

  publishText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  disabledButton: {
    elevation: 0,
    shadowOpacity: 0,
  },

  // Body

  body: {
    flex: 1,
  },

  bodyContent: {
    flexGrow: 1,
  },

  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  avatar: {
    alignItems: "center",
    borderColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    width: 48,
  },

  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  authorCopy: {
    flex: 1,
    marginLeft: 12,
  },

  authorName: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 16,
    fontWeight: "800",
  },

  locationRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
    maxWidth: "100%",
    minHeight: 26,
    paddingHorizontal: 9,
  },

  locationSpinner: {
    transform: [{ scale: 0.7 }],
  },

  locationText: {
    color: ACCENT_DEEP,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "700",
  },

  locationMuted: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "600",
  },

  locationAdd: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 12,
    fontWeight: "700",
  },

  locationClear: {
    alignItems: "center",
    backgroundColor: "#F5EBDD",
    borderRadius: 8,
    height: 16,
    justifyContent: "center",
    marginLeft: 2,
    width: 16,
  },

  sectionHeader: {
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  sectionLabel: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15,
    fontWeight: "800",
  },

  sectionHint: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 12.5,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.8,
  },

  composerCard: {
    ...cardShadow,
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 10,
  },

  composerCardFocused: {
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.14,
  },

  input: {
    color: "#2B2420",
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
    minHeight: 240,
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 14,
  },

  composerFooter: {
    alignItems: "center",
    borderTopColor: "#F5EBDD",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  dictateButton: {
    alignItems: "center",
    backgroundColor: ACCENT_SOFT,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 12,
  },

  dictateText: {
    color: ACCENT_DEEP,
    fontSize: 13,
    fontWeight: "800",
  },

  wordCount: {
    color: "#A8977F",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
    paddingRight: 6,
  },

  listeningBadge: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 32,
    paddingHorizontal: 12,
  },

  listeningText: {
    color: "#047857",
    fontSize: 12.5,
    fontWeight: "800",
  },

  pulseDotWrap: {
    alignItems: "center",
    height: 10,
    justifyContent: "center",
    width: 10,
  },

  pulseDotHalo: {
    backgroundColor: "#10B981",
    borderRadius: 5,
    height: 10,
    position: "absolute",
    width: 10,
  },

  pulseDot: {
    backgroundColor: "#059669",
    borderRadius: 4,
    height: 8,
    width: 8,
  },

  // Media

  mediaContainer: {
    ...cardShadow,
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 14,
    overflow: "hidden",
  },

  media: {
    aspectRatio: 4 / 3,
    backgroundColor: "#1C1917",
    height: undefined,
    width: "100%",
  },

  videoFrame: {
    backgroundColor: "#1C1917",
  },

  playButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 32,
    borderWidth: 2,
    height: 64,
    justifyContent: "center",
    left: "50%",
    marginLeft: -32,
    marginTop: -32,
    paddingLeft: 3,
    position: "absolute",
    top: "50%",
    width: 64,
  },

  mediaBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    top: 12,
  },

  mediaBadgeText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "800",
  },

  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    width: 32,
    zIndex: 10,
  },

  closeButtonLight: {
    backgroundColor: "#F5EBDD",
    top: 20,
  },

  audioCard: {
    alignItems: "center",
    backgroundColor: "#FFFBF5",
    flexDirection: "row",
    padding: 16,
    paddingRight: 56,
  },

  audioIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  audioInfo: {
    flex: 1,
    marginLeft: 14,
  },

  audioTitle: {
    color: EXPERIENCE_THEME.heading,
    fontSize: 15.5,
    fontWeight: "800",
  },

  audioName: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13,
    marginTop: 3,
  },

  audioRequirement: {
    backgroundColor: "#FEF3F2",
    borderTopColor: "#FECDCA",
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  audioRequirementText: {
    color: "#B42318",
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
  },

  // Attachments

  attachSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  toolbarLabel: {
    color: "#A8977F",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: "uppercase",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  actionButton: {
    ...cardShadow,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    height: 50,
    justifyContent: "center",
  },

  activeActionButton: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },

  actionIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30,
  },

  actionLabel: {
    color: EXPERIENCE_THEME.paragraph,
    fontSize: 13.5,
    fontWeight: "800",
  },

  activeActionLabel: {
    color: "#FFFFFF",
  },

  // Recording

  recordingBar: {
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    minHeight: 50,
    paddingLeft: 14,
    paddingRight: 6,
  },

  recordingLabel: {
    color: "#B91C1C",
    fontSize: 13.5,
    fontWeight: "800",
  },

  recordingTimer: {
    color: "#B91C1C",
    flex: 1,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },

  stopRecordingButton: {
    alignItems: "center",
    backgroundColor: EXPERIENCE_THEME.heading,
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
  },

  stopRecordingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
