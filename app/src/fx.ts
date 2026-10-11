/* Tiny haptics helpers. Web builds have no haptics — guard with Platform
 * so the web export never touches the native module.
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

function safe(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  try {
    fn().catch(() => {});
  } catch {
    /* haptics are best-effort */
  }
}

export const hapticTap = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

export const hapticSquash = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

export const hapticCelebrate = () =>
  safe(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
