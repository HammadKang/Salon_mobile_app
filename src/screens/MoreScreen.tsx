import { Mail, MapPin, MessageCircle, Phone, Plus, Minus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Hairline, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { DAY_NAMES, salon } from '../config/salon';
import { FAQS } from '../data/content';
import { getService } from '../data/services';
import { getStylist } from '../data/stylists';
import { bookingMessage, callSalon, emailSalon, fullAddress, openDirections, openWhatsApp } from '../lib/contact';
import { salonNow } from '../lib/engine';
import { formatLongDate, formatPrice, to12h } from '../lib/format';
import { useBook } from '../navigation/useBook';
import { colors, screenPad, type } from '../theme';

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function MoreScreen() {
  const insets = useSafeAreaInsets();
  const book = useBook();
  const { bookings, removeBooking } = useApp();
  const [faq, setFaq] = useState<number | null>(0);
  const upcoming = bookings.filter(b => b.date >= salonNow().date).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const today = new Date(Date.now() + salon.booking.utcOffsetMinutes * 60_000).getUTCDay();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
      <SectionHeader eyebrow="Your visit" title="Bookings &" italic="contact." />

      {/* My bookings */}
      <View style={styles.block}>
        <Text style={type.label}>Your upcoming bookings</Text>
        {upcoming.length === 0 ? (
          <View style={{ marginTop: 12, gap: 14 }}>
            <Text style={type.body}>No bookings yet. Reserve your first appointment in about a minute.</Text>
            <View style={{ alignSelf: 'flex-start' }}><Button label="Book appointment" variant="gold" onPress={() => book()} /></View>
          </View>
        ) : (
          upcoming.map(b => (
            <View key={b.id} style={styles.booking}>
              <View style={{ flex: 1 }}>
                <Text style={type.display(22)}>{getService(b.serviceId)?.name}</Text>
                <Text style={{ marginTop: 4, color: colors.mocha }}>{formatLongDate(b.date)}, {to12h(b.time)}</Text>
                <Text style={{ color: colors.stone, fontSize: 13 }}>with {getStylist(b.stylistId)?.name} · {formatPrice(b.total)}</Text>
                <Text style={{ color: colors.gold, fontSize: 12, letterSpacing: 2, marginTop: 4, fontWeight: '700' }}>{b.reference}</Text>
                <Pressable onPress={() => openWhatsApp(bookingMessage(b))} accessibilityRole="button" accessibilityLabel={`Send booking ${b.reference} to the salon on WhatsApp`} style={{ marginTop: 10, minHeight: 44, justifyContent: 'center' }}>
                  <Text style={{ color: colors.ink, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' }}>Send to salon on WhatsApp  →</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => removeBooking(b.id)} accessibilityRole="button" accessibilityLabel={`Remove booking ${b.reference} from this device`} style={styles.trash}><Trash2 size={18} color={colors.stone} /></Pressable>
            </View>
          ))
        )}
        {upcoming.length > 0 ? <Text style={styles.note}>Removing only clears it from this phone. Message the salon to cancel or change a confirmed time.</Text> : null}
      </View>

      <Hairline />

      {/* Contact */}
      <View style={styles.block}>
        <Text style={type.label}>Contact</Text>
        <Text style={[type.body, { marginTop: 10 }]}>{fullAddress()}</Text>
        <View style={{ gap: 10, marginTop: 16 }}>
          <Button label={salon.contact.phone} variant="outline" icon={<Phone size={16} color={colors.ink} />} onPress={callSalon} accessibilityLabel={`Call ${salon.contact.phone}`} />
          <Button label="WhatsApp" variant="outline" icon={<MessageCircle size={16} color={colors.ink} />} onPress={() => openWhatsApp()} />
          <Button label="Email" variant="outline" icon={<Mail size={16} color={colors.ink} />} onPress={emailSalon} accessibilityLabel={`Email ${salon.contact.email}`} />
          <Button label="Directions" variant="outline" icon={<MapPin size={16} color={colors.ink} />} onPress={openDirections} />
        </View>
      </View>

      {/* Hours */}
      <View style={styles.block}>
        <Text style={type.label}>Opening hours</Text>
        <View style={{ marginTop: 8 }}>
          {ORDER.map(d => {
            const h = salon.hours[d];
            return (
              <View key={d} style={styles.hoursRow}>
                <Text style={{ color: d === today ? colors.ink : colors.mocha, fontWeight: d === today ? '700' : '400' }}>{DAY_NAMES[d]}{d === today ? '  · Today' : ''}</Text>
                <Text style={{ color: d === today ? colors.ink : colors.mocha, fontWeight: d === today ? '700' : '400' }}>{h ? `${to12h(h.open)} – ${to12h(h.close)}` : 'Closed'}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Hairline />

      {/* FAQ */}
      <View style={styles.block}>
        <Text style={type.label}>Good to know</Text>
        {FAQS.map((f, n) => {
          const isOpen = faq === n;
          return (
            <View key={f.q} style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.sand }}>
              <Pressable onPress={() => setFaq(isOpen ? null : n)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={styles.faqQ}>
                <Text style={[type.display(20), { flex: 1 }]}>{f.q}</Text>
                {isOpen ? <Minus size={18} color={colors.gold} /> : <Plus size={18} color={colors.gold} />}
              </Pressable>
              {isOpen ? <Text style={[type.body, { paddingBottom: 16, fontSize: 15 }]}>{f.a}</Text> : null}
            </View>
          );
        })}
        <Text style={[styles.note, { marginTop: 16 }]}>{salon.booking.policy}</Text>
      </View>

      <Hairline />

      {/* Updates + social */}
      <View style={styles.block}>
        <Text style={type.label}>Stay in the loop</Text>
        <Text style={[type.body, { marginTop: 8 }]}>Beauty notes and genuine offers by WhatsApp. Message us once to join, and say stop any time.</Text>
        <View style={{ gap: 10, marginTop: 14 }}>
          <Button label="Join on WhatsApp" variant="solid" onPress={() => openWhatsApp(`Hello ${salon.name}, please add me to your updates and offers list.`)} />
          <Button label="Instagram" variant="outline" onPress={() => Linking.openURL(salon.social.instagram)} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  block: { paddingHorizontal: screenPad, paddingVertical: 28 },
  booking: { marginTop: 14, flexDirection: 'row', padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.sand, backgroundColor: colors.champagne },
  trash: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: 10, fontSize: 12.5, lineHeight: 18, color: colors.stone },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.sand },
  faqQ: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
});
