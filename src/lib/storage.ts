import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Booking } from './engine';

/** Everything is saved on the device. There is no server. */
const BOOKINGS = 'aurelle:bookings';
const OFFER = 'aurelle:offer-claimed';
const WELCOME_SEEN = 'aurelle:welcome-seen-at';

export async function loadBookings(): Promise<Booking[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKINGS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveBookings(list: Booking[]) {
  try {
    await AsyncStorage.setItem(BOOKINGS, JSON.stringify(list));
  } catch {}
}

export async function loadOfferClaimed() {
  try {
    return (await AsyncStorage.getItem(OFFER)) === '1';
  } catch {
    return false;
  }
}
export async function saveOfferClaimed() {
  try {
    await AsyncStorage.setItem(OFFER, '1');
  } catch {}
}

export async function welcomeSeenAt(): Promise<number> {
  try {
    return Number((await AsyncStorage.getItem(WELCOME_SEEN)) ?? 0);
  } catch {
    return 0;
  }
}
export async function markWelcomeSeen() {
  try {
    await AsyncStorage.setItem(WELCOME_SEEN, String(Date.now()));
  } catch {}
}
