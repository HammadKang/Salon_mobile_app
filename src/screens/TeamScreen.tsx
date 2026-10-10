import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Reveal } from '../components/Reveal';
import { Photo, SectionHeader } from '../components/ui';
import { STYLISTS } from '../data/stylists';
import { useBook } from '../navigation/useBook';
import { colors, screenPad, type } from '../theme';

export function TeamScreen() {
  const insets = useSafeAreaInsets();
  const book = useBook();
  return (
    <View style={{ flex: 1, backgroundColor: colors.champagne }}>
      <FlatList
        data={STYLISTS}
        keyExtractor={s => s.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 34 }} />}
        ListHeaderComponent={<View style={{ paddingTop: insets.top + 18, paddingBottom: 26 }}><SectionHeader eyebrow="Meet the team" title="The hands behind" italic="the work." /></View>}
        renderItem={({ item, index }) => (
          <Reveal delay={Math.min(index, 3) * 90} style={{ paddingHorizontal: screenPad }}>
            <Photo uri={item.image} style={{ width: '100%', aspectRatio: 4 / 5 }} label={`Portrait of ${item.name}`} />
            <Text style={[type.display(30), { marginTop: 14 }]}>{item.name}</Text>
            <Text style={[type.eyebrow, { marginTop: 4 }]}>{item.role}</Text>
            <Text style={{ marginTop: 8, color: colors.ink, fontSize: 14 }}>{item.specialties.join(' · ')}</Text>
            <Text style={[type.body, { marginTop: 8, fontSize: 15 }]}>{item.bio}</Text>
            <View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
              <Button label={`Book with ${item.name.split(' ')[0]}`} variant="outline" onPress={() => book({ stylistId: item.id })} />
            </View>
          </Reveal>
        )}
      />
    </View>
  );
}
