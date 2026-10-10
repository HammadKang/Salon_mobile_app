import { salon } from '../config/salon';

export const formatPrice = (n: number) => `${salon.currency.symbol} ${Math.round(n).toLocaleString('en-US')}`;

export const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} hr` : '', m ? `${m} min` : ''].filter(Boolean).join(' ');
};

export const to12h = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Locale-independent date formatting (Hermes Intl support varies by platform). */
export const formatLongDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[wd]}, ${d} ${MONTHS[m - 1]} ${y}`;
};
export const monthLabel = (y: number, m0: number) => `${MONTHS[m0]} ${y}`;
