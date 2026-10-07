import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  AlarmClock,
  BellRing,
  Clock3,
  MessageSquareText,
  Play,
  Square,
  Volume2,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import {
  disableMorningSaiAlarm,
  enableMorningSaiAlarm,
  fetchMorningSaiGuidance,
  loadMorningSaiAlarmSettings,
  playMorningSaiGuidanceVoice,
  saveMorningSaiAlarmPreferences,
  saveMorningSaiAlarmTime,
  stopMorningSaiGuidanceVoice,
  type MorningSaiAlarmDeliveryMode,
  type MorningSaiGuidance,
  type MorningSaiAlarmSettings,
} from "@/services/morning-sai-alarm";
import { EXPERIENCE_THEME } from "@/constants/experience-theme";

type Props = { devoteeName?: string };

const formatTime = (hour: number, minute: number) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));

const toPickerDate = (settings: MorningSaiAlarmSettings) =>
  new Date(2026, 0, 1, settings.hour, settings.minute);

export function MorningSaiAlarmCard({ devoteeName }: Props) {
  const [settings, setSettings] = useState<MorningSaiAlarmSettings | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guidance, setGuidance] = useState<MorningSaiGuidance | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [voiceState, setVoiceState] = useState<"idle" | "loading" | "playing">(
    "idle"
  );
  const name = devoteeName?.trim() || "Sai Devotee";

  useEffect(() => {
    let active = true;
    void loadMorningSaiAlarmSettings().then(async (stored) => {
      if (!active) return;
      setSettings(stored);

      try {
        const message = await fetchMorningSaiGuidance(stored.locale);
        if (active) setGuidance(message);
      } catch {
        // A reviewed local message remains visible when the device is offline.
      } finally {
        if (active) setPreviewLoading(false);
      }
    });
    return () => {
      active = false;
      stopMorningSaiGuidanceVoice();
    };
  }, []);

  const preview = useMemo(
    () => ({
      line1:
        guidance?.line1 ||
        "Begin today with patience and let your words bring peace.",
      line2:
        guidance?.line2 ||
        "Do one helpful act without expecting anything in return.",
    }),
    [guidance]
  );

  const selectDeliveryMode = async (deliveryMode: MorningSaiAlarmDeliveryMode) => {
    if (!settings || saving || settings.deliveryMode === deliveryMode) return;

    try {
      setSaving(true);
      setSettings(
        await saveMorningSaiAlarmPreferences({ deliveryMode, devoteeName: name })
      );
    } catch (error) {
      Alert.alert(
        "Morning message",
        error instanceof Error ? error.message : "Unable to save this preference."
      );
    } finally {
      setSaving(false);
    }
  };

  const testVoice = async () => {
    if (!settings || voiceState !== "idle") {
      stopMorningSaiGuidanceVoice();
      setVoiceState("idle");
      return;
    }

    try {
      setVoiceState("loading");
      const message = await playMorningSaiGuidanceVoice(settings.locale, () =>
        setVoiceState("playing")
      );
      setGuidance(message);
    } catch (error) {
      if (error instanceof Error && error.message.includes("cancelled")) return;
      Alert.alert(
        "Voice message unavailable",
        "The Text Reminder will Still Arrive. Please try the Baba Voice Again When You are Online."
      );
    } finally {
      setVoiceState("idle");
    }
  };

  const saveEnabled = async (hour: number, minute: number) => {
    try {
      setSaving(true);
      const next = await enableMorningSaiAlarm(hour, minute, name);
      setSettings(next);
    } catch (error) {
      Alert.alert(
        "Morning alarm",
        error instanceof Error ? error.message : "Unable to schedule the alarm."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleAlarm = async (enabled: boolean) => {
    if (!settings || saving) return;

    if (enabled) {
      await saveEnabled(settings.hour, settings.minute);
      return;
    }

    try {
      setSaving(true);
      setSettings(await disableMorningSaiAlarm());
    } finally {
      setSaving(false);
    }
  };

  const selectTime = async (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !date || !settings) return;

    const next = { ...settings, hour: date.getHours(), minute: date.getMinutes() };
    setSettings(next);
    if (Platform.OS === "android") {
      if (next.enabled) {
        await saveEnabled(next.hour, next.minute);
      } else {
        setSettings(await saveMorningSaiAlarmTime(next.hour, next.minute));
      }
    }
  };

  const confirmIosTime = async () => {
    if (!settings) return;
    setShowPicker(false);
    if (settings.enabled) {
      await saveEnabled(settings.hour, settings.minute);
    } else {
      setSettings(await saveMorningSaiAlarmTime(settings.hour, settings.minute));
    }
  };

  if (!settings) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator color={EXPERIENCE_THEME.heading} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <AlarmClock color={EXPERIENCE_THEME.heading} size={23} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Morning With Sai</Text>
          <Text style={styles.description}>
            Wake Up to Two Personalized Lines of Daily Guidance.
          </Text>
        </View>
        {saving ? (
          <ActivityIndicator color={EXPERIENCE_THEME.heading} size="small" />
        ) : (
          <Switch
            accessibilityLabel="Morning Sai alarm"
            onValueChange={toggleAlarm}
            trackColor={{ false: "#DED7CD", true: "#E7B778" }}
            thumbColor={settings.enabled ? EXPERIENCE_THEME.heading : "#FFFFFF"}
            value={settings.enabled}
          />
        )}
      </View>

      <View style={styles.modeSection}>
        <Text style={styles.sectionLabel}>HOW SHOULD THE MESSAGE ARRIVE?</Text>
        <View style={styles.modeRow}>
          <ModeButton
            active={settings.deliveryMode === "text"}
            icon={MessageSquareText}
            label="Text Reminder"
            onPress={() => void selectDeliveryMode("text")}
          />
          <ModeButton
            active={settings.deliveryMode === "voice"}
            icon={Volume2}
            label="Baba Voice"
            onPress={() => void selectDeliveryMode("voice")}
          />
        </View>
        <View style={styles.deliveryNote}>
          <BellRing color="#9A3412" size={16} />
          <Text style={styles.deliveryNoteText}>
            {settings.deliveryMode === "voice"
              ? "A Notification Arrives on Time. Baba's Voice Plays When the App is Active or You Open It."
              : "Your personalized Sai message Appears As a Morning Notification."}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel={`Morning alarm time ${formatTime(settings.hour, settings.minute)}`}
        accessibilityRole="button"
        onPress={() => setShowPicker((visible) => !visible)}
        style={({ pressed }) => [styles.timeRow, pressed && styles.pressed]}
      >
        <Clock3 color={EXPERIENCE_THEME.heading} size={19} />
        <Text style={styles.timeLabel}>Every Morning</Text>
        <Text style={styles.timeValue}>
          {formatTime(settings.hour, settings.minute)}
        </Text>
      </Pressable>

      {showPicker ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            mode="time"
            onChange={selectTime}
            value={toPickerDate(settings)}
          />
          {Platform.OS === "ios" ? (
            <Pressable onPress={confirmIosTime} style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.preview}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewLabel}>TODAY&apos;S MESSAGE</Text>
          {previewLoading ? (
            <ActivityIndicator color="#A34A0A" size="small" />
          ) : null}
        </View>
        <Text style={styles.previewName}>{name},</Text>
        <Text style={styles.previewText}>{preview.line1}</Text>
        <Text style={styles.previewText}>{preview.line2}</Text>

        {settings.deliveryMode === "voice" ? (
          <Pressable
            accessibilityLabel={voiceState === "idle" ? "Play Baba Voice Sample" : "Stop Baba Voice"}
            accessibilityRole="button"
            onPress={() => void testVoice()}
            style={({ pressed }) => [
              styles.voiceButton,
              pressed && styles.pressed,
            ]}
          >
            {voiceState === "loading" ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : voiceState === "playing" ? (
              <Square color="#FFFFFF" fill="#FFFFFF" size={16} />
            ) : (
              <Play color="#FFFFFF" fill="#FFFFFF" size={17} />
            )}
            <Text style={styles.voiceButtonText}>
              {voiceState === "loading"
                ? "Preparing Voice..."
                : voiceState === "playing"
                  ? "Stop Voice"
                  : "Hear Today's Message"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type ModeButtonProps = {
  active: boolean;
  icon: typeof MessageSquareText;
  label: string;
  onPress: () => void;
};

function ModeButton({ active, icon: Icon, label, onPress }: ModeButtonProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active && styles.modeButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.modeIcon, active && styles.modeIconActive]}>
        <Icon color={active ? "#FFFFFF" : "#9A3412"} size={20} />
      </View>
      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    padding: 16,
  },
  loadingCard: { alignItems: "center", minHeight: 100, justifyContent: "center" },
  headerRow: { alignItems: "center", flexDirection: "row" },
  iconBox: {
    alignItems: "center",
    backgroundColor: "#FFF1D9",
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  headerCopy: { flex: 1, marginHorizontal: 12 },
  title: { color: EXPERIENCE_THEME.heading, fontSize: 17, fontWeight: "800" },
  description: { color: EXPERIENCE_THEME.paragraph, fontSize: 13, lineHeight: 18, marginTop: 3 },
  modeSection: { marginTop: 16 },
  sectionLabel: {
    color: "#9A3412",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  modeRow: { flexDirection: "row", gap: 10, marginTop: 9 },
  modeButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: EXPERIENCE_THEME.border,
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 10,
  },
  modeButtonActive: { backgroundColor: "#FFF4E8", borderColor: "#EA9A4B" },
  modeIcon: {
    alignItems: "center",
    backgroundColor: "#FFF1D9",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  modeIconActive: { backgroundColor: "#9A3412" },
  modeLabel: { color: EXPERIENCE_THEME.paragraph, flex: 1, fontSize: 13, fontWeight: "700", marginLeft: 8 },
  modeLabelActive: { color: EXPERIENCE_THEME.heading, fontWeight: "900" },
  deliveryNote: {
    alignItems: "flex-start",
    backgroundColor: "#FFF8EF",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
    padding: 10,
  },
  deliveryNoteText: { color: "#67564A", flex: 1, fontSize: 12, lineHeight: 17 },
  timeRow: {
    alignItems: "center",
    backgroundColor: "#FFF8EF",
    borderColor: EXPERIENCE_THEME.border,
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: "row",
    marginTop: 15,
    minHeight: 50,
    paddingHorizontal: 13,
  },
  timeLabel: { color: EXPERIENCE_THEME.paragraph, flex: 1, fontSize: 14, fontWeight: "700", marginLeft: 9 },
  timeValue: { color: EXPERIENCE_THEME.heading, fontSize: 16, fontWeight: "900" },
  pressed: { opacity: 0.7 },
  pickerWrap: { marginTop: 6 },
  doneButton: { alignSelf: "flex-end", paddingHorizontal: 10, paddingVertical: 8 },
  doneText: { color: EXPERIENCE_THEME.heading, fontSize: 14, fontWeight: "800" },
  preview: { borderTopColor: EXPERIENCE_THEME.border, borderTopWidth: 1, marginTop: 14, paddingTop: 13 },
  previewHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  previewLabel: { color: "#A34A0A", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  previewName: { color: EXPERIENCE_THEME.heading, fontSize: 15, fontWeight: "900", marginTop: 10 },
  previewText: { color: EXPERIENCE_THEME.paragraph, fontSize: 14, lineHeight: 21, marginTop: 4 },
  voiceButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#9A3412",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 15,
  },
  voiceButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
