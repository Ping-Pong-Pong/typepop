/* TypePop Pals — Journey screen.
 * Streak, mood check-in history, and bond milestones. Read-only: all data is
 * written by CompanionScreen into AsyncStorage.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOODS, TYPES } from '../types';
import { getActiveType, getBond, getCheckinHistory, getNames, streakDays, type CheckinEntry } from '../storage';
import { palette, font, radius, shadow } from '../theme';

const MILESTONES = [5, 10, 25, 50, 100];

const moodMeta = (key: CheckinEntry['mood']) => MOODS.find((m) => m.key === key) ?? MOODS[0];

function fmtDay(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function JourneyScreen() {
  const [history, setHistory] = useState<CheckinEntry[]>([]);
  const [bond, setBond] = useState(0);
  const [palName, setPalName] = useState('Pip');
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    const [h, b, typeKey, names] = await Promise.all([
      getCheckinHistory(),
      getBond(),
      getActiveType(),
      getNames(),
    ]);
    setHistory(h);
    setBond(b);
    setStreak(streakDays(h));
    const cfg = (TYPES as Record<string, { palName: string }>)[typeKey];
    setPalName(names[typeKey] || cfg?.palName || 'Pip');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Journey</Text>
        <Text style={styles.subtitle}>Your days with {palName}</Text>

        {/* streak card */}
        <View style={[styles.card, shadow.soft]}>
          <Text style={styles.cardEmoji}>🔥</Text>
          <Text style={styles.cardBig}>{streak}</Text>
          <Text style={styles.cardLabel}>{streak === 1 ? 'day streak' : 'day streak'}</Text>
          <Text style={styles.cardHint}>Check in daily to keep the fire going</Text>
        </View>

        {/* bond milestones */}
        <Text style={styles.section}>Bond milestones</Text>
        <View style={[styles.card, shadow.soft]}>
          <Text style={styles.bondRow}>
            💛 Bond <Text style={styles.bondNum}>{bond}</Text>
          </Text>
          {MILESTONES.map((m) => (
            <View key={m} style={styles.mileRow}>
              <Text style={[styles.mileDot, bond >= m && styles.mileDotHit]}>{bond >= m ? '●' : '○'}</Text>
              <Text style={[styles.mileText, bond >= m && styles.mileTextHit]}>
                {bond >= m ? `Bond ${m} — celebrated!` : `Bond ${m} — ${m - bond} to go`}
              </Text>
            </View>
          ))}
        </View>

        {/* mood history */}
        <Text style={styles.section}>Mood history</Text>
        {history.length === 0 ? (
          <View style={[styles.card, shadow.soft]}>
            <Text style={styles.empty}>No check-ins yet — tell {palName} how you feel from the Pal tab.</Text>
          </View>
        ) : (
          history.slice(0, 30).map((e, i) => {
            const meta = moodMeta(e.mood);
            return (
              <View key={`${e.ts}-${i}`} style={[styles.histRow, shadow.soft]}>
                <Text style={styles.histIcon}>{meta.icon}</Text>
                <View style={styles.histText}>
                  <Text style={styles.histLabel}>{meta.label}</Text>
                  <Text style={styles.histDay}>{fmtDay(e.ts)}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.cream },
  body: { padding: 20, paddingBottom: 40 },
  title: { fontFamily: font.black, fontSize: 30, color: palette.ink },
  subtitle: { fontFamily: font.medium, fontSize: 15, color: palette.inkSoft, marginTop: 2, marginBottom: 16 },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  cardEmoji: { fontSize: 34 },
  cardBig: { fontFamily: font.black, fontSize: 44, color: palette.terracottaDeep, marginTop: 4 },
  cardLabel: { fontFamily: font.bold, fontSize: 15, color: palette.ink },
  cardHint: { fontFamily: font.regular, fontSize: 13, color: palette.inkSoft, marginTop: 6 },
  section: { fontFamily: font.bold, fontSize: 17, color: palette.ink, marginTop: 10, marginBottom: 10 },
  bondRow: { fontFamily: font.bold, fontSize: 17, color: palette.ink, marginBottom: 10 },
  bondNum: { fontFamily: font.black, color: palette.honey },
  mileRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', paddingVertical: 6 },
  mileDot: { fontSize: 13, color: palette.line, width: 24 },
  mileDotHit: { color: palette.sage },
  mileText: { fontFamily: font.medium, fontSize: 14, color: palette.inkSoft },
  mileTextHit: { color: palette.ink },
  empty: { fontFamily: font.medium, fontSize: 14, color: palette.inkSoft, textAlign: 'center' },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
    marginBottom: 8,
  },
  histIcon: { fontSize: 26, marginRight: 12 },
  histText: { flex: 1 },
  histLabel: { fontFamily: font.bold, fontSize: 15, color: palette.ink },
  histDay: { fontFamily: font.regular, fontSize: 13, color: palette.inkSoft },
});
