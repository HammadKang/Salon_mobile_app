import { salon } from '../config/salon';
import { getService } from '../data/services';
import { STYLISTS, type Stylist } from '../data/stylists';

/** Pure booking logic: no network, no server. */
export type Booking = {
  id: string;
  reference: string;
  serviceId: string;
  stylistId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMin: number;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  promoCode?: string;
  discountPercent: number;
  price: number;
  total: number;
  createdAt: string;
};

export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const pad = (n: number) => String(n).padStart(2, '0');

/** Current date/time at the salon, from a fixed UTC offset. */
export function salonNow(): { date: string; minutes: number } {
  const d = new Date(Date.now() + salon.booking.utcOffsetMinutes * 60_000);
  return { date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

export const weekdayOf = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};

export const isoFromParts = (y: number, m0: number, d: number) => `${y}-${pad(m0 + 1)}-${pad(d)}`;

export function stylistsForService(serviceId: string): Stylist[] {
  const s = getService(serviceId);
  return s ? STYLISTS.filter(st => st.categories.includes(s.category)) : [];
}

type Busy = { stylistId: string; time: string; durationMin: number };

/** Free start times for a date; each lists the stylists free for the whole service. */
export function computeSlots(opts: { date: string; serviceId: string; stylistId: string; booked: Busy[] }): { time: string; stylistIds: string[] }[] {
  const service = getService(opts.serviceId);
  if (!service) return [];
  const hours = salon.hours[weekdayOf(opts.date)];
  if (!hours || salon.closedDates.includes(opts.date)) return [];

  const { date: today, minutes: nowMin } = salonNow();
  if (opts.date < today || opts.date > addDays(today, salon.booking.maxAdvanceDays)) return [];

  const earliest = opts.date === today ? nowMin + salon.booking.minNoticeHours * 60 : 0;
  const open = toMin(hours.open);
  const close = toMin(hours.close);
  const blocked = salon.blockedSlots.filter(b => b.date === opts.date);
  const pool = stylistsForService(opts.serviceId);
  const candidates = opts.stylistId === 'any' ? pool : pool.filter(s => s.id === opts.stylistId);
  const working = candidates.filter(s => !(s.daysOff ?? []).includes(weekdayOf(opts.date)));

  const out: { time: string; stylistIds: string[] }[] = [];
  for (let start = open; start + service.durationMin <= close; start += salon.booking.slotIntervalMin) {
    if (start < earliest) continue;
    const free = working.filter(st =>
      [...opts.booked, ...blocked]
        .filter(b => b.stylistId === st.id || b.stylistId === '*')
        .every(b => start + service.durationMin <= toMin(b.time) || start >= toMin(b.time) + b.durationMin),
    );
    if (free.length) out.push({ time: fromMin(start), stylistIds: free.map(s => s.id) });
  }
  return out;
}

export const discountFor = (code?: string) =>
  code && salon.offer.enabled && code.trim().toUpperCase() === salon.offer.code ? salon.offer.percent : 0;

export const makeReference = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `AUR-${s}`;
};

export const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export type FieldErrors = Partial<Record<'name' | 'phone' | 'email' | 'consent', string>>;

export function validateDetails(v: { name: string; phone: string; email: string; consent: boolean }): FieldErrors {
  const e: FieldErrors = {};
  const name = v.name.trim();
  if (name.length < 2) e.name = 'Please enter your full name.';
  const digits = v.phone.replace(/\D/g, '');
  if (!/^[+\d][\d\s\-()]{6,20}$/.test(v.phone.trim()) || digits.length < 7 || digits.length > 15) e.phone = 'Enter a valid phone number, e.g. +92 300 1234567.';
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "That email doesn't look right.";
  if (!v.consent) e.consent = 'Please agree so we can contact you about this booking.';
  return e;
}
