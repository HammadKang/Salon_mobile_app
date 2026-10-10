import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle, StyleProp } from 'react-native';

/** Fade + rise on mount. Native-driver animation, so it stays smooth. */
export function Reveal({ children, delay = 0, distance = 22, style }: { children: React.ReactNode; delay?: number; distance?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}
