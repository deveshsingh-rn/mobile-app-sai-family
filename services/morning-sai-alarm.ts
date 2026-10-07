import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiClient } from "./api";
import { playVoiceSegment } from "./voice-segment-playback";

const STORAGE_KEY = "@sai-family/morning-sai-alarm/v1";
const CHANNEL_ID = "morning-sai";
const SCHEDULE_DAYS = 30;

const GUIDANCE = [
  ["Begin today with patience, and let your words bring peace.", "Do one helpful act without expecting anything in return."],
  ["Keep faith when the path feels uncertain.", "Take the next honest step and leave the result to Sai."],
  ["Choose calm before reacting today.", "Listen fully, speak gently, and protect another person’s dignity."],
  ["Let gratitude guide your morning.", "Notice what is already good and share that goodness with someone."],
  ["Do your duty with sincerity, not anxiety.", "A peaceful effort is more valuable than a hurried result."],
  ["Carry kindness into every conversation today.", "A soft answer can become someone else’s strength."],
  ["Trust that no sincere prayer is wasted.", "Move through today with courage, patience, and compassion."],
] as const;

export type MorningSaiAlarmSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  deliveryMode: MorningSaiAlarmDeliveryMode;
  locale: MorningSaiLocale;
  notificationIds: string[];
  scheduledForName?: string;
  scheduledThrough?: string;
};

export type MorningSaiAlarmDeliveryMode = "text" | "voice";
export type MorningSaiLocale = "en-IN" | "hi-IN";

export type MorningSaiGuidance = {
  cached: boolean;
  date: string;
  devoteeName: string | null;
  line1: string;
  line2: string;
  locale: MorningSaiLocale;
};

type MorningSaiVoiceResponse = {
  audioBase64: string;
  format: "mp3_44100_128";
  guidance: MorningSaiGuidance;
  mimeType: "audio/mpeg";
};

const DEFAULT_SETTINGS: MorningSaiAlarmSettings = {
  enabled: false,
  hour: 6,
  minute: 0,
  deliveryMode: "text",
  locale: "en-IN",
  notificationIds: [],
};

const cleanName = (name?: string) => name?.trim().replace(/\s+/g, " ") || "Sai Devotee";

export async function loadMorningSaiAlarmSettings(): Promise<MorningSaiAlarmSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored) as Partial<MorningSaiAlarmSettings>;
    return {
      enabled: parsed.enabled === true,
      hour:
        typeof parsed.hour === "number" && parsed.hour >= 0 && parsed.hour <= 23
          ? Math.floor(parsed.hour)
          : DEFAULT_SETTINGS.hour,
      minute:
        typeof parsed.minute === "number" && parsed.minute >= 0 && parsed.minute <= 59
          ? Math.floor(parsed.minute)
          : DEFAULT_SETTINGS.minute,
      deliveryMode: parsed.deliveryMode === "voice" ? "voice" : "text",
      locale: parsed.locale === "hi-IN" ? "hi-IN" : "en-IN",
      notificationIds: Array.isArray(parsed.notificationIds)
        ? parsed.notificationIds.filter((id): id is string => typeof id === "string")
        : [],
      scheduledForName:
        typeof parsed.scheduledForName === "string" ? parsed.scheduledForName : undefined,
      scheduledThrough:
        typeof parsed.scheduledThrough === "string" ? parsed.scheduledThrough : undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: MorningSaiAlarmSettings) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const toLocalTime = (hour: number, minute: number) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

async function syncBackendSettings(settings: MorningSaiAlarmSettings) {
  await apiClient.put("/api/users/me/morning-guidance-settings", {
    enabled: settings.enabled,
    localTime: toLocalTime(settings.hour, settings.minute),
    locale: settings.locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
  });
}

export async function fetchMorningSaiGuidance(
  locale: MorningSaiLocale = "en-IN"
) {
  const response = await apiClient.get<MorningSaiGuidance>(
    "/api/ai/morning-guidance/today",
    { params: { locale } }
  );
  return response.data;
}

let activeVoicePlayback: AbortController | undefined;

export async function playMorningSaiGuidanceVoice(
  locale: MorningSaiLocale = "en-IN",
  onStarted: () => void = () => undefined
) {
  activeVoicePlayback?.abort();
  const controller = new AbortController();
  activeVoicePlayback = controller;

  try {
    const response = await apiClient.get<MorningSaiVoiceResponse>(
      "/api/ai/morning-guidance/today/voice",
      { params: { locale } }
    );

    if (!response.data.audioBase64) {
      throw new Error("Morning voice message is unavailable.");
    }

    await playVoiceSegment(
      {
        data: response.data.audioBase64,
        index: 0,
        turnId: `morning-${response.data.guidance.date}`,
      },
      controller.signal,
      onStarted
    );

    return response.data.guidance;
  } finally {
    if (activeVoicePlayback === controller) activeVoicePlayback = undefined;
  }
}

export function stopMorningSaiGuidanceVoice() {
  activeVoicePlayback?.abort();
  activeVoicePlayback = undefined;
}

async function cancelNotifications(ids: string[]) {
  await Promise.allSettled(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}

async function ensurePermission(requestPermission: boolean) {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  if (!requestPermission) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

async function ensureChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    importance: Notifications.AndroidImportance.HIGH,
    name: "Morning Sai guidance",
    sound: "default",
    vibrationPattern: [0, 250, 150, 250],
  });
}

const getNextDate = (dayOffset: number, hour: number, minute: number) => {
  const now = new Date();
  const date = new Date(now);
  date.setHours(hour, minute, 0, 0);

  if (date.getTime() <= now.getTime()) date.setDate(date.getDate() + 1);
  date.setDate(date.getDate() + dayOffset);
  return date;
};

async function scheduleUpcoming(
  settings: MorningSaiAlarmSettings,
  devoteeName: string,
  requestPermission: boolean
) {
  const permitted = await ensurePermission(requestPermission);
  if (!permitted) {
    throw new Error("Please allow notifications in Settings to use the morning alarm.");
  }

  await ensureChannel();
  await cancelNotifications(settings.notificationIds);

  const name = cleanName(devoteeName);
  const liveGuidance = await fetchMorningSaiGuidance(settings.locale).catch(
    () => null
  );
  const notificationIds: string[] = [];
  let scheduledThrough: string | undefined;

  try {
    for (let index = 0; index < SCHEDULE_DAYS; index += 1) {
      const date = getNextDate(index, settings.hour, settings.minute);
      const guidance =
        index === 0 && liveGuidance
          ? ([liveGuidance.line1, liveGuidance.line2] as const)
          : GUIDANCE[index % GUIDANCE.length];
      scheduledThrough = date.toISOString();
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          body: `${name}, ${guidance[0]}\n${guidance[1]}`,
          data: {
            deliveryMode: settings.deliveryMode,
            feature: "morning-sai",
            locale: settings.locale,
            route: "/(tabs)/experiences/ask-sai",
          },
          sound: "default",
          title: "Sai Baba’s morning message",
        },
        trigger: {
          channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
          date,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      });
      notificationIds.push(id);
    }
  } catch (error) {
    await cancelNotifications(notificationIds);
    throw error;
  }

  const next = {
    ...settings,
    enabled: true,
    notificationIds,
    scheduledForName: name,
    scheduledThrough,
  };
  await saveSettings(next);
  await syncBackendSettings(next).catch(() => undefined);
  return next;
}

export async function enableMorningSaiAlarm(
  hour: number,
  minute: number,
  devoteeName: string
) {
  const current = await loadMorningSaiAlarmSettings();
  return scheduleUpcoming(
    { ...current, enabled: true, hour, minute },
    devoteeName,
    true
  );
}

export async function disableMorningSaiAlarm() {
  const current = await loadMorningSaiAlarmSettings();
  await cancelNotifications(current.notificationIds);
  const next = {
    ...current,
    enabled: false,
    notificationIds: [],
    scheduledForName: undefined,
    scheduledThrough: undefined,
  };
  await saveSettings(next);
  await syncBackendSettings(next).catch(() => undefined);
  return next;
}

export async function saveMorningSaiAlarmTime(hour: number, minute: number) {
  const current = await loadMorningSaiAlarmSettings();
  const next = {
    ...current,
    hour: Math.min(23, Math.max(0, Math.floor(hour))),
    minute: Math.min(59, Math.max(0, Math.floor(minute))),
  };
  await saveSettings(next);
  await syncBackendSettings(next).catch(() => undefined);
  return next;
}

export async function saveMorningSaiAlarmPreferences(input: {
  deliveryMode: MorningSaiAlarmDeliveryMode;
  devoteeName: string;
  locale?: MorningSaiLocale;
}) {
  const current = await loadMorningSaiAlarmSettings();
  const next: MorningSaiAlarmSettings = {
    ...current,
    deliveryMode: input.deliveryMode,
    locale: input.locale ?? current.locale,
  };

  if (current.enabled) {
    return scheduleUpcoming(next, input.devoteeName, false);
  }

  await saveSettings(next);
  await syncBackendSettings(next).catch(() => undefined);
  return next;
}

export async function refreshMorningSaiAlarm(devoteeName: string) {
  const current = await loadMorningSaiAlarmSettings();
  if (!current.enabled) return current;

  const cleanDevoteeName = cleanName(devoteeName);
  const refreshThreshold = Date.now() + 7 * 24 * 60 * 60 * 1000;
  if (
    current.scheduledForName === cleanDevoteeName &&
    current.scheduledThrough &&
    new Date(current.scheduledThrough).getTime() > refreshThreshold
  ) {
    return current;
  }

  try {
    return await scheduleUpcoming(current, devoteeName, false);
  } catch {
    return current;
  }
}
