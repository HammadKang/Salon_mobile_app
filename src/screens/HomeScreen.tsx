import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MapPin, MessageCircle, Phone, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Modal, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { LogoMark } from '../brand/Logo';
import { AnimatedNumber, PressableScale, ScrollReveal, Twinkles } from '../components/Motion';
import { Reveal } from '../components/Reveal';
import { Hairline, Photo, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { DAY_NAMES, salon } from '../config/salon';
import { TESTIMONIALS, OFFERS } from '../data/content';
import { SERVICES, SERVICE_CATEGORIES } from '../data/services';
import { STYLISTS } from '../data/stylists';
import { callSalon, fullAddress, openDirections, openWhatsApp } from '../lib/contact';
import { formatDuration, formatPrice, to12h } from '../lib/format';
import { IMG, photo } from '../lib/images';
import { markWelcomeSeen, welcomeSeenAt } from '../lib/storage';
import type { TabParamList } from '../navigation/types';
import { useBook } from '../navigation/useBook';
import { colors, screenPad, space, type } from '../theme';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = Math.min(H * 0.86, 760);

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const book = useBook();
  const focusedHome = useIsFocused();
  const [overHero, setOverHero] = useState(true);
  const nav = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { offerClaimed, claimOffer } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;
  const signature = SERVICES.filter(s => s.signature);

  const heroTranslate = scrollY.interpolate({ inputRange: [-200, 0, HERO_H], outputRange: [-60, 0, HERO_H * 0.35], extrapolate: 'clamp' });
  const heroScale = scrollY.interpolate({ inputRange: [-200, 0], outputRange: [1.25, 1], extrapolate: 'clamp' });

  const today = new Date(Date.now() + salon.booking.utcOffsetMinutes * 60_000).getUTCDay();
  const todayHours = salon.hours[today];

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      {focusedHome ? <StatusBar barStyle={overHero ? 'light-content' : 'dark-content'} /> : null}
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => setOverHero(e.nativeEvent.contentOffset.y < HERO_H - 70),
        })}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ height: HERO_H, backgroundColor: colors.ink, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: heroTranslate }, { scale: heroScale }] }]}>
            <Photo uri={photo(IMG.curls, 1400)} style={StyleSheet.absoluteFill as never} label="A stylist shaping soft waves in a bright salon" />
          </Animated.View>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(27,22,19,0.34)' }]} />
          {[30, 42, 54, 66, 78].map((top, i) => (
            <View key={top} style={[StyleSheet.absoluteFill, { top: `${top}%`, backgroundColor: `rgba(27,22,19,${0.1 + i * 0.03})` }]} />
          ))}
          <Twinkles count={8} area={{ width: W, height: HERO_H * 0.62 }} />
          <View style={[styles.heroTop, { paddingTop: insets.top + 14 }]}>
            <Reveal delay={100} distance={10} style={styles.brandRow}>
              <LogoMark size={46} />
              <View>
                <Text style={styles.logo}>{salon.name.toUpperCase()}</Text>
                <Text style={styles.logoSub}>{salon.tagline.toUpperCase()}</Text>
              </View>
            </Reveal>
          </View>
          <View style={styles.heroBottom}>
            <Reveal delay={200}><Text style={[type.eyebrow, { color: colors.goldLight }]}>Hair · Colour · Bridal · Skin · Nails</Text></Reveal>
            <Reveal delay={350}>
              <Text style={styles.headline} accessibilityRole="header">Where beauty becomes <Text style={{ fontStyle: 'italic', color: colors.goldLight }}>an art form.</Text></Text>
            </Reveal>
            <Reveal delay={550}><Text style={styles.sub}>A calm, considered space where skilled hands and honest advice leave you feeling beautifully, effortlessly yourself.</Text></Reveal>
            <Reveal delay={750} style={{ gap: 12, marginTop: 26 }}>
              <Button label="Book Your Appointment" variant="gold" onPress={() => book()} />
              <Button label="Explore Our Services" variant="light" onPress={() => nav.navigate('Services')} />
            </Reveal>
          </View>
        </View>

        {/* Welcome */}
        <ScrollReveal scrollY={scrollY} style={{ paddingVertical: 56 }}>
          <Reveal>
            <SectionHeader eyebrow="Welcome" title="Considered beauty," italic="tailored to you." />
            <Text style={[type.body, { paddingHorizontal: screenPad, marginTop: 14 }]}>{salon.description}</Text>
          </Reveal>
          <View style={styles.stats}>
            {[
              { n: SERVICES.length, l: 'Services' },
              { n: SERVICE_CATEGORIES.length, l: 'Disciplines' },
              { n: STYLISTS.length, l: 'Specialists' },
            ].map(s => (
              <View key={s.l} style={styles.stat}>
                <AnimatedNumber value={s.n} style={type.display(46)} />
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </ScrollReveal>

        {/* Signature */}
        <ScrollReveal scrollY={scrollY} style={{ backgroundColor: 'rgba(239,227,211,0.5)', paddingVertical: 56 }}>
          <SectionHeader eyebrow="Signature treatments" title="The ones" italic="clients return for." />
          <FlatList
            horizontal
            data={signature}
            keyExtractor={s => s.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={W * 0.72 + 14}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: screenPad, paddingTop: 26, gap: 14 }}
            renderItem={({ item }) => (
              <PressableScale onPress={() => book({ serviceId: item.id })} accessibilityRole="button" accessibilityLabel={`Book ${item.name}`} style={{ width: W * 0.72 }}>
                <Photo uri={item.image} style={{ width: '100%', height: W * 0.72 * 1.28 }} />
                <Text style={[type.display(24), { marginTop: 12 }]}>{item.name}</Text>
                <Text style={styles.cardMeta}>{formatDuration(item.durationMin)} · From {formatPrice(item.price)}</Text>
              </PressableScale>
            )}
          />
        </ScrollReveal>

        {/* Offer */}
        {salon.offer.enabled ? (
          <ScrollReveal scrollY={scrollY} style={{ padding: screenPad, paddingTop: 40 }}>
            <View style={styles.offer}>
              <Photo uri={OFFERS[0].image} style={StyleSheet.absoluteFill as never} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(27,22,19,0.66)' }]} />
              <Sparkles color={colors.goldLight} size={22} />
              <Text style={[type.eyebrow, { color: colors.goldLight, marginTop: 10 }]}>First visit</Text>
              <Text style={[type.display(30), { color: colors.ivory, marginTop: 6 }]}>{salon.offer.percent}% off your first appointment</Text>
              <Text style={{ color: 'rgba(250,246,240,0.8)', marginTop: 8, lineHeight: 21 }}>{salon.offer.terms}</Text>
              <View style={{ marginTop: 18, alignSelf: 'flex-start' }}>
                {offerClaimed
                  ? <Text style={{ color: colors.goldLight, fontWeight: '700', letterSpacing: 1.5 }}>OFFER SAVED · APPLIED AT BOOKING</Text>
                  : <Button label="Claim my offer" variant="light" onPress={claimOffer} />}
              </View>
            </View>
          </ScrollReveal>
        ) : null}

        {/* Team */}
        <ScrollReveal scrollY={scrollY} style={{ paddingVertical: 40 }}>
          <SectionHeader eyebrow="Meet the team" title="The hands behind" italic="the work." />
          <FlatList
            horizontal
            data={STYLISTS}
            keyExtractor={s => s.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: screenPad, paddingTop: 24, gap: 14 }}
            renderItem={({ item }) => (
              <PressableScale onPress={() => book({ stylistId: item.id })} accessibilityRole="button" accessibilityLabel={`Book with ${item.name}`} style={{ width: 150 }}>
                <Photo uri={item.image} style={{ width: 150, height: 190 }} />
                <Text style={[type.display(19), { marginTop: 10 }]}>{item.name}</Text>
                <Text style={[type.eyebrow, { fontSize: 9, marginTop: 3 }]}>{item.role}</Text>
              </PressableScale>
            )}
          />
        </ScrollReveal>

        <ScrollReveal scrollY={scrollY}><Testimonials /></ScrollReveal>

        {/* Visit */}
        <ScrollReveal scrollY={scrollY} style={{ padding: screenPad, paddingVertical: 56 }}>
          <Text style={type.eyebrow}>Visit us</Text>
          <Text style={[type.display(34), { marginTop: 10 }]}>Come and <Text style={{ fontStyle: 'italic', color: colors.gold }}>unwind.</Text></Text>
          <Text style={[type.body, { marginTop: 14 }]}>{fullAddress()}</Text>
          <Text style={[type.body, { marginTop: 6 }]}>
            Today ({DAY_NAMES[today]}): {todayHours ? `${to12h(todayHours.open)} – ${to12h(todayHours.close)}` : 'Closed'}
          </Text>
          <View style={{ gap: 10, marginTop: 22 }}>
            <Button label="Call" variant="outline" icon={<Phone size={16} color={colors.ink} />} onPress={callSalon} />
            <Button label="WhatsApp" variant="outline" icon={<MessageCircle size={16} color={colors.ink} />} onPress={() => openWhatsApp()} />
            <Button label="Directions" variant="outline" icon={<MapPin size={16} color={colors.ink} />} onPress={openDirections} />
          </View>
        </ScrollReveal>
        <Hairline />
        <Text style={styles.foot}>© {new Date().getFullYear()} {salon.name} {salon.tagline}</Text>
      </Animated.ScrollView>
      <WelcomeOffer />
    </View>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const w = W - screenPad * 2;
  return (
    <View style={{ backgroundColor: colors.ink, paddingVertical: 56 }}>
      <View style={{ paddingHorizontal: screenPad }}><Text style={[type.eyebrow, { color: colors.goldLight, textAlign: 'center' }]}>Kind words</Text></View>
      <FlatList
        horizontal
        pagingEnabled
        data={TESTIMONIALS}
        keyExtractor={t => t.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
        renderItem={({ item }) => (
          <View style={{ width: W, paddingHorizontal: screenPad, paddingTop: 22 }}>
            <Text style={[type.display(26), { color: colors.ivory, textAlign: 'center', lineHeight: 34 }]}>“{item.text}”</Text>
            <Text style={{ marginTop: 20, textAlign: 'center', fontFamily: type.display(1).fontFamily, fontStyle: 'italic', fontSize: 20, color: colors.goldLight }}>{item.name}</Text>
            <Text style={{ marginTop: 4, textAlign: 'center', fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'rgba(250,246,240,0.6)' }}>{item.service}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 26 }} accessibilityLabel={`Testimonial ${i + 1} of ${TESTIMONIALS.length}`}>
        {TESTIMONIALS.map((t, n) => <View key={t.id} style={{ height: 6, width: n === i ? 26 : 6, borderRadius: 3, backgroundColor: n === i ? colors.gold : 'rgba(250,246,240,0.35)' }} />)}
      </View>
      <View style={{ width: w }} />
    </View>
  );
}

/** First-visit offer: appears once, after a short delay, then not again for a while. Never blocks booking. */
function WelcomeOffer() {
  const focused = useIsFocused();
  const book = useBook();
  const { offerClaimed, claimOffer, ready } = useApp();
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!ready || !focused || !salon.offer.enabled || offerClaimed) return;
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      const seen = await welcomeSeenAt();
      if (Date.now() - seen < salon.welcomeOffer.cooldownDays * 86_400_000) return;
      timer = setTimeout(() => setShow(true), salon.welcomeOffer.delaySec * 1000);
    })();
    return () => clearTimeout(timer);
  }, [ready, focused, offerClaimed]);

  const close = () => { setShow(false); markWelcomeSeen(); };

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <Sparkles color={colors.gold} size={22} />
          <Text style={[type.eyebrow, { marginTop: 10 }]}>Welcome gift</Text>
          <Text style={[type.display(32), { marginTop: 8 }]}>{salon.offer.title}</Text>
          <Text style={[type.body, { marginTop: 10 }]}>{salon.offer.text}</Text>
          {claimed ? (
            <View style={{ marginTop: 20, gap: 10 }}>
              <Text style={{ color: colors.ink, fontWeight: '700' }}>Saved. It is applied automatically when you book.</Text>
              <Button label="Book now" variant="gold" onPress={() => { close(); book(); }} />
              <Button label="Later" variant="ghost" onPress={close} />
            </View>
          ) : (
            <View style={{ marginTop: 20, gap: 8 }}>
              <Button label="Claim my offer" variant="gold" onPress={() => { claimOffer(); setClaimed(true); }} />
              <Button label="No thanks" variant="ghost" onPress={close} />
              <Text style={{ fontSize: 11.5, color: colors.stone, marginTop: 4 }}>{salon.offer.terms}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heroTop: { position: 'absolute', top: 0, left: screenPad, right: screenPad },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { color: colors.ivory, fontSize: 24, letterSpacing: 5, fontFamily: type.display(1).fontFamily },
  logoSub: { color: 'rgba(250,246,240,0.75)', fontSize: 9, letterSpacing: 5.5, marginTop: 4 },
  heroBottom: { position: 'absolute', left: screenPad, right: screenPad, bottom: 34 },
  headline: { fontFamily: type.display(1).fontFamily, fontSize: 46, lineHeight: 50, color: colors.ivory, marginTop: 12, fontWeight: '300' },
  sub: { color: 'rgba(250,246,240,0.85)', fontSize: 16, lineHeight: 24, marginTop: 14 },
  stats: { flexDirection: 'row', marginTop: 34, marginHorizontal: screenPad, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.sand, paddingTop: 22 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { marginTop: 4, fontSize: 10.5, letterSpacing: 2.4, textTransform: 'uppercase', color: colors.stone },
  cardMeta: { marginTop: 4, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.stone },
  offer: { padding: 24, minHeight: 250, justifyContent: 'flex-end', overflow: 'hidden' },
  foot: { textAlign: 'center', fontSize: 12, color: colors.stone, paddingVertical: 28 },
  backdrop: { flex: 1, backgroundColor: 'rgba(27,22,19,0.6)', justifyContent: 'center', padding: space.lg },
  sheet: { backgroundColor: colors.ivory, padding: 26 },
});
