export const NAAM_PER_MALA = 108;
export const MAX_MALA_GOAL = 10_000;

export type NaamJapCountState = {
  sessionCount: number;
  targetMalas: number;
  todayCount: number;
  totalCount: number;
};

export type NaamJapMetrics = {
  completedLifetimeMalas: number;
  completedTodayMalas: number;
  currentMalaCount: number;
  goalReached: boolean;
  sessionGoalCount: number;
  sessionProgress: number;
};

const safeCount = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

export const getMinimumMalaGoal = (sessionCount: number) =>
  Math.max(1, Math.ceil(safeCount(sessionCount) / NAAM_PER_MALA));

export const getNaamJapMetrics = (
  data: NaamJapCountState
): NaamJapMetrics => {
  const sessionCount = safeCount(data.sessionCount);
  const todayCount = safeCount(data.todayCount);
  const totalCount = safeCount(data.totalCount);
  const targetMalas = Math.max(1, Math.floor(data.targetMalas));
  const sessionGoalCount = targetMalas * NAAM_PER_MALA;
  const currentMalaCount =
    sessionCount === 0
      ? 0
      : ((sessionCount - 1) % NAAM_PER_MALA) + 1;

  return {
    completedLifetimeMalas: Math.floor(totalCount / NAAM_PER_MALA),
    completedTodayMalas: Math.floor(todayCount / NAAM_PER_MALA),
    currentMalaCount,
    goalReached: sessionCount >= sessionGoalCount,
    sessionGoalCount,
    sessionProgress: Math.min(1, sessionCount / sessionGoalCount),
  };
};

export const incrementNaamJapData = <T extends NaamJapCountState>(
  data: T
): T => {
  if (getNaamJapMetrics(data).goalReached) return data;

  return {
    ...data,
    sessionCount: data.sessionCount + 1,
    todayCount: data.todayCount + 1,
    totalCount: data.totalCount + 1,
  };
};

export const undoNaamJapData = <T extends NaamJapCountState>(data: T): T => {
  if (data.sessionCount <= 0) return data;

  return {
    ...data,
    sessionCount: data.sessionCount - 1,
    todayCount: Math.max(0, data.todayCount - 1),
    totalCount: Math.max(0, data.totalCount - 1),
  };
};
