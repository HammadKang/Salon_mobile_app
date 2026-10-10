import React from 'react';
import { Image, ImageStyle, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, screenPad, type } from '../theme';

/** Remote image with a soft placeholder colour while it loads. */
export function Photo({ uri, style, label }: { uri: string; style?: StyleProp<ImageStyle>; label?: string }) {
  return <Image source={{ uri }} style={[{ backgroundColor: colors.champagne }, style]} resizeMode="cover" accessibilityLabel={label} accessible={!!label} />;
}

export function SectionHeader({ eyebrow, title, italic, style }: { eyebrow?: string; title: string; italic?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ paddingHorizontal: screenPad }, style]}>
      {eyebrow ? <Text style={type.eyebrow}>{eyebrow}</Text> : null}
      <Text style={[type.display(34), { marginTop: 10 }]} accessibilityRole="header">
        {title}
        {italic ? <Text style={{ fontStyle: 'italic', color: colors.gold }}> {italic}</Text> : null}
      </Text>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipText, active && { color: colors.ivory }]}>{label}</Text>
    </Pressable>
  );
}

export const Hairline = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.sand }} />;

const styles = StyleSheet.create({
  chip: { minHeight: 44, paddingHorizontal: 18, justifyContent: 'center', borderWidth: 1, borderColor: colors.sand, marginRight: 8 },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.ink, fontWeight: '600' },
});
