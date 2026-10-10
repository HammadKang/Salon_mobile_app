import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Images, Scissors, User, Users } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const ICONS: Record<string, React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>> = {
  Home, Services: Scissors, Gallery: Images, Team: Users, More: User,
};
const LABELS: Record<string, string> = { Home: 'Home', Services: 'Services', Gallery: 'Gallery', Team: 'Team', More: 'Visit' };

/**
 * Custom bottom bar: dark brand surface, a gold indicator that slides to the active tab,
 * and a label that fades in under the active icon only. Tall enough for thumbs, safe-area aware.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const count = state.routes.length;
  const slot = w / count;
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!slot) return;
    Animated.spring(x, { toValue: state.index * slot, useNativeDriver: true, friction: 8, tension: 120 }).start();
  }, [state.index, slot, x]);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]} onLayout={e => setW(e.nativeEvent.layout.width)}>
      {slot > 0 && (
        <Animated.View pointerEvents="none" style={[styles.indicator, { width: slot, transform: [{ translateX: x }] }]}>
          <View style={styles.indicatorBar} />
        </Animated.View>
      )}
      <View style={styles.row}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const Icon = ICONS[route.name];
          const onPress = () => {
            const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigation.navigate(route.name as never);
          };
          return <TabItem key={route.key} focused={focused} label={LABELS[route.name]} Icon={Icon} onPress={onPress} onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })} />;
        })}
      </View>
    </View>
  );
}

function TabItem({ focused, label, Icon, onPress, onLongPress }: { focused: boolean; label: string; Icon: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>; onPress: () => void; onLongPress: () => void }) {
  const v = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: focused ? 1 : 0, useNativeDriver: true, friction: 6, tension: 140 }).start();
  }, [focused, v]);
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label} style={styles.item}>
      <Animated.View style={{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [5, 0] }) }, { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }}>
        <Icon size={23} strokeWidth={focused ? 2 : 1.6} color={focused ? colors.goldLight : 'rgba(250,246,240,0.55)'} />
      </Animated.View>
      <Animated.Text numberOfLines={1} style={[styles.label, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }] }]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.ink,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 16 },
    }),
  },
  row: { flexDirection: 'row' },
  item: { flex: 1, height: 58, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  label: { marginTop: 3, fontSize: 9.5, letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: '700', color: colors.goldLight, height: 12 },
  indicator: { position: 'absolute', top: 0, left: 0, alignItems: 'center' },
  indicatorBar: { width: 28, height: 3, backgroundColor: colors.gold, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
});
