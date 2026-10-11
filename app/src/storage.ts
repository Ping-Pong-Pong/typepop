/* TypePop Pals — shared persistence layer.
 * Keys match what CompanionScreen already uses (typepop.bond.v1, etc.),
 * so existing installs keep their bond/type/name/reminder data.
 * This module adds check-in history logging for the Journey screen.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoodKey } from './types';

export const BOND_KEY = 'typepop.bond.v1';
export const TYPE_KEY = 'typepop.type.v1';
export const NAME_KEY = 'typepop.names.v1';
export const REMIND_KEY = 'typepop.reminder.v1';
const HISTORY_KEY = 'typepop.checkins.v1';

export interface CheckinEntry {
  ts: number; // epoch ms
  mood: MoodKey;
}

/** Append one check-in to the rolling history (capped at 90 entries). Fire-and-forget safe. */
export function logCheckin(mood: MoodKey): void {
  const entry: CheckinEntry = { ts: Date.now(), mood };
  AsyncStorage.getItem(HISTORY_KEY)
    .then((raw) => {
      let list: CheckinEntry[] = [];
      try {
        if (raw) list = JSON.parse(raw) as CheckinEntry[];
      } catch {
        list = [];
      }
      list.push(entry);
      if (list.length > 90) list = list.slice(list.length - 90);
      return AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    })
    .catch(() => {});
}

/** Newest-first check-in history. */
export async function getCheckinHistory(): Promise<CheckinEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as CheckinEntry[];
    return [...list].reverse();
  } catch {
    return [];
  }
}

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Consecutive days with at least one check-in, ending today or yesterday. */
export function streakDays(history: CheckinEntry[]): number {
  const days = new Set(history.map((e) => startOfDay(e.ts)));
  let streak = 0;
  let cursor = startOfDay(Date.now());
  if (!days.has(cursor)) cursor -= DAY; // allow "checked in yesterday, not yet today"
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}

/** Per-type custom names map (mirrors CompanionScreen). */
export async function getNames(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NAME_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function getBond(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(BOND_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function getActiveType(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(TYPE_KEY)) || 'enfp';
  } catch {
    return 'enfp';
  }
}
