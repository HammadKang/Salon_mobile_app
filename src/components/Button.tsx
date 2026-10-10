import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme';

type Variant = 'solid' | 'gold' | 'outline' | 'light' | 'ghost';

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  solid: { bg: colors.ink, fg: colors.ivory, border: colors.ink },
  gold: { bg: colors.gold, fg: colors.ivory, border: colors.gold },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.ink },
  light: { bg: 'transparent', fg: colors.ivory, border: 'rgba(250,246,240,0.7)' },
  ghost: { bg: 'transparent', fg: colors.ink, border: 'transparent' },
};

/** Squared luxury button with a gentle press animation. Minimum 48pt tall for easy tapping. */
export function Button({
  label, onPress, variant = 'solid', icon, disabled, loading, style, accessibilityLabel,
}: {
  label: string; onPress: () => void; variant?: Variant; icon?: React.ReactNode; disabled?: boolean; loading?: boolean;
  style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const p = palette[variant];
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => to(0.97)}
        onPressOut={() => to(1)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        style={[styles.base, { backgroundColor: p.bg, borderColor: p.border }, disabled && styles.disabled]}>
        {loading ? <ActivityIndicator color={p.fg} /> : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.label, { color: p.fg }]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 50, paddingHorizontal: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase', fontWeight: '600' },
  disabled: { opacity: 0.45 },
});
