import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, Photo, SectionHeader } from '../components/ui';
import { GALLERY, GALLERY_FILTERS, type GalleryItem } from '../data/content';
import { colors, screenPad } from '../theme';

const { width: W } = Dimensions.get('window');
const GAP = 10;
const COL = (W - screenPad * 2 - GAP) / 2;

export function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<(typeof GALLERY_FILTERS)[number]>('All');
  const [open, setOpen] = useState<number | null>(null);
  const items = useMemo(() => (filter === 'All' ? GALLERY : GALLERY.filter(g => g.category === filter)), [filter]);

  // Two-column masonry: place each photo in the shorter column.
  const columns = useMemo(() => {
    const cols: { item: GalleryItem; index: number }[][] = [[], []];
    const heights = [0, 0];
    items.forEach((item, index) => {
      const c = heights[0] <= heights[1] ? 0 : 1;
      cols[c].push({ item, index });
      heights[c] += item.ratio;
    });
    return cols;
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <SectionHeader eyebrow="Our work" title="A portfolio of" italic="transformations." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18, marginBottom: 18 }} contentContainerStyle={{ paddingHorizontal: screenPad }} accessibilityRole="tablist">
          {GALLERY_FILTERS.map(f => <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />)}
        </ScrollView>
        <View style={{ flexDirection: 'row', paddingHorizontal: screenPad, gap: GAP }}>
          {columns.map((col, ci) => (
            <View key={ci} style={{ flex: 1, gap: GAP }}>
              {col.map(({ item, index }) => (
                <Pressable key={item.id} onPress={() => setOpen(index)} accessibilityRole="imagebutton" accessibilityLabel={`${item.category}: ${item.caption}`}>
                  <Photo uri={item.src} style={{ width: COL, height: COL * item.ratio }} />
                  <View style={styles.tag}><Text style={styles.tagText}>{item.caption}</Text></View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <Viewer items={items} index={open} onClose={() => setOpen(null)} />
    </View>
  );
}

/** Full-screen swipeable viewer. */
function Viewer({ items, index, onClose }: { items: GalleryItem[]; index: number | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const ref = useRef<FlatList<GalleryItem>>(null);
  const [cur, setCur] = useState(0);
  const visible = index !== null;
  const shown = visible ? cur : 0;

  const go = (d: number) => {
    const n = (shown + d + items.length) % items.length;
    ref.current?.scrollToIndex({ index: n, animated: true });
    setCur(n);
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} onShow={() => { setCur(index ?? 0); ref.current?.scrollToIndex({ index: index ?? 0, animated: false }); }}>
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <StatusBar barStyle="light-content" />
        <FlatList
          ref={ref}
          data={items}
          horizontal
          pagingEnabled
          keyExtractor={g => g.id}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
          onMomentumScrollEnd={e => setCur(Math.round(e.nativeEvent.contentOffset.x / W))}
          renderItem={({ item }) => (
            <View style={{ width: W, flex: 1, justifyContent: 'center' }}>
              <Photo uri={item.src.replace('w=900', 'w=1400')} style={{ width: W, height: W * 1.3 }} label={item.caption} />
            </View>
          )}
        />
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close viewer" style={[styles.close, { top: insets.top + 8 }]}><X color={colors.ivory} size={26} /></Pressable>
        <Pressable onPress={() => go(-1)} accessibilityRole="button" accessibilityLabel="Previous photo" style={[styles.arrow, { left: 8 }]}><ChevronLeft color={colors.ivory} size={26} /></Pressable>
        <Pressable onPress={() => go(1)} accessibilityRole="button" accessibilityLabel="Next photo" style={[styles.arrow, { right: 8 }]}><ChevronRight color={colors.ivory} size={26} /></Pressable>
        <View style={[styles.caption, { paddingBottom: insets.bottom + 18 }]}>
          <View>
            <Text style={{ color: colors.goldLight, fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', fontWeight: '700' }}>{items[shown]?.category}</Text>
            <Text style={{ color: colors.ivory, fontSize: 24, fontFamily: 'Baskerville' }}>{items[shown]?.caption}</Text>
          </View>
          <Text style={{ color: 'rgba(250,246,240,0.6)' }}>{shown + 1} / {items.length}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tag: { position: 'absolute', left: 0, bottom: 0, right: 0, padding: 8, backgroundColor: 'rgba(27,22,19,0.45)' },
  tagText: { color: colors.ivory, fontSize: 11.5 },
  close: { position: 'absolute', right: 8, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(27,22,19,0.5)', borderRadius: 24 },
  arrow: { position: 'absolute', top: '45%', width: 46, height: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(27,22,19,0.5)', borderRadius: 23 },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 30, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: 'rgba(27,22,19,0.55)' },
});
