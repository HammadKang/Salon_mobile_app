/** ONE FILE TO CUSTOMISE THE APP: brand, contact, hours, offer and booking rules. */
export const salon = {
  name: 'Aurelle',
  tagline: 'Salon & Spa',
  description:
    'A quiet, considered space for hair, skin, nails and bridal beauty. Book your appointment in under a minute.',

  contact: {
    phone: '+92 330 2538977',
    whatsapp: '923302538977', // digits only, with country code. Bookings are sent here
    email: 'contactus@aurellesalon.com',
  },

  address: {
    line1: 'Shop 12, Zamzama Boulevard',
    area: 'DHA Phase 5',
    city: 'Karachi',
    postcode: '75500',
    country: 'Pakistan',
  },

  /** 0 = Sunday ... 6 = Saturday. null = closed. */
  hours: {
    0: { open: '12:00', close: '18:00' },
    1: { open: '10:00', close: '20:00' },
    2: { open: '10:00', close: '20:00' },
    3: { open: '10:00', close: '20:00' },
    4: { open: '10:00', close: '20:00' },
    5: { open: '10:00', close: '20:00' },
    6: { open: '10:00', close: '21:00' },
  } as Record<number, { open: string; close: string } | null>,

  /** Whole days the salon is closed ("YYYY-MM-DD") and times already taken. stylistId "*" blocks everyone. */
  closedDates: [] as string[],
  blockedSlots: [] as { date: string; time: string; durationMin: number; stylistId: string }[],

  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
  },

  currency: { symbol: 'Rs' },

  booking: {
    slotIntervalMin: 30,
    minNoticeHours: 3,
    maxAdvanceDays: 60,
    /** Salon time zone as a fixed UTC offset in minutes (Karachi = UTC+5, no daylight saving). */
    utcOffsetMinutes: 300,
    policy:
      'Free rescheduling or cancellation up to 24 hours before your appointment. Late cancellations may be charged. Please arrive 5 minutes early.',
  },

  offer: {
    enabled: true,
    code: 'WELCOME10',
    percent: 10,
    title: 'Your First Visit, Made Special',
    text: 'Enjoy 10% off your first salon experience with us.',
    terms: 'Valid for first-time clients on one booking. Cannot be combined with other offers.',
  },

  welcomeOffer: { delaySec: 12, cooldownDays: 14 },
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
