import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { salon } from '../config/salon';
import { addDays, isoFromParts, weekdayOf } from '../lib/engine';
import { monthLabel } from '../lib/format';
import { colors, displayFont } from '../theme';

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Month calendar. `counts[date]` = number of free slots that day. */
export function Calendar({ today, selected, counts, onSelect }: { today: string; selected?: string; counts: Record<string, number>; onSelect: (iso: string) => void }) {
  const [ty, tm] = today.split('-').map(Number);
  const [view, setView] = useState({ y: ty, m: tm - 1 });
  const maxDate = addDays(today, salon.booking.maxAdvanceDays);
  const [my, mm] = maxDate.split('-').map(Number);

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
    const lead = (first + 6) % 7; // Monday first
    const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
    return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => isoFromParts(view.y, view.m, i + 1))] as (string | null)[];
  }, [view]);

  const weeks = useMemo(() => {
    const rows: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const row = cells.slice(i, i + 7);
      while (row.length < 7) row.push(null);
      rows.push(row);
    }
    return rows;
  }, [cells]);

  const canPrev = view.y > ty || view.m > tm - 1;
  const canNext = view.y < my || view.m < mm - 1;
  const step = (d: number) => setView(v => { const n = new Date(Date.UTC(v.y, v.m + d, 1)); return { y: n.getUTCFullYear(), m: n.getUTCMonth() }; });

  return (
    <View accessibilityLabel="Choose a date">
      <View style={styles.head}>
        <Pressable onPress={() => step(-1)} disabled={!canPrev} accessibilityRole="button" accessibilityLabel="Previous month" style={[styles.nav, !canPrev && { opacity: 0.25 }]}><ChevronLeft size={20} color={colors.ink} /></Pressable>
        <Text style={styles.month} accessibilityLiveRegion="polite">{monthLabel(view.y, view.m)}</Text>
        <Pressable onPress={() => step(1)} disabled={!canNext} accessibilityRole="button" accessibilityLabel="Next month" style={[styles.nav, !canNext && { opacity: 0.25 }]}><ChevronRight size={20} color={colors.ink} /></Pressable>
      </View>
      <View style={styles.week}>{WEEK.map(w => <Text key={w} style={styles.weekText}>{w}</Text>)}</View>
      <View>
        {weeks.map((row, wi) => (
          <View key={wi} style={styles.weekRow}>
            {row.map((iso, i) => {
              if (!iso) return <View key={'e' + i} style={styles.cell} />;
              const closed = !salon.hours[weekdayOf(iso)];
              const out = iso < today || iso > maxDate;
              const free = counts[iso] ?? 0;
              const disabled = out || closed || free === 0;
              const on = selected === iso;
              return (
                <View key={iso} style={styles.cell}>
                  <Pressable
                    disabled={disabled}
                    onPress={() => onSelect(iso)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on, disabled }}
                    accessibilityLabel={`${iso}${closed ? ', closed' : disabled && !out ? ', fully booked' : ''}`}
                    style={[styles.day, on && styles.dayOn, iso === today && !on && styles.dayToday]}>
                    <Text style={[styles.dayText, on && { color: colors.ivory }, disabled && { color: 'rgba(138,125,114,0.45)' }]}>{Number(iso.slice(8))}</Text>
                  </Pressable>
                  {!disabled && !on && free <= 3 ? <View style={styles.dot} /> : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 10, fontSize: 12, color: colors.stone }}>A gold dot means only a few openings remain that day.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  nav: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  month: { fontFamily: displayFont, fontSize: 22, color: colors.ink },
  week: { flexDirection: 'row' },
  weekText: { flex: 1, textAlign: 'center', paddingVertical: 8, fontSize: 11, letterSpacing: 1.6, color: colors.stone, textTransform: 'uppercase' },
  weekRow: { flexDirection: 'row' },
  cell: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.ink },
  dayToday: { borderWidth: 1, borderColor: colors.gold },
  dayText: { fontSize: 15, color: colors.ink },
  dot: { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold },
});
