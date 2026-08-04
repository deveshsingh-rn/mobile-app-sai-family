import AsyncStorage from "@react-native-async-storage/async-storage";

const NAAM_JAP_STORAGE_KEY = "@sai-family/naam-jap/v1";

export type NaamJapDailyCount = {
  count: number;
  date: string;
};

export type NaamJapData = {
  date: string;
  hapticsEnabled: boolean;
  history: NaamJapDailyCount[];
  sessionCount: number;
  target: 27 | 54 | 108;
  todayCount: number;
  totalCount: number;
};

export const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createDefaultNaamJapData = (): NaamJapData => ({
  date: getLocalDateKey(),
  hapticsEnabled: true,
  history: [],
  sessionCount: 0,
  target: 108,
  todayCount: 0,
  totalCount: 0,
});

const normalizeForToday = (data: NaamJapData): NaamJapData => {
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

    const parsed = JSON.parse(stored) as Partial<NaamJapData>;
    const defaults = createDefaultNaamJapData();
    const data: NaamJapData = {
      ...defaults,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      target: [27, 54, 108].includes(Number(parsed.target))
        ? (Number(parsed.target) as NaamJapData["target"])
        : 108,
    };

    return normalizeForToday(data);
  } catch {
    return createDefaultNaamJapData();
  }
}

export async function saveNaamJapData(data: NaamJapData) {
  await AsyncStorage.setItem(NAAM_JAP_STORAGE_KEY, JSON.stringify(data));
}
