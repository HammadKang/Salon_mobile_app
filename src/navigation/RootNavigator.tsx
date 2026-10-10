import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Images, Scissors, User, Users } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { BookingScreen } from '../screens/BookingScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { TeamScreen } from '../screens/TeamScreen';
import { colors } from '../theme';
import { useBook } from './useBook';
import type { RootStackParamList, TabParamList } from './types';

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
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} /> }} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarIcon: ({ color, size }) => <Scissors color={color} size={size - 2} /> }} />
      <Tab.Screen name="Gallery" component={GalleryScreen} options={{ tabBarIcon: ({ color, size }) => <Images color={color} size={size - 2} /> }} />
      <Tab.Screen name="Team" component={TeamScreen} options={{ tabBarIcon: ({ color, size }) => <Users color={color} size={size - 2} /> }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'Visit', tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} /> }} />
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
