import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { AlarmClock, Clock3 } from "lucide-react-native";
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
  loadMorningSaiAlarmSettings,
  saveMorningSaiAlarmTime,
  type MorningSaiAlarmSettings,
} from "@/services/morning-sai-alarm";

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
  const name = devoteeName?.trim() || "Sai Devotee";

  useEffect(() => {
    let active = true;
    void loadMorningSaiAlarmSettings().then((stored) => {
      if (active) setSettings(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const preview = useMemo(
    () => `${name}, begin today with patience and let your words bring peace.`,
    [name]
  );

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
        <ActivityIndicator color="#557568" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <AlarmClock color="#557568" size={23} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Morning with Sai</Text>
          <Text style={styles.description}>
            Wake up to two personalized lines of daily guidance.
          </Text>
        </View>
        {saving ? (
          <ActivityIndicator color="#557568" size="small" />
        ) : (
          <Switch
            accessibilityLabel="Morning Sai alarm"
            onValueChange={toggleAlarm}
            trackColor={{ false: "#D6DAD7", true: "#AFC8BC" }}
            thumbColor={settings.enabled ? "#557568" : "#FFFFFF"}
            value={settings.enabled}
          />
        )}
      </View>

      <Pressable
        accessibilityLabel={`Morning alarm time ${formatTime(settings.hour, settings.minute)}`}
        accessibilityRole="button"
        onPress={() => setShowPicker((visible) => !visible)}
        style={({ pressed }) => [styles.timeRow, pressed && styles.pressed]}
      >
        <Clock3 color="#557568" size={19} />
        <Text style={styles.timeLabel}>Every morning</Text>
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
        <Text style={styles.previewLabel}>MESSAGE PREVIEW</Text>
        <Text style={styles.previewText}>{preview}</Text>
        <Text style={styles.previewText}>Do one helpful act without expecting a return.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4DF",
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
    backgroundColor: "#EEF5F1",
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  headerCopy: { flex: 1, marginHorizontal: 12 },
  title: { color: "#1F2924", fontSize: 16, fontWeight: "800" },
  description: { color: "#6F7772", fontSize: 12, lineHeight: 17, marginTop: 3 },
  timeRow: {
    alignItems: "center",
    backgroundColor: "#F6F8F7",
    borderRadius: 13,
    flexDirection: "row",
    marginTop: 15,
    minHeight: 50,
    paddingHorizontal: 13,
  },
  timeLabel: { color: "#525B56", flex: 1, fontSize: 13, fontWeight: "700", marginLeft: 9 },
  timeValue: { color: "#3E5F52", fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.7 },
  pickerWrap: { marginTop: 6 },
  doneButton: { alignSelf: "flex-end", paddingHorizontal: 10, paddingVertical: 8 },
  doneText: { color: "#47685B", fontSize: 14, fontWeight: "800" },
  preview: { borderTopColor: "#E8ECE9", borderTopWidth: 1, marginTop: 14, paddingTop: 13 },
  previewLabel: { color: "#7A827D", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  previewText: { color: "#3E4742", fontSize: 12, lineHeight: 18, marginTop: 5 },
});
