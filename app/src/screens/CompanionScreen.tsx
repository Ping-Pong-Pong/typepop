/* TypePop Pals — Companion screen (Expo / React Native)
 * Cozy storybook art direction: illustrated room background (day/night),
 * Nunito typography, terracotta/sage/honey palette, drawn icons, haptics.
 * Behaviors port prototype/game.js: scheduler, tap reactions, mood bubbles,
 * feeling check-in, bond meter, day/night. Procedural reanimated motion.
 * Structured so Rive .riv files can replace the procedural layer later
 * without rewiring game logic.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TYPES,
  READY_TYPES,
  MOODS,
  pick,
  rand,
  isNightNow,
  PoseName,
  MoodKey,
} from '../types';
import {
  initNotifications,
  ensureNotificationPermission,
  setDailyReminder,
  fireTestNotification,
} from '../notifications';
import { palette, font, radius, shadow } from '../theme';
import { hapticTap, hapticSquash, hapticCelebrate } from '../fx';
import { logCheckin } from '../storage';

const { width: W, height: H } = Dimensions.get('window');
const BOND_KEY = 'typepop.bond.v1';
const TYPE_KEY = 'typepop.type.v1';
const NAME_KEY = 'typepop.names.v1';
const REMIND_KEY = 'typepop.reminder.v1';
// bond thresholds that trigger a little celebration
const MILESTONES = [5, 10, 25, 50, 100];

const ROOM_DAY = require('../../assets/backgrounds/room-day.jpg');
const ROOM_NIGHT = require('../../assets/backgrounds/room-night.jpg');

const POSE_SIZE: Record<PoseName, [number, number]> = {
  idle: [215, 215],
  blink: [215, 215],
  happy: [215, 175],
  walk: [215, 215],
  nap: [240, 194],
};

/* ---------- tiny components ---------- */

function ZFloat({ delay, x }: { delay: number; x: number }) {
  const y = useSharedValue(0);
  const o = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(-60, { duration: 1400, easing: Easing.out(Easing.quad) }),
      ),
      -1,
    );
    o.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 1100 }),
      ),
      -1,
    );
  }, [delay, o, y]);
  const s = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: o.value,
  }));
  return <Animated.Text style={[styles.z, { left: x }, s]}>z</Animated.Text>;
}

function Spark({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const o = useSharedValue(1);
  const ang = useRef(rand(0, Math.PI * 2)).current;
  const dist = useRef(rand(40, 95)).current;
  useEffect(() => {
    dx.value = withTiming(Math.cos(ang) * dist, { duration: 700 });
    dy.value = withTiming(Math.sin(ang) * dist - 40, { duration: 700 });
    o.value = withTiming(0, { duration: 700 }, (finished) => {
      'worklet';
      if (finished) runOnJS(onDone)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const s = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }],
    opacity: o.value,
  }));
  return <Animated.View style={[styles.spark, { left: x, top: y }, s]} />;
}

function Bubble({ text }: { text: string }) {
  const sc = useSharedValue(0.6);
  const o = useSharedValue(0);
  useEffect(() => {
    sc.value = withSpring(1, { damping: 12 });
    o.value = withTiming(1, { duration: 200 });
  }, [o, sc]);
  const s = useAnimatedStyle(() => ({
    transform: [{ scale: sc.value }],
    opacity: o.value,
  }));
  return (
    <Animated.View style={[styles.bubble, s]}>
      <Text style={styles.bubbleText}>{text}</Text>
      <View style={styles.bubbleTail} />
    </Animated.View>
  );
}

/* Drawn heart (two circles + rotated square) — no emoji needed. */
function HeartIcon({ size = 16, color = palette.terracotta }: { size?: number; color?: string }) {
  const s = size;
  return (
    <View style={{ width: s, height: s }}>
      <View
        style={{
          position: 'absolute', left: 0, top: s * 0.16,
          width: s * 0.53, height: s * 0.53,
          borderRadius: s * 0.27, backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute', right: 0, top: s * 0.16,
          width: s * 0.53, height: s * 0.53,
          borderRadius: s * 0.27, backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute', left: s * 0.135, top: s * 0.3,
          width: s * 0.73, height: s * 0.73,
          backgroundColor: color, borderRadius: s * 0.08,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/* Drawn crescent moon: solid disc with a bg-colored bite. */
function MoonIcon({ size = 15, color = palette.ink, bg = palette.card }: { size?: number; color?: string; bg?: string }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
      />
      <View
        style={{
          position: 'absolute', left: size * 0.34, top: -size * 0.12,
          width: size * 0.92, height: size * 0.92,
          borderRadius: size * 0.46, backgroundColor: bg,
        }}
      />
    </View>
  );
}

function PillButton({
  onPress,
  onLongPress,
  label,
  night,
  icon,
  dotOn,
}: {
  onPress: () => void;
  onLongPress?: () => void;
  label: string;
  night: boolean;
  icon?: React.ReactNode;
  dotOn?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={600}
      style={({ pressed }) => [
        styles.pill,
        night && styles.pillNight,
        pressed && styles.pillPressed,
      ]}
    >
      {icon}
      {dotOn !== undefined && (
        <View style={[styles.dot, dotOn ? styles.dotOn : styles.dotOff]} />
      )}
      <Text style={[styles.pillLabel, night && styles.pillLabelNight]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- main screen ---------- */

export default function CompanionScreen() {
  const [typeKey, setTypeKey] = useState('enfp');
  const type = TYPES[typeKey] ?? TYPES.enfp;
  // behaviors run from long-lived scheduler closures; read the type via ref
  // so switching companions updates one-liners without restarting timers.
  const typeRef = useRef(type);
  typeRef.current = type;

  const [pose, setPoseState] = useState<PoseName>('idle');
  const [bubble, setBubble] = useState<{ id: number; text: string } | null>(null);
  const [bond, setBond] = useState(0);
  const [night, setNight] = useState(isNightNow());
  const [napping, setNapping] = useState(false);
  const [sparks, setSparks] = useState<{ id: number }[]>([]);
  // custom pal names, keyed by type key; fall back to types.ts palName
  const [names, setNames] = useState<Record<string, string>>({});
  const [nameModal, setNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const displayName = names[typeKey]?.trim() || type.palName;
  // daily 8pm reminder; web builds can't schedule, so the pill stays hidden there
  const [reminderOn, setReminderOn] = useState(false);
  const remindRef = useRef(false);

  const poseRef = useRef<PoseName>('idle');
  const busyRef = useRef(false);
  const bondRef = useRef(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkId = useRef(0);
  const bubbleId = useRef(0);

  // shared motion values
  const breath = useSharedValue(1);
  const tapSX = useSharedValue(1);
  const tapSY = useSharedValue(1);
  const posX = useSharedValue(0);
  const hopY = useSharedValue(0);
  const rot = useSharedValue(0);
  const nightO = useSharedValue(night ? 1 : 0);

  const setPose = (p: PoseName) => {
    poseRef.current = p;
    setPoseState(p);
  };

  const selectType = (key: string) => {
    if (!TYPES[key] || key === typeKey) return;
    hapticTap();
    setTypeKey(key);
    AsyncStorage.setItem(TYPE_KEY, key).catch(() => {});
    setPose('idle');
    const nm = names[key]?.trim() || TYPES[key].palName;
    showBubble(`Say hi to ${nm}!`, 2000);
  };

  /* ----- name your pal ----- */
  const openRename = () => {
    hapticTap();
    setNameDraft(displayName);
    setNameModal(true);
  };
  const saveName = () => {
    hapticTap();
    const trimmed = nameDraft.trim().slice(0, 16);
    const next = { ...names, [typeKey]: trimmed || type.palName };
    setNames(next);
    setNameModal(false);
    AsyncStorage.setItem(NAME_KEY, JSON.stringify(next)).catch(() => {});
    showBubble(`${type.palName} is now ${trimmed || type.palName}! 💛`, 2400);
  };

  /* ----- daily reminder (push-notification spike) ----- */
  const applyReminder = (on: boolean, palName: string) => {
    remindRef.current = on;
    setReminderOn(on);
    AsyncStorage.setItem(REMIND_KEY, on ? '1' : '0').catch(() => {});
    setDailyReminder(on, palName);
  };
  const toggleReminder = async () => {
    hapticTap();
    if (remindRef.current) {
      applyReminder(false, displayName);
      showBubble('Reminders off. See you whenever! 💤', 2200);
      return;
    }
    const ok = await ensureNotificationPermission();
    if (!ok) {
      showBubble('Turn notifications on in Settings to get pal reminders.', 3000);
      return;
    }
    applyReminder(true, displayName);
    showBubble(`${displayName} will say hi every evening at 8!`, 2600);
  };
  // dev affordance: long-press the pill to fire a test notification in 10s
  const testReminder = async () => {
    if (!remindRef.current) {
      showBubble('Turn reminders on first, then long-press to test.', 2600);
      return;
    }
    await fireTestNotification(displayName);
    showBubble('Test fires in 10 seconds — watch for it!', 2600);
  };

  /* ----- bond milestones ----- */
  const maybeMilestone = () => {
    const n = bondRef.current;
    if (!MILESTONES.includes(n)) return;
    const nm = displayName;
    setTimeout(() => {
      hapticCelebrate();
      spawnSparks(24);
      showBubble(`🎉 Bond ${n}! ${nm} ADORES you!`, 3000);
    }, 2600);
  };

  /* ----- persistence ----- */
  useEffect(() => {
    initNotifications();
    AsyncStorage.getItem(REMIND_KEY).then((v) => {
      if (v === '1' && Platform.OS !== 'web') {
        // re-arm the daily reminder in case the name changed since scheduling
        AsyncStorage.getItem(NAME_KEY).then((nv) => {
          let nm = TYPES.enfp.palName;
          try {
            const parsed = nv ? JSON.parse(nv) : null;
            if (parsed && typeof parsed === 'object') setNames(parsed);
            if (parsed && parsed[typeKey]?.trim()) nm = parsed[typeKey].trim();
          } catch {
            /* keep defaults */
          }
          setDailyReminder(true, nm);
          remindRef.current = true;
          setReminderOn(true);
        });
      }
    });
    AsyncStorage.getItem(BOND_KEY).then((v) => {
      if (v != null) {
        const n = parseInt(v, 10) || 0;
        bondRef.current = n;
        setBond(n);
      }
    });
    AsyncStorage.getItem(TYPE_KEY).then((v) => {
      if (v && TYPES[v]) setTypeKey(v);
    });
    AsyncStorage.getItem(NAME_KEY).then((v) => {
      if (v) {
        try {
          const parsed = JSON.parse(v);
          if (parsed && typeof parsed === 'object') setNames(parsed);
        } catch {
          /* keep defaults */
        }
      }
    });
  }, []);
  const bumpBond = () => {
    const n = bondRef.current + 1;
    bondRef.current = n;
    setBond(n);
    AsyncStorage.setItem(BOND_KEY, String(n)).catch(() => {});
  };

  /* ----- breathing idle ----- */
  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1.035, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breath]);

  /* ----- clock + day/night crossfade ----- */
  useEffect(() => {
    const t = setInterval(() => setNight(isNightNow()), 60000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    nightO.value = withTiming(night ? 1 : 0, { duration: 1600 });
  }, [night, nightO]);
  const nightImgStyle = useAnimatedStyle(() => ({ opacity: nightO.value }));

  /* ----- bubble ----- */
  const showBubble = (text: string, ms = 2400) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleId.current += 1;
    setBubble({ id: bubbleId.current, text });
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  };

  /* ----- blink loop ----- */
  useEffect(() => {
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!busyRef.current && poseRef.current === 'idle') {
          setPose('blink');
          setTimeout(() => {
            if (!busyRef.current && poseRef.current === 'blink') setPose('idle');
          }, 150);
        }
        if (alive) loop();
      }, rand(2600, 5200));
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- helpers ----- */
  const hop = (times: number) => {
    const seq: any[] = [];
    for (let i = 0; i < times; i++) {
      seq.push(withTiming(-70, { duration: 220, easing: Easing.out(Easing.quad) }));
      seq.push(withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }));
    }
    hopY.value = withSequence(...seq);
  };

  const squashTap = () => {
    tapSY.value = withSequence(
      withSpring(0.82, { damping: 8, stiffness: 260 }),
      withSpring(1, { damping: 7, stiffness: 200 }),
    );
    tapSX.value = withSequence(
      withSpring(1.18, { damping: 8, stiffness: 260 }),
      withSpring(1, { damping: 7, stiffness: 200 }),
    );
  };

  const spawnSparks = (n = 10) => {
    const fresh = Array.from({ length: n }, () => ({ id: ++sparkId.current }));
    setSparks((s) => [...s, ...fresh]);
  };
  const clearSpark = (id: number) =>
    setSparks((s) => s.filter((sp) => sp.id !== id));

  /* ----- behaviors (mirror game.js weights) ----- */
  const doTalk = () => showBubble(pick(typeRef.current.oneLiners), 2600);

  const doWanderTo = (targetX: number, then?: () => void, label?: string) => {
    busyRef.current = true;
    setPose('walk');
    // walk wobble: squash-and-stretch while moving
    tapSY.value = withRepeat(
      withTiming(1.06, { duration: 200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    tapSX.value = withRepeat(
      withTiming(0.95, { duration: 200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    posX.value = withTiming(targetX, {
      duration: 1200,
      easing: Easing.inOut(Easing.sin),
    });
    setTimeout(() => {
      cancelAnimation(tapSY);
      cancelAnimation(tapSX);
      tapSY.value = withSpring(1);
      tapSX.value = withSpring(1);
      setPose('idle');
      if (label) showBubble(label, 2200);
      hop(1);
      setTimeout(() => {
        busyRef.current = false;
        then && then();
      }, 400);
    }, 1250);
  };

  const doWander = () => doWanderTo(rand(-W / 2 + 90, W / 2 - 90));

  const doVisit = (spot: 'couch' | 'plant') => {
    const tx = spot === 'couch' ? -W / 2 + 190 : W / 2 - 170;
    const label =
      spot === 'couch'
        ? 'Couch: claimed. Obviously.'
        : 'Sniffing the plant. For science.';
    doWanderTo(tx, undefined, label);
  };

  const doSpin = () => {
    busyRef.current = true;
    showBubble('WHEEE!', 1400);
    spawnSparks(10);
    rot.value = withTiming(360, { duration: 700, easing: Easing.out(Easing.cubic) });
    setTimeout(() => {
      rot.value = 0;
      busyRef.current = false;
    }, 750);
  };

  const doNap = () => {
    busyRef.current = true;
    setNapping(true);
    setPose('nap');
    showBubble('Just… five more minutes…', 2000);
    setTimeout(() => {
      // wake: stretch back to idle
      setPose('idle');
      setNapping(false);
      tapSY.value = withSequence(
        withSpring(1.08, { damping: 9 }),
        withSpring(1, { damping: 7 }),
      );
      hop(1);
      busyRef.current = false;
    }, 4200);
  };

  const doBehavior = () => {
    const roll = Math.random();
    if (night && roll < 0.45) return doNap();
    if (roll < 0.3) return doTalk();
    if (roll < 0.5) return doWander();
    if (roll < 0.65) return doVisit('couch');
    if (roll < 0.78) return doVisit('plant');
    if (roll < 0.88) return doSpin();
    return doNap();
  };

  /* ----- ambient scheduler ----- */
  useEffect(() => {
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (alive && !busyRef.current) doBehavior();
        if (alive) loop();
      }, rand(4000, 8000));
    };
    const first = setTimeout(loop, 2500);
    return () => {
      alive = false;
      clearTimeout(t);
      clearTimeout(first);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [night]);

  /* ----- interaction ----- */
  const onTapBlob = () => {
    if (busyRef.current) return;
    hapticSquash();
    bumpBond();
    setPose('happy');
    squashTap();
    hop(1);
    spawnSparks(12);
    showBubble(pick(type.oneLiners), 2400);
    setTimeout(() => {
      if (!busyRef.current && poseRef.current === 'happy') setPose('idle');
    }, 700);
    maybeMilestone();
  };

  const onCheckin = (mood: MoodKey) => {
    if (busyRef.current) return;
    hapticSquash();
    bumpBond();
    logCheckin(mood);
    setPose('happy');
    squashTap();
    hop(2);
    spawnSparks(14);
    showBubble(pick(type.checkinReact[mood]), 2800);
    setTimeout(() => {
      if (!busyRef.current && poseRef.current === 'happy') setPose('idle');
    }, 1200);
    maybeMilestone();
  };

  /* ----- animated styles ----- */
  const blobAnim = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value },
      { translateY: hopY.value },
      { rotate: `${rot.value}deg` },
      { scaleX: tapSX.value },
      { scaleY: tapSY.value * breath.value },
    ],
  }));

  // ground shadow: travels with the blob, widens as it squashes,
  // shrinks + fades as it hops
  const shadowAnim = useAnimatedStyle(() => {
    const lift = Math.max(0, -hopY.value);
    return {
      transform: [
        { translateX: posX.value },
        { scaleX: tapSX.value * (1 + lift / 520) },
        { scaleY: Math.max(0.4, tapSY.value * (1 - lift / 1000)) },
      ],
      opacity: 0.3 - Math.min(0.19, lift / 480),
    };
  });

  const [pw, ph] = POSE_SIZE[pose];
  const shadowW = pose === 'nap' ? 175 : 148;
  const bondPct = Math.min(100, bond);

  return (
    <View style={styles.root}>
      {/* illustrated room, day/night crossfade */}
      <Image source={ROOM_DAY} style={styles.roomImage} resizeMode="cover" />
      <Animated.Image
        source={ROOM_NIGHT}
        style={[styles.roomImage, nightImgStyle]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={
          night
            ? ['rgba(18,24,46,0.6)', 'rgba(18,24,46,0)']
            : ['rgba(255,248,236,0.6)', 'rgba(255,248,236,0)']
        }
        style={styles.topScrim}
        pointerEvents="none"
      />

      {/* header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.wordmark, night && styles.wordmarkNight]}>
            TYPEPOP PALS
          </Text>
          <Pressable onPress={openRename} hitSlop={10} style={styles.nameRow}>
            <Text style={[styles.palName, night && styles.palNameNight]}>
              {displayName}
            </Text>
            <Text style={[styles.renameGlyph, night && styles.renameGlyphNight]}>
              ✎
            </Text>
          </Pressable>
          <Text style={[styles.typeLine, night && styles.typeLineNight]}>
            {type.nickname} · {type.name}
          </Text>
          <View style={styles.bondRow}>
            <HeartIcon size={15} color={palette.terracotta} />
            <View style={styles.bondTrack}>
              <View style={[styles.bondFill, { width: `${bondPct}%` }]} />
            </View>
            <Text style={[styles.bondNum, night && styles.bondNumNight]}>
              {bond}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <PillButton
            label="Nap"
            night={night}
            onPress={() => {
              if (!busyRef.current) doNap();
            }}
            icon={
              <MoonIcon
                size={14}
                color={night ? palette.cream : palette.ink}
                bg={night ? 'rgba(38,44,72,0.92)' : palette.card}
              />
            }
          />
          {Platform.OS !== 'web' && (
            <PillButton
              label={reminderOn ? 'Reminders on' : 'Reminders'}
              night={night}
              dotOn={reminderOn}
              onPress={toggleReminder}
              onLongPress={testReminder}
            />
          )}
        </View>
      </View>

      {/* type selector */}
      <View style={styles.typeRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeScroll}
        >
          {READY_TYPES.map((t) => {
            const active = t.key === typeKey;
            return (
              <Pressable
                key={t.key}
                style={({ pressed }) => [
                  styles.typeChip,
                  { borderColor: t.color },
                  active && { backgroundColor: t.color, borderColor: t.color },
                  pressed && !active && styles.typeChipPressed,
                ]}
                onPress={() => selectType(t.key)}
              >
                <Text
                  style={[styles.typeChipText, active && styles.typeChipTextActive]}
                >
                  {t.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* mood bubble */}
      {bubble && (
        <View key={bubble.id} style={styles.bubbleSlot}>
          <Bubble text={bubble.text} />
        </View>
      )}

      {/* pal */}
      <View style={styles.blobSlot}>
        {napping && (
          <>
            <ZFloat delay={0} x={150} />
            <ZFloat delay={900} x={180} />
            <ZFloat delay={1800} x={210} />
          </>
        )}
        <Animated.View
          style={[
            styles.groundShadow,
            { width: shadowW, bottom: ph * 0.13 },
            shadowAnim,
          ]}
        />
        <Pressable onPress={onTapBlob}>
          <Animated.View style={blobAnim}>
            <Animated.Image
              source={type.poses[pose]}
              style={{ width: pw, height: ph }}
              resizeMode="contain"
            />
          </Animated.View>
        </Pressable>
        {sparks.map((sp) => (
          <Spark key={sp.id} x={100} y={60} onDone={() => clearSpark(sp.id)} />
        ))}
      </View>

      {/* feeling check-in */}
      <View style={[styles.checkinCard, shadow.lift]}>
        <Text style={styles.checkinTitle}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <Pressable
              key={m.key}
              style={({ pressed }) => [
                styles.moodBtn,
                pressed && styles.moodBtnPressed,
              ]}
              onPress={() => onCheckin(m.key)}
            >
              <Text style={styles.moodIcon}>{m.icon}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* rename modal */}
      <Modal
        visible={nameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModal(false)}
      >
        <View style={styles.modalShade}>
          <View style={[styles.modalCard, shadow.lift]}>
            <Text style={styles.modalTitle}>Name your {type.name} pal</Text>
            <TextInput
              style={styles.nameInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              maxLength={16}
              autoFocus
              placeholder={type.palName}
              placeholderTextColor={palette.inkSoft}
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <View style={styles.modalRow}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setNameModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSave,
                  pressed && styles.modalSavePressed,
                ]}
                onPress={saveName}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream },
  roomImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  topScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 210,
  },

  /* header */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  headerLeft: { flex: 1 },
  wordmark: {
    fontFamily: font.black,
    fontSize: 11,
    letterSpacing: 3,
    color: palette.inkSoft,
  },
  wordmarkNight: { color: 'rgba(255,246,233,0.75)' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  palName: {
    fontFamily: font.black,
    fontSize: 30,
    color: palette.ink,
    letterSpacing: 0.3,
  },
  palNameNight: { color: palette.cream },
  renameGlyph: {
    fontSize: 15,
    color: palette.inkSoft,
    marginLeft: 7,
    marginTop: 6,
  },
  renameGlyphNight: { color: 'rgba(255,246,233,0.7)' },
  typeLine: {
    fontFamily: font.medium,
    fontSize: 13,
    color: palette.inkSoft,
    marginTop: 1,
  },
  typeLineNight: { color: 'rgba(255,246,233,0.75)' },
  bondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bondTrack: {
    width: 104,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(74,59,46,0.16)',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bondFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: palette.terracotta,
  },
  bondNum: {
    fontFamily: font.bold,
    fontSize: 13,
    color: palette.inkSoft,
  },
  bondNumNight: { color: 'rgba(255,246,233,0.8)' },
  headerRight: { alignItems: 'flex-end', paddingTop: 20 },

  /* pills */
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 8,
    borderWidth: 1,
    borderColor: palette.line,
    ...shadow.soft,
  },
  pillNight: {
    backgroundColor: 'rgba(38,44,72,0.92)',
    borderColor: 'rgba(255,246,233,0.22)',
  },
  pillPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  pillLabel: {
    fontFamily: font.bold,
    fontSize: 14,
    color: palette.ink,
    marginLeft: 7,
  },
  pillLabelNight: { color: palette.cream },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 1 },
  dotOn: { backgroundColor: palette.sage },
  dotOff: { backgroundColor: '#C9BBA6' },

  /* type chips */
  typeRow: {
    position: 'absolute',
    top: 196,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  typeScroll: { paddingHorizontal: 18, gap: 8 },
  typeChip: {
    borderWidth: 2,
    borderRadius: radius.chip,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,253,247,0.94)',
    marginRight: 8,
    ...shadow.soft,
  },
  typeChipPressed: { opacity: 0.7 },
  typeChipText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: palette.ink,
    letterSpacing: 0.5,
  },
  typeChipTextActive: { color: '#FFFFFF' },

  /* bubble */
  bubbleSlot: {
    position: 'absolute',
    bottom: H * 0.52,
    left: 40,
    right: 40,
    alignItems: 'center',
    zIndex: 20,
  },
  bubble: {
    backgroundColor: palette.card,
    borderRadius: radius.bubble,
    borderWidth: 1.5,
    borderColor: palette.line,
    paddingHorizontal: 18,
    paddingVertical: 13,
    maxWidth: 290,
    ...shadow.lift,
  },
  bubbleText: {
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 22,
    color: palette.ink,
    textAlign: 'center',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 16,
    height: 16,
    backgroundColor: palette.card,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: palette.line,
  },

  /* pal */
  blobSlot: {
    position: 'absolute',
    bottom: H * 0.27,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  groundShadow: {
    position: 'absolute',
    alignSelf: 'center',
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(74,59,46,0.55)',
  },
  z: {
    position: 'absolute',
    bottom: 195,
    fontFamily: font.black,
    fontSize: 26,
    color: '#9AA3C7',
    zIndex: 6,
  },
  spark: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.honey,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 30,
  },

  /* check-in card */
  checkinCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 26,
    backgroundColor: palette.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.line,
    paddingTop: 14,
    paddingBottom: 16,
    zIndex: 50,
  },
  checkinTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: palette.ink,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  moodBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 76,
    borderRadius: 20,
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.line,
  },
  moodBtnPressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
  moodIcon: { fontSize: 28 },
  moodLabel: {
    fontFamily: font.medium,
    fontSize: 11,
    color: palette.inkSoft,
    marginTop: 3,
  },

  /* rename modal */
  modalShade: {
    flex: 1,
    backgroundColor: 'rgba(43,35,26,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: palette.card,
    borderRadius: radius.card,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.line,
  },
  modalTitle: {
    fontFamily: font.black,
    fontSize: 19,
    color: palette.ink,
    textAlign: 'center',
    marginBottom: 14,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: palette.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: font.bold,
    fontSize: 18,
    color: palette.ink,
    backgroundColor: '#FFF',
    textAlign: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  modalCancelText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: palette.inkSoft,
  },
  modalSave: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: palette.terracotta,
    ...shadow.soft,
  },
  modalSavePressed: { opacity: 0.8 },
  modalSaveText: {
    fontFamily: font.bold,
    fontSize: 16,
    color: '#FFF',
  },
});
