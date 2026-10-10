import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, Pressable, StyleSheet, View } from 'react-native';
import { colors, displayFont } from '../theme';
import { salon } from '../config/salon';
import { DrawnLogoMark, LogoMark } from './Logo';

const { width: W, height: H } = Dimensions.get('window');
const LETTERS = salon.name.toUpperCase().split('');

/** Floating gold dust that drifts upward behind the logo. */
function Dust() {
  const specs = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      x: ((i * 71) % 100) / 100 * W,
      size: 2 + (i % 3) * 1.5,
      delay: (i * 230) % 2600,
      dur: 3200 + (i % 4) * 700,
      drift: ((i % 5) - 2) * 14,
    })),
    [],
  );
  return (
    <>
      {specs.map((s, i) => <DustMote key={i} {...s} />)}
    </>
  );
}

function DustMote({ x, size, delay, dur, drift }: { x: number; size: number; delay: number; dur: number; drift: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: dur, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [v, dur, delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x, top: H * 0.78, width: size, height: size, borderRadius: size, backgroundColor: colors.goldLight,
        opacity: v.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.8, 0.5, 0] }),
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.55] }) }, { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) }],
      }}
    />
  );
}

/** One ring that pulses out from the logo. */
function Ring({ delay }: { delay: number }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(r, { toValue: 1, duration: 3000, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [r, delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { opacity: r.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.35, 0] }), transform: [{ scale: r.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.5] }) }] }]}
    />
  );
}

/**
 * Full-screen animated intro. Plays once, then calls onDone.
 * Sequence: glow + dust, logo draws itself, name rises letter by letter, tagline and gold line, then a soft zoom-out exit.
 * Tap anywhere to skip. With "Reduce Motion" on, it shows the logo briefly and fades.
 */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => setReduce(false)); }, []);

  const draw = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const letters = useRef(LETTERS.map(() => new Animated.Value(0))).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const line = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(exit, { toValue: 1, duration: reduce ? 250 : 650, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => onDone());
  };

  useEffect(() => {
    if (reduce === null) return;
    if (reduce) {
      draw.setValue(1); glow.setValue(1); letters.forEach(l => l.setValue(1)); tagline.setValue(1); line.setValue(1);
      const t = setTimeout(finish, 900);
      return () => clearTimeout(t);
    }
    const sequence = Animated.parallel([
      Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(draw, { toValue: 1, duration: 2300, delay: 150, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
      Animated.sequence([Animated.delay(1650), Animated.stagger(95, letters.map(l => Animated.timing(l, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true })))]),
      Animated.sequence([Animated.delay(2500), Animated.parallel([
        Animated.timing(line, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(tagline, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])]),
    ]);
    sequence.start(() => setTimeout(finish, 450));
    return () => sequence.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const containerOpacity = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const containerScale = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: containerOpacity }]} pointerEvents="auto">
      <Pressable style={StyleSheet.absoluteFill} onPress={finish} accessibilityRole="button" accessibilityLabel="Skip intro">
        <Animated.View style={[StyleSheet.absoluteFill, styles.center, { transform: [{ scale: containerScale }] }]}>
          <Animated.View style={[styles.glow, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]} />
          <Ring delay={400} />
          <Ring delay={1300} />
          <Ring delay={2200} />
          <Dust />

          <View style={styles.logoWrap}>
            {reduce ? <LogoMark size={150} /> : <DrawnLogoMark size={150} progress={draw} />}
          </View>

          <View style={styles.wordmark} accessibilityRole="header" accessible accessibilityLabel={salon.name}>
            {LETTERS.map((ch, i) => (
              <Animated.Text
                key={i}
                style={[styles.letter, { opacity: letters[i], transform: [{ translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }, { scale: letters[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
                {ch}
              </Animated.Text>
            ))}
          </View>

          <Animated.View style={[styles.rule, { transform: [{ scaleX: line }] }]} />
          <Animated.Text style={[styles.tagline, { opacity: tagline, transform: [{ translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
            {salon.tagline.toUpperCase()}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.ink, zIndex: 100 },
  center: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: W * 1.3, height: W * 1.3, borderRadius: W, backgroundColor: 'rgba(168,132,77,0.12)' },
  ring: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: colors.goldLight },
  logoWrap: { marginTop: -40 },
  wordmark: { flexDirection: 'row', marginTop: 26 },
  letter: { fontFamily: displayFont, fontSize: 38, letterSpacing: 7, color: colors.ivory, marginHorizontal: 1 },
  rule: { width: 120, height: 1, backgroundColor: colors.gold, marginTop: 18 },
  tagline: { marginTop: 14, fontSize: 11, letterSpacing: 8, color: colors.goldLight },
});
