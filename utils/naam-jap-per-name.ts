/**
 * Per-Naam counting for Naam Jap (pure functions, no React Native imports so node tests can load it).
 *
 * Counts made before per-Naam tracking existed cannot be attributed to a Naam; they are never
 * back-filled. The breakdown shows them as an "Earlier Jaap" row = total − Σ per-Naam totals.
 */

export type NaamJapDailyCount = { count: number; date: string };

export type NaamJapNameStats = {
  label: string;
  today: number;
  total: number;
  history: NaamJapDailyCount[];
};

export type NaamJapPerName = Record<string, NaamJapNameStats>;

export type NaamBreakdownRow = {
  id: string;
  label: string;
  count: number;
  malas: number;
  removed: boolean;
  earlier: boolean;
};

export const MAX_UNDO_STACK = 1080; // 10 malas of undo history
export const MAX_NAME_HISTORY_DAYS = 30;
export const MAX_TRACKED_NAMES = 60;
export const EARLIER_JAAP_ID = "__earlier__";

const safeCount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(value)))
    : 0;

const isDateKey = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export function sanitizePerName(value: unknown): NaamJapPerName {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const result: NaamJapPerName = {};
  Object.entries(value as Record<string, unknown>)
    .slice(0, MAX_TRACKED_NAMES)
    .forEach(([id, raw]) => {
      const stats = raw as Partial<NaamJapNameStats> | null;
      if (!id.trim() || !stats || typeof stats.label !== "string") return;
      const history = Array.isArray(stats.history)
        ? stats.history
            .filter((item) => isDateKey(item?.date))
            .map((item) => ({ count: safeCount(item.count), date: item.date }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-MAX_NAME_HISTORY_DAYS)
        : [];
      const today = safeCount(stats.today);
      result[id] = {
        history,
        label: stats.label.trim().slice(0, 40) || "Naam",
        today,
        total: Math.max(safeCount(stats.total), today),
      };
    });
  return result;
}

export function sanitizeUndoStack(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string" && Boolean(id)).slice(-MAX_UNDO_STACK)
    : [];
}

/** One Naam counted: increments that Naam and remembers it for Undo. */
export function recordNaamCount(
  perName: NaamJapPerName,
  undoStack: string[],
  name: { id: string; label: string }
) {
  const current = perName[name.id];
  return {
    perName: {
      ...perName,
      [name.id]: {
        history: current?.history ?? [],
        label: name.label,
        today: (current?.today ?? 0) + 1,
        total: (current?.total ?? 0) + 1,
      },
    },
    undoStack: [...undoStack, name.id].slice(-MAX_UNDO_STACK),
  };
}

/** Undo the last per-Naam count (the Naam that was actually counted, not the one selected now). */
export function undoNaamCount(perName: NaamJapPerName, undoStack: string[]) {
  const lastId = undoStack[undoStack.length - 1];
  const stats = lastId ? perName[lastId] : undefined;
  if (!lastId || !stats) return { perName, undoStack: undoStack.slice(0, -1) };

  return {
    perName: {
      ...perName,
      [lastId]: {
        ...stats,
        today: Math.max(0, stats.today - 1),
        total: Math.max(0, stats.total - 1),
      },
    },
    undoStack: undoStack.slice(0, -1),
  };
}

/** New day: move each Naam's `today` into its history under the previous date. */
export function rollPerNameToNewDay(perName: NaamJapPerName, previousDate: string): NaamJapPerName {
  const next: NaamJapPerName = {};
  Object.entries(perName).forEach(([id, stats]) => {
    next[id] = {
      ...stats,
      history: stats.today
        ? [...stats.history.filter((item) => item.date !== previousDate), { count: stats.today, date: previousDate }]
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-MAX_NAME_HISTORY_DAYS)
        : stats.history,
      today: 0,
    };
  });
  return next;
}

export function getNaamBreakdown(
  input: {
    perName: NaamJapPerName;
    jaapNames: { id: string; label: string }[];
    todayCount: number;
    totalCount: number;
  },
  period: "today" | "lifetime",
  naamPerMala: number
): NaamBreakdownRow[] {
  const currentLabels = new Map(input.jaapNames.map((name) => [name.id, name.label]));
  const rows: NaamBreakdownRow[] = Object.entries(input.perName)
    .map(([id, stats]) => {
      const count = period === "today" ? stats.today : stats.total;
      return {
        count,
        earlier: false,
        id,
        label: currentLabels.get(id) ?? stats.label,
        malas: Math.floor(count / naamPerMala),
        removed: !currentLabels.has(id),
      };
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const tracked = rows.reduce((sum, row) => sum + row.count, 0);
  const total = period === "today" ? input.todayCount : input.totalCount;
  const earlier = Math.max(0, safeCount(total) - tracked);
  if (earlier > 0) {
    rows.push({
      count: earlier,
      earlier: true,
      id: EARLIER_JAAP_ID,
      label: "Earlier Jaap",
      malas: Math.floor(earlier / naamPerMala),
      removed: false,
    });
  }
  return rows;
}
