import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  MAX_MALA_GOAL,
  NAAM_PER_MALA,
} from "@/utils/naam-jap-calculations";

const NAAM_JAP_STORAGE_KEY = "@sai-family/naam-jap/v1";

export type NaamJapDailyCount = {
  count: number;
  date: string;
};

export type NaamJapName = {
  id: string;
  label: string;
};

export type NaamJapData = {
  autoCountSeconds: number | null;
  date: string;
  hapticsEnabled: boolean;
  history: NaamJapDailyCount[];
  jaapNames: NaamJapName[];
  selectedNameId: string;
  sessionCount: number;
  targetMalas: number;
  todayCount: number;
  totalCount: number;
};

const DEFAULT_NAME: NaamJapName = {
  id: "sai-ram",
  label: "Sai Ram",
};

const MAX_COUNT = Number.MAX_SAFE_INTEGER;
const MAX_SAVED_NAMES = 30;

const toSafeCount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(MAX_COUNT, Math.max(0, Math.floor(value)))
    : 0;

const isDateKey = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const sanitizeNames = (value: unknown, fallback: NaamJapName[]) => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const seenIds = new Set<string>();
  const names = value
    .filter(
      (item): item is NaamJapName =>
        typeof item?.id === "string" && typeof item?.label === "string"
    )
    .map((item) => ({ id: item.id.trim(), label: item.label.trim().slice(0, 40) }))
    .filter((item) => {
      if (!item.id || !item.label || seenIds.has(item.id)) {
        return false;
      }

      seenIds.add(item.id);
      return true;
    })
    .slice(0, MAX_SAVED_NAMES);

  return names.length ? names : fallback;
};

const sanitizeHistory = (value: unknown): NaamJapDailyCount[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const byDate = new Map<string, number>();

  value.forEach((item) => {
    if (isDateKey(item?.date)) {
      byDate.set(item.date, toSafeCount(item.count));
    }
  });

  return Array.from(byDate, ([date, count]) => ({ count, date }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);
};

export const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createDefaultNaamJapData = (): NaamJapData => ({
  autoCountSeconds: null,
  date: getLocalDateKey(),
  hapticsEnabled: true,
  history: [],
  jaapNames: [DEFAULT_NAME],
  selectedNameId: DEFAULT_NAME.id,
  sessionCount: 0,
  targetMalas: 1,
  todayCount: 0,
  totalCount: 0,
});

export const normalizeForToday = (data: NaamJapData): NaamJapData => {
  const today = getLocalDateKey();

  if (data.date === today) {
    return data;
  }

  const history = data.todayCount
    ? [
        ...data.history.filter((item) => item.date !== data.date),
        { count: data.todayCount, date: data.date },
      ].slice(-30)
    : data.history.slice(-30);

  return {
    ...data,
    date: today,
    history,
    sessionCount: 0,
    todayCount: 0,
  };
};

export async function loadNaamJapData(): Promise<NaamJapData> {
  try {
    const stored = await AsyncStorage.getItem(NAAM_JAP_STORAGE_KEY);

    if (!stored) {
      return createDefaultNaamJapData();
    }

    const parsed = JSON.parse(stored) as Partial<NaamJapData> & {
      target?: number;
    };
    const defaults = createDefaultNaamJapData();
    const safeNames = sanitizeNames(parsed.jaapNames, defaults.jaapNames);
    const selectedNameId = safeNames.some(
      (item) => item.id === parsed.selectedNameId
    )
      ? String(parsed.selectedNameId)
      : safeNames[0].id;
    const todayCount = toSafeCount(parsed.todayCount);
    const totalCount = Math.max(toSafeCount(parsed.totalCount), todayCount);
    const sessionCount = Math.min(
      toSafeCount(parsed.sessionCount),
      todayCount,
      MAX_MALA_GOAL * NAAM_PER_MALA
    );
    const requestedTargetMalas =
      typeof parsed.targetMalas === "number"
        ? Math.min(
            MAX_MALA_GOAL,
            Math.max(1, Math.round(parsed.targetMalas))
          )
        : 1;
    const data: NaamJapData = {
      autoCountSeconds:
        typeof parsed.autoCountSeconds === "number" &&
        parsed.autoCountSeconds >= 1
          ? Math.min(60, Math.round(parsed.autoCountSeconds))
          : null,
      date: isDateKey(parsed.date) ? parsed.date : defaults.date,
      hapticsEnabled:
        typeof parsed.hapticsEnabled === "boolean"
          ? parsed.hapticsEnabled
          : defaults.hapticsEnabled,
      history: sanitizeHistory(parsed.history),
      jaapNames: safeNames,
      selectedNameId,
      sessionCount,
      targetMalas: requestedTargetMalas,
      todayCount,
      totalCount,
    };

    return normalizeForToday(data);
  } catch {
    return createDefaultNaamJapData();
  }
}

export async function saveNaamJapData(data: NaamJapData): Promise<boolean> {
  try {
    await AsyncStorage.setItem(NAAM_JAP_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("[NaamJap] Unable to save local progress", error);
    return false;
  }
}
