import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import StudioSplash from './src/components/StudioSplash';
import { CHALLENGES, SENSE_COLORS, dailyChallenge, dayKey } from './src/challenges';

SplashScreen.preventAutoHideAsync().catch(() => {});
let EA = null; try { EA = require('expo-audio'); } catch {}
const SFX = { tap: require('./assets/tap.wav'), unlock: require('./assets/unlock.wav'), done: require('./assets/chime_2.wav') };
function sfx(k, v = 0.6) { try { const p = EA.createAudioPlayer(SFX[k]); p.volume = v; p.play(); setTimeout(() => { try { p.remove(); } catch {} }, 4000); } catch {} }
function buzz() { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} }

const KEY = 'lookup.v1';
const STATIC = Platform.OS === 'web' && typeof location !== 'undefined' && /demo=/.test(location.search);
const BG = require('./assets/bg.jpg');
const C = { ink: '#0e1a2e', ivory: '#fff6e8', dim: 'rgba(255,246,232,0.62)', sun: '#ffa45b', sunDeep: '#ff7a3d', teal: '#2dd4bf', card: 'rgba(255,246,232,0.08)', line: 'rgba(255,246,232,0.14)' };
const EMPTY = { points: 0, streak: 0, best: 0, lastDay: null, history: [], active: null };

function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); }
function fmt(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

function demoState() {
  if (Platform.OS !== 'web' || typeof location === 'undefined') return null;
  const m = /demo=(\w+)/.exec(location.search); if (!m) return null;
  const hist = [['sound3', 3, 50], ['red5', 5, 85], ['sky', 3, 55], ['green', 4, 70]].map(([id, n, pts], i) => ({ id, day: dayKey(new Date(Date.now() - (i + 1) * 864e5)), pts, items: ['Bus brakes hissing', 'A crow on the fence', 'Wind in the maple', 'Red mailbox', 'Kid\'s scooter'].slice(0, n) }));
  const base = { points: 260, streak: 4, best: 6, lastDay: hist[0].day, history: hist, active: null };
  const ch = dailyChallenge();
  if (m[1] === 'lock') base.active = { id: ch.id, start: Date.now() - 3.3 * 60e3, end: Date.now() + (ch.mins * 60e3 - 3.3 * 60e3) };
  if (m[1] === 'log') base.active = { id: ch.id, start: Date.now() - 6e5, end: Date.now() - 1000 };
  return { s: base, screen: m[1] === 'board' ? 'board' : 'home', noSplash: true };
}

function Btn({ label, onPress, kind = 'sun', disabled, style }) {
  const sc = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(sc, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  return (
    <Pressable style={{ alignSelf: 'stretch' }} disabled={disabled} onPressIn={() => to(0.95)} onPressOut={() => to(1)} onPress={() => { buzz(); sfx('tap', 0.4); onPress && onPress(); }}>
      <Animated.View style={[kind === 'sun' ? st.btnSun : st.btnGhost, disabled && { opacity: 0.4 }, { transform: [{ scale: sc }] }, style]}>
        {kind === 'sun' && <View style={st.btnShine} />}
        <Text style={kind === 'sun' ? st.btnSunTx : st.btnGhostTx}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function FadeIn({ children, delay = 0, style }) {
  const a = useRef(new Animated.Value(STATIC ? 1 : 0)).current;
  useEffect(() => { if (STATIC) return; Animated.timing(a, { toValue: 1, duration: 520, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  return <Animated.View style={[style, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>{children}</Animated.View>;
}

function Stat({ value, label, color }) {
  return <View style={st.stat}><Text style={[st.statV, { color }]}>{value}</Text><Text style={st.statL}>{label}</Text></View>;
}

function SenseChip({ sense }) {
  const c = SENSE_COLORS[sense] || C.sun;
  return <View style={[st.chip, { backgroundColor: c + '33', borderColor: c }]}><Text style={[st.chipTx, { color: c }]}>{sense.toUpperCase()}</Text></View>;
}

function Home({ s, ch, doneToday, onStart, onBoard }) {
  return (
    <ScrollView contentContainerStyle={st.pad}>
      <FadeIn><Text style={st.brand}>LOOK UP</Text><Text style={st.h1}>{doneToday ? 'Nice. You looked up today.' : 'Today\u2019s challenge'}</Text></FadeIn>
      <FadeIn delay={120} style={st.statsRow}>
        <Stat value={s.points} label="POINTS" color={C.sun} />
        <Stat value={s.streak} label="DAY STREAK" color={C.teal} />
        <Stat value={s.best} label="BEST" color="#c9b8ff" />
      </FadeIn>
      <FadeIn delay={220} style={[st.bigCard, doneToday && { opacity: 0.7 }]}>
        <View style={st.cardGlow} />
        <View style={st.emojiDisc}><Text style={st.emoji}>{ch.emoji}</Text></View>
        <SenseChip sense={ch.sense} />
        <Text style={st.cTitle}>{ch.title}</Text>
        <Text style={st.cPrompt}>{ch.prompt}</Text>
        <View style={st.metaRow}>
          <View style={st.meta}><Text style={st.metaV}>{ch.count}</Text><Text style={st.metaL}>to notice</Text></View>
          <View style={st.meta}><Text style={st.metaV}>{ch.mins}m</Text><Text style={st.metaL}>phone down</Text></View>
        </View>
        {doneToday
          ? <View style={st.doneBadge}><Text style={st.doneTx}>✓ Done for today, come back tomorrow</Text></View>
          : <Btn label="I'm going out" onPress={onStart} style={{ marginTop: 22 }} />}
      </FadeIn>
      <FadeIn delay={320}><Btn kind="ghost" label="Scoreboard" onPress={onBoard} style={{ marginTop: 16 }} /></FadeIn>
      <Text style={st.foot}>The screen is just the scorecard. The real game is out there.</Text>
    </ScrollView>
  );
}

function Locked({ ch, active, onReady, onQuit }) {
  const [now, setNow] = useState(Date.now());
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])); loop.start();
    return () => { clearInterval(t); loop.stop(); };
  }, []);
  const left = active.end - now; const ready = left <= 0;
  const frac = Math.min(1, (now - active.start) / (active.end - active.start));
  useEffect(() => { if (ready) { sfx('unlock', 0.6); try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {} } }, [ready]);
  const sc = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  return (
    <View style={[st.pad, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={st.brand}>{ready ? 'WELCOME BACK' : 'LOCKED \u00b7 GO LOOK UP'}</Text>
      <View style={st.orbWrap}>
        <Animated.View style={[st.orbHalo, { transform: [{ scale: sc }], opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] }) }]} />
        <View style={st.orb}>
          <View style={[st.orbFill, { height: (frac * 100) + '%' }]} />
          <Text style={st.lockIcon}>{ready ? '🔓' : '🔒'}</Text>
          <Text style={st.timer}>{ready ? 'Ready' : fmt(left)}</Text>
          <Text style={st.timerL}>{ready ? 'log what you noticed' : 'until unlock'}</Text>
        </View>
      </View>
      <Text style={st.lockTitle}>{ch.emoji}  {ch.title}</Text>
      <Text style={st.lockPrompt}>{ch.prompt}</Text>
      {ready ? <Btn label="Log what I noticed" onPress={onReady} style={{ marginTop: 26, alignSelf: 'stretch' }} />
        : <Text style={st.lockHint}>Put the phone in your pocket. It opens when you are done.</Text>}
      <Pressable onPress={onQuit} style={{ marginTop: 22, padding: 8 }}><Text style={st.quit}>Give up this challenge</Text></Pressable>
    </View>
  );
}

function Log({ ch, onSubmit }) {
  const [items, setItems] = useState(Array(ch.count).fill(''));
  const filled = items.filter((x) => x.trim()).length;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.pad} keyboardShouldPersistTaps="handled">
        <Text style={st.brand}>{ch.emoji}  {ch.title.toUpperCase()}</Text>
        <Text style={st.h1}>What did you notice?</Text>
        {items.map((v, i) => (
          <FadeIn key={i} delay={i * 70} style={[st.entry, v.trim() && { borderColor: C.sun }]}>
            <View style={[st.num, v.trim() && { backgroundColor: C.sun }]}><Text style={[st.numTx, v.trim() && { color: C.ink }]}>{v.trim() ? '✓' : i + 1}</Text></View>
            <TextInput value={v} onChangeText={(t) => setItems(items.map((x, j) => (j === i ? t : x)))} placeholder="I noticed…" placeholderTextColor="rgba(255,246,232,0.35)" style={st.input} maxLength={80} />
          </FadeIn>
        ))}
        <Text style={st.foot}>{filled}/{ch.count} · +10 per thing, +20 for finishing</Text>
        <Btn label="Score it" disabled={filled === 0} onPress={() => onSubmit(items.map((x) => x.trim()).filter(Boolean))} style={{ marginTop: 14 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Board({ s, onBack, gained }) {
  return (
    <ScrollView contentContainerStyle={st.pad}>
      <Text style={st.brand}>SCOREBOARD</Text>
      {gained ? <FadeIn style={st.gain}><Text style={st.gainV}>+{gained}</Text><Text style={st.gainL}>points for looking up</Text></FadeIn> : null}
      <FadeIn delay={100} style={st.statsRow}>
        <Stat value={s.points} label="POINTS" color={C.sun} />
        <Stat value={s.streak} label="DAY STREAK" color={C.teal} />
        <Stat value={s.history.length} label="CHALLENGES" color="#c9b8ff" />
      </FadeIn>
      <Text style={st.section}>History</Text>
      {s.history.length === 0 && <Text style={st.foot}>Nothing yet. Your first walk starts on the home screen.</Text>}
      {s.history.map((h, i) => {
        const ch = CHALLENGES.find((c) => c.id === h.id) || CHALLENGES[0];
        return (
          <FadeIn key={i} delay={150 + i * 60} style={st.hist}>
            <View style={[st.histDisc, { backgroundColor: (SENSE_COLORS[ch.sense] || C.sun) + '33' }]}><Text style={{ fontSize: 22 }}>{ch.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={st.histT}>{ch.title}</Text>
              <Text style={st.histS} numberOfLines={1}>{h.items.join(' · ')}</Text>
              <Text style={st.histD}>{h.day}</Text>
            </View>
            <Text style={st.histP}>+{h.pts}</Text>
          </FadeIn>
        );
      })}
      <Btn kind="ghost" label="Back" onPress={onBack} style={{ marginTop: 18 }} />
    </ScrollView>
  );
}

export default function App() {
  const demo = useRef(demoState()).current;
  const [s, setS] = useState(demo ? demo.s : null);
  const [screen, setScreen] = useState(demo ? demo.screen : 'home');
  const [splash, setSplash] = useState(!demo);
  const [gained, setGained] = useState(0);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    (async () => {
      if (!demo) { try { const raw = await AsyncStorage.getItem(KEY); setS(raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY); } catch { setS(EMPTY); } }
      SplashScreen.hideAsync().catch(() => {});
    })();
  }, []);
  const save = (n) => { setS(n); if (!demo) AsyncStorage.setItem(KEY, JSON.stringify(n)).catch(() => {}); };
  if (!s) return null;

  const today = dayKey();
  const ch = dailyChallenge(today);
  const doneToday = s.lastDay === today;
  const activeCh = s.active && (CHALLENGES.find((c) => c.id === s.active.id) || ch);
  const ready = s.active && Date.now() >= s.active.end;

  const start = () => { const now = Date.now(); save({ ...s, active: { id: ch.id, start: now, end: now + ch.mins * 60e3 } }); };
  const submit = (items) => {
    const streak = s.lastDay === yesterday() ? s.streak + 1 : s.lastDay === today ? s.streak : 1;
    const pts = items.length * 10 + (items.length >= activeCh.count ? 20 : 0) + Math.min(streak, 10) * 5;
    sfx('done', 0.7); try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    save({ ...s, active: null, points: s.points + pts, streak, best: Math.max(s.best, streak), lastDay: today, history: [{ id: activeCh.id, day: today, pts, items }, ...s.history].slice(0, 100) });
    setGained(pts); setLogging(false); setScreen('board');
  };

  let body;
  if (s.active && (logging || (demo && ready))) body = <Log ch={activeCh} onSubmit={submit} />;
  else if (s.active) body = <Locked ch={activeCh} active={s.active} onReady={() => setLogging(true)} onQuit={() => save({ ...s, active: null })} />;
  else if (screen === 'board') body = <Board s={s} gained={gained} onBack={() => { setGained(0); setScreen('home'); }} />;
  else body = <Home s={s} ch={ch} doneToday={doneToday} onStart={start} onBoard={() => setScreen('board')} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ImageBackground source={BG} style={{ flex: 1, backgroundColor: C.ink }} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }}>{body}</SafeAreaView>
      </ImageBackground>
      {splash && <StudioSplash appName="Look Up" durationMs={1900} onDone={() => setSplash(false)} />}
    </SafeAreaProvider>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 10 };
const st = StyleSheet.create({
  pad: { padding: 22, paddingBottom: 40 },
  brand: { color: C.sun, fontWeight: '900', letterSpacing: 4, fontSize: 13, marginTop: 8 },
  h1: { color: C.ivory, fontSize: 30, fontWeight: '900', marginTop: 6, marginBottom: 14, letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: 22, paddingVertical: 14, alignItems: 'center' },
  statV: { fontSize: 28, fontWeight: '900' },
  statL: { color: C.dim, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  bigCard: { backgroundColor: 'rgba(20,34,58,0.92)', borderRadius: 32, padding: 24, borderWidth: 2, borderColor: 'rgba(255,164,91,0.45)', overflow: 'hidden', alignItems: 'center', ...shadow },
  cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 150, backgroundColor: 'rgba(255,164,91,0.10)', borderBottomLeftRadius: 200, borderBottomRightRadius: 200, transform: [{ scaleX: 1.4 }] },
  emojiDisc: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.ivory, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: C.sun, marginBottom: 14, ...shadow },
  emoji: { fontSize: 46 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  chipTx: { fontWeight: '900', fontSize: 11, letterSpacing: 2 },
  cTitle: { color: C.ivory, fontSize: 30, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  cPrompt: { color: C.dim, fontSize: 17, lineHeight: 24, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  meta: { backgroundColor: 'rgba(255,246,232,0.07)', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' },
  metaV: { color: C.ivory, fontSize: 22, fontWeight: '900' },
  metaL: { color: C.dim, fontSize: 11, fontWeight: '700' },
  doneBadge: { marginTop: 22, backgroundColor: 'rgba(45,212,191,0.18)', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18 },
  doneTx: { color: C.teal, fontWeight: '800' },
  btnSun: { backgroundColor: C.sunDeep, borderRadius: 999, paddingVertical: 18, alignItems: 'center', alignSelf: 'stretch', borderBottomWidth: 5, borderBottomColor: '#c4521f', overflow: 'hidden', ...shadow },
  btnShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,220,170,0.35)' },
  btnSunTx: { color: '#fff', fontSize: 19, fontWeight: '900', letterSpacing: 0.5 },
  btnGhost: { borderRadius: 999, paddingVertical: 15, alignItems: 'center', borderWidth: 2, borderColor: C.line, backgroundColor: C.card },
  btnGhostTx: { color: C.ivory, fontSize: 16, fontWeight: '800' },
  foot: { color: C.dim, textAlign: 'center', marginTop: 18, fontSize: 13, fontWeight: '600' },
  orbWrap: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginVertical: 28 },
  orbHalo: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,164,91,0.35)' },
  orb: { width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(14,26,46,0.95)', borderWidth: 4, borderColor: C.sun, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadow },
  orbFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(45,212,191,0.28)' },
  lockIcon: { fontSize: 30 },
  timer: { color: C.ivory, fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerL: { color: C.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  lockTitle: { color: C.ivory, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  lockPrompt: { color: C.dim, fontSize: 16, textAlign: 'center', marginTop: 8, lineHeight: 22, fontWeight: '600', paddingHorizontal: 8 },
  lockHint: { color: C.teal, marginTop: 24, fontWeight: '800', textAlign: 'center' },
  quit: { color: 'rgba(255,246,232,0.4)', fontWeight: '700', textDecorationLine: 'underline' },
  entry: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(20,34,58,0.9)', borderRadius: 22, borderWidth: 2, borderColor: C.line, padding: 8, marginBottom: 10 },
  num: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  numTx: { color: C.ivory, fontWeight: '900', fontSize: 16 },
  input: { flex: 1, color: C.ivory, fontSize: 17, fontWeight: '700', paddingVertical: 10, outlineStyle: 'none' },
  gain: { alignItems: 'center', backgroundColor: 'rgba(255,164,91,0.16)', borderRadius: 28, paddingVertical: 18, marginVertical: 12, borderWidth: 2, borderColor: C.sun },
  gainV: { color: C.sun, fontSize: 48, fontWeight: '900' },
  gainL: { color: C.ivory, fontWeight: '800' },
  section: { color: C.ivory, fontSize: 20, fontWeight: '900', marginTop: 6, marginBottom: 10 },
  hist: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(20,34,58,0.9)', borderRadius: 22, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  histDisc: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  histT: { color: C.ivory, fontWeight: '900', fontSize: 16 },
  histS: { color: C.dim, fontSize: 13, marginTop: 2 },
  histD: { color: 'rgba(255,246,232,0.35)', fontSize: 11, marginTop: 2, fontWeight: '700' },
  histP: { color: C.sun, fontWeight: '900', fontSize: 20, marginLeft: 8 },
});
