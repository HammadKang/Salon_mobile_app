import React from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';
import { LOGO } from './geometry';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Static logo mark. */
export function LogoMark({ size = 64, color = colors.goldLight, accent = colors.ivory }: { size?: number; color?: string; accent?: string }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${LOGO.viewBox} ${LOGO.viewBox}`} accessibilityLabel="Aurelle logo" accessible>
      <Path d={LOGO.arch.d} stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Path d={LOGO.inner.d} stroke={color} strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.55} />
      <Path d={LOGO.legs.d} stroke={accent} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={LOGO.wave.d} stroke={color} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <Path d={LOGO.base.d} stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <Path d={LOGO.spark} fill={color} />
    </Svg>
  );
}

const seg = (progress: Animated.Value, length: number, from: number, to: number) =>
  progress.interpolate({ inputRange: [from, to], outputRange: [length, 0], extrapolate: 'clamp' });

/**
 * Logo that draws itself. `progress` runs 0 -> 1 (drive it with Animated.timing, JS driver):
 * arch (0-.45), legs (.25-.7), hair-strand crossbar (.6-.85), base line (.75-.95), spark pops (.9-1).
 */
export function DrawnLogoMark({ size = 150, progress, color = colors.goldLight, accent = colors.ivory }: { size?: number; progress: Animated.Value; color?: string; accent?: string }) {
  const sparkScale = progress.interpolate({ inputRange: [0.88, 0.96, 1], outputRange: [0, 1.35, 1], extrapolate: 'clamp' });
  const sparkOpacity = progress.interpolate({ inputRange: [0.88, 0.92], outputRange: [0, 1], extrapolate: 'clamp' });
  const k = size / LOGO.viewBox;
  const sparkSize = 24 * k;
  const [cx, cy] = LOGO.sparkCenter;
  return (
    <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox={`0 0 ${LOGO.viewBox} ${LOGO.viewBox}`}>
      <AnimatedPath d={LOGO.arch.d} stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none"
        strokeDasharray={[LOGO.arch.length, LOGO.arch.length]} strokeDashoffset={seg(progress, LOGO.arch.length, 0, 0.45)} />
      <AnimatedPath d={LOGO.inner.d} stroke={color} strokeWidth={0.9} strokeLinecap="round" fill="none" opacity={0.55}
        strokeDasharray={[LOGO.inner.length, LOGO.inner.length]} strokeDashoffset={seg(progress, LOGO.inner.length, 0.15, 0.55)} />
      <AnimatedPath d={LOGO.legs.d} stroke={accent} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none"
        strokeDasharray={[LOGO.legs.length, LOGO.legs.length]} strokeDashoffset={seg(progress, LOGO.legs.length, 0.25, 0.7)} />
      <AnimatedPath d={LOGO.wave.d} stroke={color} strokeWidth={2.6} strokeLinecap="round" fill="none"
        strokeDasharray={[LOGO.wave.length, LOGO.wave.length]} strokeDashoffset={seg(progress, LOGO.wave.length, 0.6, 0.85)} />
      <AnimatedPath d={LOGO.base.d} stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none"
        strokeDasharray={[LOGO.base.length, LOGO.base.length]} strokeDashoffset={seg(progress, LOGO.base.length, 0.75, 0.95)} />
    </Svg>
    {/* The spark pops in with a native-driver scale, so it sits in its own view. */}
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: cx * k - sparkSize / 2, top: cy * k - sparkSize / 2, opacity: sparkOpacity, transform: [{ scale: sparkScale }] }}>
      <Svg width={sparkSize} height={sparkSize} viewBox={`${cx - 12} ${cy - 12} 24 24`}><Path d={LOGO.spark} fill={color} /></Svg>
    </Animated.View>
    </View>
  );
}
