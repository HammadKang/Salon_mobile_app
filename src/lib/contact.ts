import { Linking } from 'react-native';
import { salon } from '../config/salon';
import { getService } from '../data/services';
import { getStylist } from '../data/stylists';
import type { Booking } from './engine';
import { formatDuration, formatLongDate, formatPrice, to12h } from './format';

export const callSalon = () => Linking.openURL(`tel:${salon.contact.phone.replace(/[^\d+]/g, '')}`);
export const emailSalon = () => Linking.openURL(`mailto:${salon.contact.email}`);
export const openWhatsApp = (text?: string) =>
  Linking.openURL(`https://wa.me/${salon.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`);

export const fullAddress = () => {
  const a = salon.address;
  return [a.line1, a.area, `${a.city} ${a.postcode}`.trim(), a.country].filter(Boolean).join(', ');
};
export const openDirections = () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`);

/** The message the customer sends to the salon: this is how the booking reaches the salon. */
export const bookingMessage = (b: Booking) => {
  const service = getService(b.serviceId);
  const stylist = getStylist(b.stylistId);
  return [
    `Hello ${salon.name}, I'd like to confirm my appointment:`,
    `Reference: ${b.reference}`,
    `Service: ${service?.name} (${formatDuration(b.durationMin)})`,
    `Stylist: ${stylist?.name ?? 'Any available'}`,
    `When: ${formatLongDate(b.date)}, ${to12h(b.time)}`,
    `Name: ${b.name}`,
    `Phone: ${b.phone}`,
    b.promoCode ? `Offer code: ${b.promoCode}` : '',
    b.notes ? `Notes: ${b.notes}` : '',
    `Estimated total: ${formatPrice(b.total)}`,
  ]
    .filter(Boolean)
    .join('\n');
};
