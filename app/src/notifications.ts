/* TypePop Pals — local notification helpers (Expo SDK 57)
 * Push-notification spike (run 5): daily 8pm local reminder to visit your
 * pal, plus a 10-second test fire. Remote push (Expo Push Service / APNs)
 * needs an EAS projectId — deferred until the first EAS dev build; these
 * are pure local notifications and work in Expo Go / dev builds.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Web export: expo-notifications loads on web but local scheduling is a
// native feature — every entry point here no-ops gracefully on web.
const NATIVE = Platform.OS !== 'web';

const DAILY_ID = 'typepop-daily-reminder';

const REMINDER_BODIES = [
  'says hi! Come play for a minute 💛',
  'missed you today. A quick visit means a lot!',
  'has a new one-liner for you. Tap to hear it ✨',
  'is bouncing around waiting for you 🌀',
];

export function initNotifications() {
  if (!NATIVE) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('typepop-reminders', {
      name: 'Pal reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

/** 'granted' | 'denied' | 'undetermined' — requests when undetermined. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!NATIVE) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** One daily reminder at 8pm local time. Re-scheduling replaces the old one. */
export async function setDailyReminder(
  enabled: boolean,
  palName: string,
): Promise<void> {
  if (!NATIVE) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_ID);
    if (!enabled) return;
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: `💛 ${palName} says hi!`,
        body: `${palName} ${
          REMINDER_BODIES[Math.floor(Math.random() * REMINDER_BODIES.length)]
        }`,
        data: { kind: 'daily-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  } catch {
    /* permissions denied or platform unsupported — UI handles the message */
  }
}

/** 10-second test fire, for the "test" path. */
export async function fireTestNotification(palName: string): Promise<void> {
  if (!NATIVE) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 Notifications work!`,
        body: `${palName} will ping you at 8pm each day.`,
        data: { kind: 'test' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
      },
    });
  } catch {
    /* ignore */
  }
}
