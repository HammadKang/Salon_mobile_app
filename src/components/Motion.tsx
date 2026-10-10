import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleProp, Text, TextStyle, View, ViewStyle, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

/**
 * Reveals its children as they scroll into view (fade + rise).
 * Must be a direct child of the Animated ScrollView that owns `scrollY`.
 */
export function ScrollReveal({ scrollY, children, style, offset = 40 }: { scrollY: Animated.Value; children: React.ReactNode; style?: StyleProp<ViewStyle>; offset?: number }) {
  const [y, setY] = useState<number | null>(null);
  const onLayout = (e: LayoutChangeEvent) => setY(e.nativeEvent.layout.y);
  const start = (y ?? 0) - SCREEN_H + 120; // starts when the top edge is ~120pt above the bottom of the screen
  const range: [number, number] = [start, start + 260];
  const opacity = y === null ? 0 : scrollY.interpolate({ inputRange: range, outputRange: [0, 1], extrapolate: 'clamp' });
  const translateY = y === null ? offset : scrollY.interpolate({ inputRange: range, outputRange: [offset, 0], extrapolate: 'clamp' });
  return (
    <Animated.View onLayout={onLayout} style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/** Pressable that gently shrinks while held. */
export function PressableScale({ children, onPress, style, scaleTo = 0.97, ...rest }: React.ComponentProps<typeof Pressable> & { scaleTo?: number; style?: StyleProp<ViewStyle> }) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, style]}>
      <Pressable onPress={onPress} onPressIn={() => to(scaleTo)} onPressOut={() => to(1)} {...rest}>
        {children as React.ReactNode}
      </Pressable>
    </Animated.View>
  );
}

/** Counts up to a number when it first appears. */
export function AnimatedNumber({ value, style, duration = 1400, delay = 0 }: { value: number; style?: StyleProp<TextStyle>; duration?: number; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = v.addListener(({ value: x }) => setN(Math.round(x)));
    Animated.timing(v, { toValue: value, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [v, value, duration, delay]);
  return <Text style={style}>{n}</Text>;
}

/** Gold sparkles that twinkle on and off. Decorative only. */
export function Twinkles({ count = 7, area, color = colors.goldLight }: { count?: number; area: { width: number; height: number }; color?: string }) {
  const specs = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      left: ((i * 137) % 100) / 100 * area.width,
      top: ((i * 83 + 17) % 100) / 100 * area.height,
      size: 8 + (i % 3) * 4,
      delay: i * 420,
      dur: 1800 + (i % 3) * 500,
    })),
    [count, area.width, area.height],
  );
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: area.width, height: area.height }}>
      {specs.map((s, i) => <Twinkle key={i} {...s} color={color} />)}
    </View>
  );
}

const SPARK = 'M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z';

function Twinkle({ left, top, size, delay, dur, color }: { left: number; top: number; size: number; delay: number; dur: number; color: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, delay, dur]);
  return (
    <Animated.View style={{ position: 'absolute', left, top, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24"><Path d={SPARK} fill={color} /></Svg>
    </Animated.View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Check mark that draws itself inside a ring that pops in, with a burst of sparkles. */
export function SuccessCheck({ size = 96 }: { size?: number }) {
  const pop = useRef(new Animated.Value(0)).current;
  const draw = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 5, tension: 90 }),
      Animated.parallel([
        Animated.timing(draw, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(burst, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, [pop, draw, burst]);

  const L = 40;
  const dots = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
  return (
    <View style={{ width: size * 1.7, height: size * 1.7, alignItems: 'center', justifyContent: 'center' }}>
      {dots.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: i % 2 ? colors.goldLight : colors.gold,
            opacity: burst.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
            transform: [
              { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * size * 0.8] }) },
              { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * size * 0.8] }) },
              { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] }) },
            ],
          }}
        />
      ))}
      <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(168,132,77,0.15)', alignItems: 'center', justifyContent: 'center', opacity: pop, transform: [{ scale: pop }] }}>
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
          <AnimatedPath d="M5 12.5 L10 17.5 L19.5 7" stroke={colors.gold} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none"
            strokeDasharray={[L, L]} strokeDashoffset={draw.interpolate({ inputRange: [0, 1], outputRange: [L, 0] })} />
        </Svg>
      </Animated.View>
    </View>
  );
}
