import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

/** Returns a function that opens the booking flow, optionally preselecting a service or stylist. */
export function useBook() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (params?: { serviceId?: string; stylistId?: string }) => nav.navigate('Booking', params);
}
