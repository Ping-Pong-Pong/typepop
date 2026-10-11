/* TypePop Pals — Companion screen (Expo / React Native)
 * Ports prototype/game.js: ENFP blob "Pip" idles, wanders, naps and chats.
 * Procedural animation via react-native-reanimated: breathing idle, blink
 * loop, tap squash-and-stretch, wander wobble, nap Z's, spin. No sprite
 * sheets — pose PNGs + code-driven motion. Structured so Rive .riv files
 * can replace the procedural layer later without rewiring game logic.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TYPES,
  MOODS,
  pick,
  rand,
  isNightNow,
  PoseName,
  MoodKey,
} from '../types';

const { width: W, height: H } = Dimensions.get('window');
const BOND_KEY = 'typepop.bond.v1';

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
  return (
    <Animated.Text style={[styles.z, { left: x }, s]}>z</Animated.Text>
  );
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

/* ---------- main screen ---------- */

export default function CompanionScreen() {
  const type = TYPES.enfp; // TODO: type select once more pose sets land

  const [pose, setPoseState] = useState<PoseName>('idle');
  const [bubble, setBubble] = useState<{ id: number; text: string } | null>(null);
  const [bond, setBond] = useState(0);
  const [night, setNight] = useState(isNightNow());
  const [napping, setNapping] = useState(false);
  const [sparks, setSparks] = useState<{ id: number }[]>([]);

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

  const setPose = (p: PoseName) => {
    poseRef.current = p;
    setPoseState(p);
  };

  /* ----- persistence ----- */
  useEffect(() => {
    AsyncStorage.getItem(BOND_KEY).then((v) => {
      if (v != null) {
        const n = parseInt(v, 10) || 0;
        bondRef.current = n;
        setBond(n);
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

  /* ----- clock ----- */
  useEffect(() => {
    const t = setInterval(() => setNight(isNightNow()), 60000);
    return () => clearInterval(t);
  }, []);

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
  const doTalk = () => showBubble(pick(type.oneLiners), 2600);

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
    bumpBond();
    setPose('happy');
    squashTap();
    hop(1);
    spawnSparks(12);
    showBubble(pick(type.oneLiners), 2400);
    setTimeout(() => {
      if (!busyRef.current && poseRef.current === 'happy') setPose('idle');
    }, 700);
    if (bondRef.current === 5) {
      setTimeout(() => showBubble('Pip likes you! Bond level up! 💛', 2600), 2600);
    }
  };

  const onCheckin = (mood: MoodKey) => {
    if (busyRef.current) return;
    bumpBond();
    setPose('happy');
    squashTap();
    hop(2);
    spawnSparks(14);
    showBubble(pick(type.checkinReact[mood]), 2800);
    setTimeout(() => {
      if (!busyRef.current && poseRef.current === 'happy') setPose('idle');
    }, 1200);
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

  const [pw, ph] = POSE_SIZE[pose];
  const hearts =
    bond >= 5 ? '💛💛💛' : bond >= 2 ? '💛💛🤍' : '💛🤍🤍';

  return (
    <View style={styles.root}>
      {/* room */}
      <View style={styles.floor} />
      <View style={styles.baseboard} />
      <View style={styles.rugOuter} />
      <View style={styles.rugInner} />

      {/* window */}
      <View style={styles.windowFrame}>
        <View
          style={[
            styles.windowSky,
            { backgroundColor: night ? '#2B3A67' : '#AEE3F5' },
          ]}
        >
          {night ? (
            <>
              <View style={[styles.star, { left: 20, top: 30 }]} />
              <View style={[styles.star, { left: 80, top: 50 }]} />
              <View style={[styles.star, { left: 50, top: 100 }]} />
            </>
          ) : (
            <View style={styles.sun} />
          )}
        </View>
        <View style={styles.windowBarV} />
        <View style={styles.windowBarH} />
      </View>

      {/* couch */}
      <View style={styles.couch} />
      <View style={styles.couchBack} />
      <View style={styles.cushion} />

      {/* plant */}
      <View style={styles.pot} />
      <View style={styles.leaf1} />
      <View style={styles.leaf2} />
      <View style={styles.leaf3} />

      {/* header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🎭 TypePop Pals</Text>
          <Text style={styles.bond}>
            {hearts}  Pip · {type.name}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.clock}>{night ? '🌙' : '☀️'}</Text>
          <TouchableOpacity
            style={styles.napBtn}
            onPress={() => {
              if (!busyRef.current) doNap();
            }}
          >
            <Text style={styles.napBtnText}>😴 nap</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* mood bubble */}
      {bubble && (
        <View key={bubble.id} style={styles.bubbleSlot}>
          <Bubble text={bubble.text} />
        </View>
      )}

      {/* Pip */}
      <View style={styles.blobSlot}>
        {napping && (
          <>
            <ZFloat delay={0} x={150} />
            <ZFloat delay={900} x={180} />
            <ZFloat delay={1800} x={210} />
          </>
        )}
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
          <Spark
            key={sp.id}
            x={100}
            y={60}
            onDone={() => clearSpark(sp.id)}
          />
        ))}
      </View>

      {/* night tint */}
      {night && <View style={styles.nightTint} pointerEvents="none" />}

      {/* feeling check-in */}
      <View style={styles.checkin}>
        <Text style={styles.checkinTitle}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={styles.moodBtn}
              onPress={() => onCheckin(m.key)}
            >
              <Text style={styles.moodIcon}>{m.icon}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF3E4' },
  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 170,
    backgroundColor: '#E8C39A',
  },
  baseboard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 170,
    height: 10,
    backgroundColor: '#D9A86C',
  },
  rugOuter: {
    position: 'absolute',
    bottom: 62,
    alignSelf: 'center',
    width: 300,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFD93D',
  },
  rugInner: {
    position: 'absolute',
    bottom: 73,
    alignSelf: 'center',
    width: 240,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FF6B6B',
  },
  windowFrame: {
    position: 'absolute',
    top: 90,
    right: 40,
    width: 140,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#8A5A3B',
    padding: 10,
  },
  windowSky: { flex: 1, borderRadius: 6, overflow: 'hidden' },
  windowBarV: {
    position: 'absolute',
    left: 70,
    top: 10,
    bottom: 10,
    width: 6,
    backgroundColor: '#8A5A3B',
  },
  windowBarH: {
    position: 'absolute',
    top: 75,
    left: 10,
    right: 10,
    height: 6,
    backgroundColor: '#8A5A3B',
  },
  star: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF6C9',
  },
  sun: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF6C9',
  },
  couch: {
    position: 'absolute',
    left: 36,
    bottom: 170,
    width: 130,
    height: 110,
    borderRadius: 18,
    backgroundColor: '#7C5CFF',
  },
  couchBack: {
    position: 'absolute',
    left: 36,
    bottom: 260,
    width: 130,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#6547E0',
  },
  cushion: {
    position: 'absolute',
    left: 52,
    bottom: 184,
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFD93D',
  },
  pot: {
    position: 'absolute',
    right: 48,
    bottom: 170,
    width: 48,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#C46A4A',
  },
  leaf1: {
    position: 'absolute',
    right: 62,
    bottom: 200,
    width: 26,
    height: 70,
    borderRadius: 13,
    backgroundColor: '#4ADE80',
  },
  leaf2: {
    position: 'absolute',
    right: 84,
    bottom: 214,
    width: 22,
    height: 52,
    borderRadius: 11,
    backgroundColor: '#4ADE80',
  },
  leaf3: {
    position: 'absolute',
    right: 40,
    bottom: 214,
    width: 22,
    height: 52,
    borderRadius: 11,
    backgroundColor: '#4ADE80',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B2B3A' },
  bond: { fontSize: 16, color: '#6B6B80', marginTop: 4 },
  headerRight: { alignItems: 'flex-end' },
  clock: { fontSize: 20 },
  napBtn: {
    marginTop: 6,
    backgroundColor: '#FFF8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#F0E6D8',
  },
  napBtnText: { fontSize: 15, color: '#6B6B80' },
  bubbleSlot: {
    position: 'absolute',
    bottom: H * 0.52,
    left: 40,
    right: 40,
    alignItems: 'center',
    zIndex: 20,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F0E6D8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 280,
  },
  bubbleText: { fontSize: 17, color: '#2B2B3A', textAlign: 'center' },
  bubbleTail: {
    position: 'absolute',
    bottom: -9,
    alignSelf: 'center',
    width: 18,
    height: 18,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#F0E6D8',
  },
  blobSlot: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  z: {
    position: 'absolute',
    bottom: 190,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8A7FB8',
    zIndex: 6,
  },
  spark: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFD93D',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 30,
  },
  nightTint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1B2340',
    opacity: 0.28,
    zIndex: 40,
  },
  checkin: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 130,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingTop: 10,
    zIndex: 50,
  },
  checkinTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B2B3A',
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  moodBtn: { alignItems: 'center', width: 70 },
  moodIcon: { fontSize: 30 },
  moodLabel: { fontSize: 12, color: '#6B6B80', marginTop: 2 },
});
