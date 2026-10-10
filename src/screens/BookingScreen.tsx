import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, Check, Clock, MessageCircle, Share2, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Calendar } from '../components/Calendar';
import { Chip, Photo } from '../components/ui';
import { useApp } from '../context/AppContext';
import { salon } from '../config/salon';
import { SERVICES, SERVICE_CATEGORIES, getService } from '../data/services';
import { getStylist } from '../data/stylists';
import { bookingMessage, openWhatsApp } from '../lib/contact';
import { Booking, FieldErrors, addDays, computeSlots, discountFor, makeId, makeReference, salonNow, stylistsForService, validateDetails } from '../lib/engine';
import { formatDuration, formatLongDate, formatPrice, to12h } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { colors, displayFont, screenPad, type } from '../theme';

const STEPS = ['Service', 'Stylist', 'Date & time', 'Details', 'Review'];

type Details = { name: string; phone: string; email: string; notes: string; consent: boolean };

export function BookingScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Booking'>>();
  const { bookings, addBooking, offerClaimed } = useApp();

  const [step, setStep] = useState(params?.serviceId ? 1 : 0);
  const [serviceId, setServiceId] = useState<string | undefined>(params?.serviceId);
  const [stylistId, setStylistId] = useState<string>(params?.stylistId ?? 'any');
  const [date, setDate] = useState<string | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [details, setDetails] = useState<Details>({ name: '', phone: '', email: '', notes: '', consent: false });
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const scroller = useRef<{ scrollTo: (o: { y: number; animated: boolean }) => void } | null>(null);

  const service = serviceId ? getService(serviceId) : undefined;
  const promo = offerClaimed ? salon.offer.code : undefined;
  const discount = discountFor(promo);
  const total = service ? Math.round(service.price * (1 - discount / 100)) : 0;

  // slide/fade between steps
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    scroller.current?.scrollTo({ y: 0, animated: false });
  }, [step, result, anim]);

  const canContinue = (step === 0 && !!serviceId) || step === 1 || (step === 2 && !!date && !!time);
  const close = () => nav.goBack();

  const confirm = () => {
    if (!service || !date || !time) return;
    setError('');
    const sameDay = bookings.filter(b => b.date === date);
    const slot = computeSlots({ date, serviceId: service.id, stylistId, booked: sameDay }).find(s => s.time === time);
    if (!slot) { setError('Sorry, that time is no longer available. Please choose another.'); setTime(undefined); return; }
    const dup = sameDay.find(b => b.serviceId === service.id);
    if (dup) { setError(`You already have this service on that day (${dup.reference}).`); return; }
    const load = (id: string) => sameDay.filter(b => b.stylistId === id).length;
    const chosen = stylistId !== 'any' ? stylistId : [...slot.stylistIds].sort((a, b) => load(a) - load(b))[0];
    const booking: Booking = {
      id: makeId(), reference: makeReference(), serviceId: service.id, stylistId: chosen, date, time, durationMin: service.durationMin,
      name: details.name.trim(), phone: details.phone.trim(), email: details.email.trim() || undefined, notes: details.notes.trim() || undefined,
      promoCode: discount ? salon.offer.code : undefined, discountPercent: discount, price: service.price, total, createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    setResult(booking);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.ivory }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 18 : insets.top + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={type.eyebrow}>{result ? 'Booking received' : `Step ${step + 1} of ${STEPS.length}`}</Text>
          {!result ? (
            <View style={styles.bars} accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
              {STEPS.map((s, i) => <View key={s} style={[styles.bar, i <= step && { backgroundColor: colors.gold }]} />)}
            </View>
          ) : null}
        </View>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close booking" style={styles.x}><X size={24} color={colors.ink} /></Pressable>
      </View>

      <ScrollView ref={r => { scroller.current = r; }} style={{ flex: 1 }} contentContainerStyle={{ padding: screenPad, paddingBottom: 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] }}>
          {result ? (
            <Confirmation booking={result} onDone={close} />
          ) : step === 0 ? (
            <StepService selected={serviceId} onPick={id => { setServiceId(id); if (stylistId !== 'any' && !stylistsForService(id).some(s => s.id === stylistId)) setStylistId('any'); setDate(undefined); setTime(undefined); setStep(1); }} />
          ) : step === 1 && service ? (
            <StepStylist serviceId={service.id} selected={stylistId} onPick={id => { setStylistId(id); setDate(undefined); setTime(undefined); }} />
          ) : step === 2 && service ? (
            <StepDateTime serviceId={service.id} stylistId={stylistId} date={date} time={time} booked={bookings} onChange={(d, t) => { setDate(d); setTime(t); }} />
          ) : step === 3 ? (
            <StepDetails details={details} setDetails={setDetails} onNext={() => setStep(4)} onBack={() => setStep(2)} />
          ) : step === 4 && service && date && time ? (
            <StepReview {...{ service, stylistId, date, time, details, discount, promo, total, error }} onEdit={setStep} onConfirm={confirm} />
          ) : null}
        </Animated.View>
      </ScrollView>

      {!result && step < 3 ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Pressable onPress={() => setStep(s => s - 1)} disabled={step === 0} accessibilityRole="button" accessibilityLabel="Back" style={[styles.back, step === 0 && { opacity: 0 }]}>
            <ArrowLeft size={16} color={colors.mocha} /><Text style={styles.backText}>Back</Text>
          </Pressable>
          <Button label="Continue" icon={<ArrowRight size={16} color={colors.ivory} />} disabled={!canContinue} onPress={() => setStep(s => s + 1)} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

/* ---------- Steps ---------- */
function StepService({ selected, onPick }: { selected?: string; onPick: (id: string) => void }) {
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? SERVICES : SERVICES.filter(s => s.category === cat);
  return (
    <View>
      <Text style={type.display(32)}>Choose your service</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginHorizontal: -screenPad }} contentContainerStyle={{ paddingHorizontal: screenPad }}>
        {[{ id: 'all', label: 'All' }, ...SERVICE_CATEGORIES].map(c => <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => setCat(c.id)} />)}
      </ScrollView>
      <View style={{ gap: 10, marginTop: 18 }}>
        {list.map(s => (
          <Pressable key={s.id} onPress={() => onPick(s.id)} accessibilityRole="button" accessibilityState={{ selected: selected === s.id }} style={[styles.pick, selected === s.id && styles.pickOn]}>
            <Photo uri={s.image} style={{ width: 64, height: 64 }} />
            <View style={{ flex: 1 }}>
              <Text style={type.display(20)}>{s.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}><Clock size={12} color={colors.stone} /><Text style={{ fontSize: 12, color: colors.stone }}>{formatDuration(s.durationMin)}</Text></View>
            </View>
            <Text style={{ fontSize: 13, color: colors.ink }}>{formatPrice(s.price)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StepStylist({ serviceId, selected, onPick }: { serviceId: string; selected: string; onPick: (id: string) => void }) {
  const list = stylistsForService(serviceId);
  return (
    <View>
      <Text style={type.display(32)}>Choose your stylist</Text>
      <Text style={[type.body, { marginTop: 6, fontSize: 14 }]}>Pick a favourite, or let us match you with whoever is free at your time.</Text>
      <View style={{ gap: 10, marginTop: 18 }}>
        <Pressable onPress={() => onPick('any')} accessibilityRole="button" accessibilityState={{ selected: selected === 'any' }} style={[styles.pick, selected === 'any' && styles.pickOn]}>
          <View style={{ width: 64, height: 64, backgroundColor: colors.champagne, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 26 }}>★</Text></View>
          <View><Text style={type.display(20)}>Any available</Text><Text style={{ fontSize: 12, color: colors.stone, marginTop: 3 }}>Most openings</Text></View>
        </Pressable>
        {list.map(st => (
          <Pressable key={st.id} onPress={() => onPick(st.id)} accessibilityRole="button" accessibilityState={{ selected: selected === st.id }} style={[styles.pick, selected === st.id && styles.pickOn]}>
            <Photo uri={st.image} style={{ width: 64, height: 64 }} />
            <View style={{ flex: 1 }}><Text style={type.display(20)}>{st.name}</Text><Text style={{ fontSize: 12, color: colors.stone, marginTop: 3 }}>{st.role}</Text></View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StepDateTime({ serviceId, stylistId, date, time, booked, onChange }: { serviceId: string; stylistId: string; date?: string; time?: string; booked: Booking[]; onChange: (d?: string, t?: string) => void }) {
  const today = useMemo(() => salonNow().date, []);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (let i = 0; i <= salon.booking.maxAdvanceDays; i++) {
      const d = addDays(today, i);
      c[d] = computeSlots({ date: d, serviceId, stylistId, booked: booked.filter(b => b.date === d) }).length;
    }
    return c;
  }, [today, serviceId, stylistId, booked]);

  const slots = date ? computeSlots({ date, serviceId, stylistId, booked: booked.filter(b => b.date === date) }) : [];
  const groups: [string, string[]][] = [
    ['Morning', slots.filter(s => Number(s.time.slice(0, 2)) < 12).map(s => s.time)],
    ['Afternoon', slots.filter(s => { const h = Number(s.time.slice(0, 2)); return h >= 12 && h < 17; }).map(s => s.time)],
    ['Evening', slots.filter(s => Number(s.time.slice(0, 2)) >= 17).map(s => s.time)],
  ];

  return (
    <View>
      <Text style={type.display(32)}>Pick a date & time</Text>
      <View style={{ marginTop: 14 }}><Calendar today={today} selected={date} counts={counts} onSelect={d => onChange(d, undefined)} /></View>
      <View style={{ marginTop: 20 }} accessibilityLiveRegion="polite">
        {!date ? <Text style={styles.hint}>Select a date to see available times.</Text> : (
          <>
            <Text style={type.display(22)}>{formatLongDate(date)}</Text>
            {slots.length === 0 ? <Text style={[styles.hint, { marginTop: 10 }]}>No times left on this day. Please choose another date.</Text> : groups.filter(([, t]) => t.length).map(([label, times]) => (
              <View key={label} style={{ marginTop: 14 }}>
                <Text style={[type.eyebrow, { color: colors.stone }]}>{label}</Text>
                <View style={styles.times}>
                  {times.map(t => (
                    <Pressable key={t} onPress={() => onChange(date, t)} accessibilityRole="button" accessibilityState={{ selected: time === t }} style={[styles.time, time === t && styles.timeOn]}>
                      <Text style={[styles.timeText, time === t && { color: colors.ivory }]}>{to12h(t)}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}

/** Defined at module level so the TextInput keeps focus while typing. */
function Field({ label, value, onValue, error, ...rest }: { label: string; value: string; onValue: (v: string) => void; error?: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onValue} placeholderTextColor="rgba(138,125,114,0.7)" accessibilityLabel={label} style={[styles.input, error ? { borderColor: colors.danger } : null, rest.multiline && { minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }]} {...rest} />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function StepDetails({ details, setDetails, onNext, onBack }: { details: Details; setDetails: (d: Details) => void; onNext: () => void; onBack: () => void }) {
  const [touched, setTouched] = useState(false);
  const errors: FieldErrors = validateDetails(details);
  const show = (k: keyof FieldErrors) => (touched ? errors[k] : undefined);
  const set = (k: keyof Details, v: string | boolean) => setDetails({ ...details, [k]: v });
  const next = () => { setTouched(true); if (!Object.keys(errors).length) onNext(); };

  return (
    <View>
      <Text style={type.display(32)}>Your details</Text>
      <Text style={[type.body, { marginTop: 6, fontSize: 14 }]}>So we can confirm and look after you. Your details stay on this phone until you send the booking to the salon.</Text>
      <Field label="Full name" value={details.name} onValue={v => set('name', v)} error={show('name')} autoComplete="name" textContentType="name" placeholder="Ayesha Khan" />
      <Field label="Phone number" value={details.phone} onValue={v => set('phone', v)} error={show('phone')} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" placeholder="+92 300 1234567" />
      <Field label="Email (optional)" value={details.email} onValue={v => set('email', v)} error={show('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" placeholder="you@example.com" />
      <Field label="Notes (optional)" value={details.notes} onValue={v => set('notes', v)} multiline maxLength={500} placeholder="Allergies, inspiration, anything we should know" />
      <Pressable onPress={() => set('consent', !details.consent)} accessibilityRole="checkbox" accessibilityState={{ checked: details.consent }} style={styles.consent}>
        <View style={[styles.box, details.consent && { backgroundColor: colors.gold, borderColor: colors.gold }]}>{details.consent ? <Check size={14} color={colors.ivory} /> : null}</View>
        <Text style={{ flex: 1, color: colors.mocha, fontSize: 14, lineHeight: 20 }}>I agree to be contacted about this booking.</Text>
      </Pressable>
      {show('consent') ? <Text accessibilityRole="alert" style={styles.error}>{errors.consent}</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}><ArrowLeft size={16} color={colors.mocha} /><Text style={styles.backText}>Back</Text></Pressable>
        <Button label="Review" icon={<ArrowRight size={16} color={colors.ivory} />} onPress={next} />
      </View>
    </View>
  );
}

function StepReview({ service, stylistId, date, time, details, discount, promo, total, error, onEdit, onConfirm }: {
  service: NonNullable<ReturnType<typeof getService>>; stylistId: string; date: string; time: string; details: Details; discount: number; promo?: string; total: number; error: string;
  onEdit: (s: number) => void; onConfirm: () => void;
}) {
  const rows: [string, string, number][] = [
    ['Service', `${service.name} · ${formatDuration(service.durationMin)}`, 0],
    ['Stylist', stylistId === 'any' ? 'Any available stylist' : getStylist(stylistId)?.name ?? '', 1],
    ['Date & time', `${formatLongDate(date)}, ${to12h(time)}`, 2],
    ['Your details', `${details.name} · ${details.phone}${details.email ? ' · ' + details.email : ''}`, 3],
  ];
  return (
    <View>
      <Text style={type.display(32)}>Review & confirm</Text>
      <View style={{ marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.sand }}>
        {rows.map(([k, v, s]) => (
          <View key={k} style={styles.reviewRow}>
            <View style={{ flex: 1 }}><Text style={styles.reviewKey}>{k}</Text><Text style={{ marginTop: 3, color: colors.ink, fontSize: 15 }}>{v}</Text></View>
            <Pressable onPress={() => onEdit(s)} accessibilityRole="button" accessibilityLabel={`Edit ${k}`} style={{ minHeight: 44, justifyContent: 'center', paddingLeft: 12 }}><Text style={{ color: colors.gold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' }}>Edit</Text></Pressable>
          </View>
        ))}
        {details.notes ? <View style={styles.reviewRow}><View style={{ flex: 1 }}><Text style={styles.reviewKey}>Notes</Text><Text style={{ marginTop: 3, color: colors.ink }}>{details.notes}</Text></View></View> : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewKey}>Estimated total</Text>
          {discount > 0 ? <Text style={{ color: colors.gold, fontSize: 12, marginTop: 2 }}>{salon.offer.percent}% first-visit offer applied ({promo})</Text> : null}
        </View>
        <Text style={type.display(34)}>{formatPrice(total)}</Text>
      </View>
      <Text style={styles.note}>{salon.booking.policy} Final price is confirmed at the salon.</Text>
      {error ? <Text accessibilityRole="alert" style={[styles.error, { marginTop: 14, fontSize: 14 }]}>{error}</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
        <Pressable onPress={() => onEdit(3)} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}><ArrowLeft size={16} color={colors.mocha} /><Text style={styles.backText}>Back</Text></Pressable>
        <Button label="Confirm booking" variant="gold" icon={<Check size={16} color={colors.ivory} />} onPress={onConfirm} />
      </View>
    </View>
  );
}

function Confirmation({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const service = getService(booking.serviceId);
  const stylist = getStylist(booking.stylistId);
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 5 }).start(); }, [pop]);
  const message = bookingMessage(booking);
  return (
    <View style={{ alignItems: 'center', paddingTop: 10 }}>
      <Animated.View style={[styles.tick, { transform: [{ scale: pop }], opacity: pop }]}><Check size={36} color={colors.gold} strokeWidth={2.4} /></Animated.View>
      <Text style={[type.eyebrow, { marginTop: 20 }]}>Booking received</Text>
      <Text style={[type.display(36), { marginTop: 6, textAlign: 'center' }]}>Thank you, {booking.name.split(' ')[0]}.</Text>
      <Text style={[type.body, { textAlign: 'center', marginTop: 10 }]}>Your appointment is saved. <Text style={{ color: colors.ink, fontWeight: '700' }}>One last step:</Text> send it to the salon on WhatsApp so the team can confirm your slot.</Text>
      <View style={styles.ticket}>
        <Text style={{ textAlign: 'center', fontSize: 10.5, letterSpacing: 2.4, textTransform: 'uppercase', color: colors.stone }}>Booking reference</Text>
        <Text style={{ textAlign: 'center', fontFamily: displayFont, fontSize: 32, letterSpacing: 3, color: colors.ink, marginTop: 4 }}>{booking.reference}</Text>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.sand, marginVertical: 14 }} />
        {([['Service', service?.name], ['Stylist', stylist?.name], ['When', `${formatLongDate(booking.date)}, ${to12h(booking.time)}`], ['Estimated total', formatPrice(booking.total)]] as [string, string | undefined][]).map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 4 }}><Text style={{ color: colors.stone }}>{k}</Text><Text style={{ color: colors.ink, flexShrink: 1, textAlign: 'right' }}>{v}</Text></View>
        ))}
      </View>
      <View style={{ width: '100%', gap: 10, marginTop: 22 }}>
        <Button label="Send to salon on WhatsApp" variant="gold" icon={<MessageCircle size={18} color={colors.ivory} />} onPress={() => openWhatsApp(message)} />
        <Button label="Share details" variant="outline" icon={<Share2 size={16} color={colors.ink} />} onPress={() => Share.share({ message })} />
        <Button label="Done" variant="ghost" onPress={onDone} />
      </View>
      <Text style={[styles.note, { textAlign: 'center' }]}>{salon.booking.policy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: screenPad, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.sand },
  bars: { flexDirection: 'row', gap: 6, marginTop: 10 },
  bar: { flex: 1, height: 3, backgroundColor: colors.sand },
  x: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: screenPad, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.sand, backgroundColor: colors.ivory },
  back: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 12 },
  backText: { fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.mocha, fontWeight: '600' },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, borderWidth: 1, borderColor: colors.sand },
  pickOn: { borderColor: colors.ink, backgroundColor: 'rgba(239,227,211,0.6)' },
  hint: { padding: 18, textAlign: 'center', color: colors.stone, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.sand },
  times: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8, marginTop: 8 },
  time: { width: '31.5%', minHeight: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.sand },
  timeOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  timeText: { fontSize: 14, color: colors.ink },
  fieldLabel: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.mocha, fontWeight: '600' },
  input: { marginTop: 6, minHeight: 50, borderWidth: 1, borderColor: colors.sand, backgroundColor: colors.white, paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  error: { marginTop: 6, color: colors.danger, fontSize: 13 },
  consent: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  box: { width: 24, height: 24, borderWidth: 1.5, borderColor: colors.mocha, alignItems: 'center', justifyContent: 'center' },
  reviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.sand },
  reviewKey: { fontSize: 10.5, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.stone },
  note: { marginTop: 14, fontSize: 12.5, lineHeight: 18, color: colors.stone },
  tick: { width: 82, height: 82, borderRadius: 41, backgroundColor: 'rgba(168,132,77,0.15)', alignItems: 'center', justifyContent: 'center' },
  ticket: { width: '100%', marginTop: 24, padding: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sand },
});
