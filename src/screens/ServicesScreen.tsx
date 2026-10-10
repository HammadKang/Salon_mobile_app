import React, { useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reveal } from '../components/Reveal';
import { ServiceRow } from '../components/ServiceRow';
import { Chip, SectionHeader } from '../components/ui';
import { SERVICES, SERVICE_CATEGORIES } from '../data/services';
import { useBook } from '../navigation/useBook';
import { colors, screenPad, type } from '../theme';

export function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const book = useBook();
  const [cat, setCat] = useState('all');
  const list = cat === 'all' ? SERVICES : SERVICES.filter(s => s.category === cat);

  return (
    <View style={{ flex: 1, backgroundColor: colors.champagne }}>
      <FlatList
        data={list}
        keyExtractor={s => s.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 18, paddingBottom: 18 }}>
            <SectionHeader eyebrow="Services & pricing" title="Treatments," italic="thoughtfully made." />
            <Text style={[type.body, { paddingHorizontal: screenPad, marginTop: 10, fontSize: 14, lineHeight: 21 }]}>Prices are starting prices and may vary with hair length and detail.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18 }} contentContainerStyle={{ paddingHorizontal: screenPad }} accessibilityRole="tablist">
              {[{ id: 'all', label: 'All' }, ...SERVICE_CATEGORIES].map(c => <Chip key={c.id} label={c.label} active={cat === c.id} onPress={() => setCat(c.id)} />)}
            </ScrollView>
          </View>
        }
        renderItem={({ item, index }) => (
          <Reveal delay={Math.min(index, 6) * 60} style={{ paddingHorizontal: screenPad }}>
            <ServiceRow s={item} onBook={() => book({ serviceId: item.id })} />
          </Reveal>
        )}
      />
    </View>
  );
}
