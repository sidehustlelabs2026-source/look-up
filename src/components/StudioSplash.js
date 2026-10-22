// Side Hustle Labs branded intro overlay (~1.6s).
// Shows the stacked Side / Hustle / Labs logo (wrench tucked into the L) on charcoal,
// fades + scales in, sweeps a teal underline, then fades out to reveal the app.
// Logo palette (NOT the old coral-violet): charcoal #12141a, brass #e8b84a, ivory #f5f0e6, teal #2dd4bf.
// Needs: assets/sidehustle-labs-logo.png (copy from the Side Hustle Labs/<App>/assets folder).
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

const CHARCOAL = '#12141a';
const BRASS = '#e8b84a';
const IVORY = '#f5f0e6';
const TEAL = '#2dd4bf';

const LOGO = require('../../assets/sidehustle-labs-logo.png'); // 840x720 (aspect 7:6)
const VOICE = require('../../assets/shl-voice.mp3'); // 1.31s "Side Hustle Labs" voice tag
let EA = null;
try { EA = require('expo-audio'); } catch { EA = null; }

// Plays the voice tag once; silent if expo-audio is missing or playback is blocked.
function playVoice() {
  try {
    if (!EA?.createAudioPlayer) return null;
    const p = EA.createAudioPlayer(VOICE);
    p.volume = 0.9;
    p.play();
    return p;
  } catch {
    return null;
  }
}

export default function StudioSplash({ appName, durationMs = 1600, onDone }) {
  const fade = useRef(new Animated.Value(0)).current; // whole overlay content
  const scale = useRef(new Animated.Value(0.92)).current;
  const sweep = useRef(new Animated.Value(0)).current; // teal underline 0..1
  const plate = useRef(new Animated.Value(1)).current; // charcoal backdrop

  useEffect(() => {
    const voice = playVoice();
    const inMs = 380;
    const outMs = 260;
    const holdMs = Math.max(200, durationMs - inMs - outMs);
    const ease = Easing.out(Easing.cubic);
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: inMs, easing: ease, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: inMs + 120, easing: ease, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(inMs / 2),
          Animated.timing(sweep, { toValue: 1, duration: 620, easing: ease, useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(Math.max(0, holdMs - 120)),
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: outMs, useNativeDriver: true }),
        Animated.timing(plate, { toValue: 0, duration: outMs, useNativeDriver: true }),
      ]),
    ]);
    anim.start(({ finished }) => {
      if (finished && onDone) onDone();
    });
    return () => {
      anim.stop();
      setTimeout(() => { try { voice?.remove?.(); } catch {} }, 1600);
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.plate, { opacity: plate }]} pointerEvents="none">
      <Animated.View style={[styles.center, { opacity: fade, transform: [{ scale }] }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Side Hustle Labs" />
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { transform: [{ scaleX: sweep }] }]} />
        </View>
        {appName ? <Text style={styles.app}>{String(appName).toUpperCase()}</Text> : null}
        <Text style={styles.tag}>a Side Hustle Labs app</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  plate: { backgroundColor: CHARCOAL },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 260, height: 223 }, // keeps the 840x720 aspect
  track: { width: 120, height: 3, marginTop: 18, overflow: 'hidden', borderRadius: 2 },
  bar: { flex: 1, backgroundColor: TEAL, borderRadius: 2 },
  app: { color: IVORY, opacity: 0.88, fontWeight: '600', fontSize: 13, letterSpacing: 4, marginTop: 14 },
  tag: { color: BRASS, fontWeight: '500', fontSize: 11, letterSpacing: 1, marginTop: 4 },
});
