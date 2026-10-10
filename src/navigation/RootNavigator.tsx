import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Images, Scissors, User, Users } from 'lucide-react-native';
import React from 'react';
import { Animated, View } from 'react-native';
import { BookingScreen } from '../screens/BookingScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { TeamScreen } from '../screens/TeamScreen';
import { colors } from '../theme';
import { useBook } from './useBook';
import type { RootStackParamList, TabParamList } from './types';

/** Tab icon that springs up a little when its tab becomes active. */
function TabIcon({ Icon, color, size, focused }: { Icon: React.ComponentType<{ color?: string; size?: number }>; color: string; size: number; focused: boolean }) {
  const v = React.useRef(new Animated.Value(focused ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.spring(v, { toValue: focused ? 1 : 0, useNativeDriver: true, friction: 4, tension: 160 }).start();
  }, [focused, v]);
  return (
    <Animated.View style={{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }] }}>
      <Icon color={color} size={size - 2} />
    </Animated.View>
  );
}

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.ivory, card: colors.ivory, text: colors.ink, primary: colors.gold, border: colors.sand } };

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.stone,
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.ivory, borderTopColor: colors.sand },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={Home} color={color} size={size} focused={focused} /> }} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={Scissors} color={color} size={size} focused={focused} /> }} />
      <Tab.Screen name="Gallery" component={GalleryScreen} options={{ tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={Images} color={color} size={size} focused={focused} /> }} />
      <Tab.Screen name="Team" component={TeamScreen} options={{ tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={Users} color={color} size={size} focused={focused} /> }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'Visit', tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={User} color={color} size={size} focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export { View, useBook };
