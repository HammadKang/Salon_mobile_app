import { salon } from '../src/config/salon';
import { addDays, computeSlots, discountFor, salonNow, stylistsForService, validateDetails, weekdayOf } from '../src/lib/engine';
import { formatDuration, formatLongDate, to12h } from '../src/lib/format';

/** First future open weekday (not today) that is not a stylist's day off, so tests are date-independent. */
const futureOpenDay = () => {
  let d = addDays(salonNow().date, 2);
  while (!salon.hours[weekdayOf(d)]) d = addDays(d, 1);
  return d;
};

describe('booking engine', () => {
  const date = futureOpenDay();

  test('offers slots inside opening hours only', () => {
    const slots = computeSlots({ date, serviceId: 'signature-cut', stylistId: 'any', booked: [] });
    expect(slots.length).toBeGreaterThan(5);
    const hours = salon.hours[weekdayOf(date)]!;
    expect(slots[0].time >= hours.open).toBe(true);
    // a 60 minute service must finish by closing time
    const last = slots[slots.length - 1].time;
    const [h, m] = last.split(':').map(Number);
    const [ch, cm] = hours.close.split(':').map(Number);
    expect(h * 60 + m + 60).toBeLessThanOrEqual(ch * 60 + cm);
  });

  test('a booked stylist is removed from that time, while others stay available for "any"', () => {
    const before = computeSlots({ date, serviceId: 'signature-cut', stylistId: 'any', booked: [] });
    const target = before.find(s => s.stylistIds.length >= 2)!;
    const [taken, ...others] = target.stylistIds;
    const busy = [{ stylistId: taken, time: target.time, durationMin: 60 }];

    const own = computeSlots({ date, serviceId: 'signature-cut', stylistId: taken, booked: busy });
    expect(own.some(s => s.time === target.time)).toBe(false);

    const any = computeSlots({ date, serviceId: 'signature-cut', stylistId: 'any', booked: busy }).find(s => s.time === target.time)!;
    expect(any.stylistIds).not.toContain(taken);
    expect(any.stylistIds).toEqual(others);
  });

  test('blocking everyone ("*") removes the slot', () => {
    const s = computeSlots({ date, serviceId: 'manicure', stylistId: 'any', booked: [] })[0];
    const after = computeSlots({ date, serviceId: 'manicure', stylistId: 'any', booked: [{ stylistId: '*', time: s.time, durationMin: 75 }] });
    expect(after.some(x => x.time === s.time)).toBe(false);
  });

  test('past dates and dates beyond the booking window return no slots', () => {
    expect(computeSlots({ date: '2020-01-06', serviceId: 'manicure', stylistId: 'any', booked: [] })).toEqual([]);
    expect(computeSlots({ date: addDays(salonNow().date, salon.booking.maxAdvanceDays + 5), serviceId: 'manicure', stylistId: 'any', booked: [] })).toEqual([]);
  });

  test('closed dates have no slots', () => {
    const closed = date;
    salon.closedDates.push(closed);
    expect(computeSlots({ date: closed, serviceId: 'manicure', stylistId: 'any', booked: [] })).toEqual([]);
    salon.closedDates.pop();
  });

  test('only qualified stylists are offered for a service', () => {
    const ids = stylistsForService('hydra-facial').map(s => s.id);
    expect(ids).toContain('charlotte');
    expect(ids).not.toContain('grace');
  });

  test('welcome code gives the configured discount, anything else gives none', () => {
    expect(discountFor(salon.offer.code)).toBe(salon.offer.percent);
    expect(discountFor(salon.offer.code.toLowerCase())).toBe(salon.offer.percent);
    expect(discountFor('NOPE')).toBe(0);
    expect(discountFor(undefined)).toBe(0);
  });
});

describe('details validation', () => {
  const ok = { name: 'Ayesha Khan', phone: '+92 300 1234567', email: '', consent: true };
  test('accepts valid details', () => expect(validateDetails(ok)).toEqual({}));
  test('rejects short name, bad phone, bad email and missing consent', () => {
    const e = validateDetails({ name: 'A', phone: '12', email: 'nope', consent: false });
    expect(Object.keys(e).sort()).toEqual(['consent', 'email', 'name', 'phone']);
  });
});

describe('formatting', () => {
  test('time, duration and date', () => {
    expect(to12h('13:30')).toBe('1:30 PM');
    expect(to12h('00:00')).toBe('12:00 AM');
    expect(formatDuration(150)).toBe('2 hr 30 min');
    expect(formatLongDate('2026-10-10')).toBe('Saturday, 10 October 2026');
  });
});
