import { ArrowUpRight, Clock } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import type { Service } from '../data/services';
import { stylistsForService } from '../lib/engine';
import { formatDuration, formatPrice } from '../lib/format';
import { colors, displayFont, screenPad } from '../theme';
import { PressableScale } from './Motion';
import { Photo, Scrim } from './ui';

const { width: W } = Dimensions.get('window');
const IMG_H = Math.round((W - screenPad * 2) * 0.74);

/**
 * Editorial service card: big photo with the name and price on it, then a short description,
 * who performs it, and a clear Book button. The whole card is tappable.
 */
export function ServiceRow({ s, onBook }: { s: Service; onBook: () => void }) {
  const team = stylistsForService(s.id).slice(0, 4);
  return (
    <PressableScale
      scaleTo={0.985}
      onPress={onBook}
      accessibilityRole="button"
      accessibilityLabel={`${s.name}. From ${formatPrice(s.price)}, ${formatDuration(s.durationMin)}. Book`}
      style={styles.card}>
      <View style={{ height: IMG_H }}>
        <Photo uri={s.image} style={StyleSheet.absoluteFill as never} />
        <Scrim from={0.35} strength={0.85} />
        {s.promo ? <View style={styles.promo}><Text style={styles.promoText}>{s.promo}</Text></View> : null}
        <View style={styles.onPhoto}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{s.name}</Text>
            <View style={styles.durationPill}>
              <Clock size={12} color={colors.ivory} />
              <Text style={styles.durationText}>{formatDuration(s.durationMin)}</Text>
            </View>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.from}>FROM</Text>
            <Text style={styles.price}>{formatPrice(s.price)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.desc} numberOfLines={3}>{s.description}</Text>
        <View style={styles.footer}>
          <View style={styles.team}>
            <View style={styles.avatars}>
              {team.map((t, i) => <Photo key={t.id} uri={t.image} style={[styles.avatar, { marginLeft: i === 0 ? 0 : -9 }]} />)}
            </View>
            <Text style={styles.teamText} numberOfLines={1}>{team.length === 1 ? team[0].name : `${team.length} specialists`}</Text>
          </View>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Book</Text>
            <ArrowUpRight size={16} color={colors.ivory} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.sand,
    shadowColor: '#1b1613', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  promo: { position: 'absolute', left: 0, top: 16, backgroundColor: colors.gold, paddingHorizontal: 14, paddingVertical: 6 },
  promoText: { color: colors.ivory, fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: '700' },
  onPhoto: { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  name: { fontFamily: displayFont, fontSize: 27, lineHeight: 30, color: colors.ivory },
  durationPill: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(250,246,240,0.18)', paddingHorizontal: 10, paddingVertical: 5 },
  durationText: { color: colors.ivory, fontSize: 12, fontWeight: '600' },
  priceBox: { alignItems: 'flex-end' },
  from: { color: 'rgba(250,246,240,0.75)', fontSize: 10, letterSpacing: 2.4, fontWeight: '600' },
  price: { color: colors.ivory, fontFamily: displayFont, fontSize: 24, marginTop: 1 },
  body: { padding: 16 },
  desc: { fontSize: 15, lineHeight: 22, color: colors.mocha },
  footer: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 10 },
  avatars: { flexDirection: 'row' },
  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.white },
  teamText: { flexShrink: 1, fontSize: 12.5, color: colors.stone },
  cta: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.ink, paddingHorizontal: 18 },
  ctaText: { color: colors.ivory, fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase', fontWeight: '700' },
});
