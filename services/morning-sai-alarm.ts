import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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
  notificationIds: string[];
  scheduledForName?: string;
  scheduledThrough?: string;
};

const DEFAULT_SETTINGS: MorningSaiAlarmSettings = {
  enabled: false,
  hour: 6,
  minute: 0,
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
  const notificationIds: string[] = [];
  let scheduledThrough: string | undefined;

  try {
    for (let index = 0; index < SCHEDULE_DAYS; index += 1) {
      const date = getNextDate(index, settings.hour, settings.minute);
      const guidance = GUIDANCE[index % GUIDANCE.length];
      scheduledThrough = date.toISOString();
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          body: `${name}, ${guidance[0]}\n${guidance[1]}`,
          data: { feature: "morning-sai", route: "/(tabs)/experiences/ask-sai" },
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
