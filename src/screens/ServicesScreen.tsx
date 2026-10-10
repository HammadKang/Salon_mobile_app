import React, { useRef, useState } from 'react';
import { Animated, FlatList, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reveal } from '../components/Reveal';
import { ServiceRow } from '../components/ServiceRow';
import { Chip } from '../components/ui';
import { SERVICES, SERVICE_CATEGORIES } from '../data/services';
import { useBook } from '../navigation/useBook';
import { colors, displayFont, screenPad, type } from '../theme';

export function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const book = useBook();
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? SERVICES : SERVICES.filter(s => s.category === cat);
  const listRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const titleSize = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.78], extrapolate: 'clamp' });

  const pick = (id: string) => {
    setCat(id);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.champagne }}>
      {/* Fixed header: title + categories stay in reach while the list scrolls */}
      <View style={{ paddingTop: insets.top + 10, backgroundColor: colors.champagne, borderBottomWidth: 1, borderBottomColor: 'rgba(217,199,176,0.6)' }}>
        <View style={{ paddingHorizontal: screenPad, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Animated.Text style={{ fontFamily: displayFont, fontSize: 34, color: colors.ink, transform: [{ scale: titleSize }], transformOrigin: 'left center' } as never} accessibilityRole="header">
            Services
          </Animated.Text>
          <Text style={[type.label, { color: colors.stone, marginBottom: 6 }]}>{list.length} treatments</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: screenPad }} accessibilityRole="tablist">
          {[{ id: 'all', label: 'All' }, ...SERVICE_CATEGORIES].map(c => <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => pick(c.id)} />)}
        </ScrollView>
      </View>

      <Animated.FlatList
        ref={listRef as never}
        data={list}
        extraData={cat}
        keyExtractor={s => s.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: screenPad, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        ListHeaderComponent={<Text style={[type.body, { fontSize: 13.5, lineHeight: 20, marginBottom: 16, color: colors.stone }]}>Prices are starting prices and may vary with hair length and detail.</Text>}
        renderItem={({ item, index }) => (
          <Reveal key={cat + item.id} delay={Math.min(index, 4) * 70}>
            <ServiceRow s={item} onBook={() => book({ serviceId: item.id })} />
          </Reveal>
        )}
      />
    </View>
  );
}
