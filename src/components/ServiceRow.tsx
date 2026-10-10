import { Clock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from './Motion';
import type { Service } from '../data/services';
import { formatDuration, formatPrice } from '../lib/format';
import { colors, type } from '../theme';
import { Photo } from './ui';

export function ServiceRow({ s, onBook }: { s: Service; onBook: () => void }) {
  return (
    <PressableScale scaleTo={0.98} onPress={onBook} accessibilityRole="button" accessibilityLabel={`Book ${s.name}, from ${formatPrice(s.price)}, ${formatDuration(s.durationMin)}`} style={styles.row}>
      <View>
        <Photo uri={s.image} style={styles.img} />
        {s.promo ? <View style={styles.promo}><Text style={styles.promoText}>{s.promo}</Text></View> : null}
      </View>
      <View style={styles.body}>
        <Text style={type.display(22)}>{s.name}</Text>
        <Text style={styles.price}>From {formatPrice(s.price)}</Text>
        <Text numberOfLines={2} style={styles.desc}>{s.description}</Text>
        <View style={styles.meta}>
          <Clock size={13} color={colors.stone} />
          <Text style={styles.metaText}>{formatDuration(s.durationMin)}</Text>
          <Text style={styles.book}>Book  →</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.sand, backgroundColor: 'rgba(250,246,240,0.7)' },
  img: { width: 96, height: 124 },
  promo: { position: 'absolute', left: 0, top: 8, backgroundColor: colors.gold, paddingHorizontal: 8, paddingVertical: 3 },
  promoText: { color: colors.ivory, fontSize: 9, letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: '700' },
  body: { flex: 1 },
  price: { marginTop: 2, fontSize: 13, color: colors.ink, fontWeight: '600' },
  desc: { marginTop: 6, fontSize: 13.5, lineHeight: 19, color: colors.mocha },
  meta: { marginTop: 'auto', paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: colors.stone, flex: 1 },
  book: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.gold, fontWeight: '700' },
});
