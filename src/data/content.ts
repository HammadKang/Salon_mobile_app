import { IMG, photo } from '../lib/images';

export type GalleryCategory = 'Hair' | 'Colour' | 'Bridal' | 'Skin' | 'Nails' | 'Spa';
export const GALLERY_FILTERS: ('All' | GalleryCategory)[] = ['All', 'Hair', 'Colour', 'Bridal', 'Skin', 'Nails', 'Spa'];

export type GalleryItem = { id: string; category: GalleryCategory; caption: string; src: string; ratio: number };

/** Portfolio. `ratio` = height / width, used for the masonry layout. */
export const GALLERY: GalleryItem[] = [
  { id: 'g1', category: 'Colour', caption: 'Soft ash balayage', src: photo(IMG.ash, 900), ratio: 1.3 },
  { id: 'g2', category: 'Bridal', caption: 'Bridal glow', src: photo(IMG.bridal1, 900), ratio: 1.35 },
  { id: 'g3', category: 'Hair', caption: 'Sculpted copper updo', src: photo(IMG.updoB, 900), ratio: 1 },
  { id: 'g4', category: 'Skin', caption: 'Hydrating facial', src: photo(IMG.facial1, 900), ratio: 1.3 },
  { id: 'g5', category: 'Nails', caption: 'Mauve & glitter gel', src: photo(IMG.nails3, 900), ratio: 1 },
  { id: 'g6', category: 'Colour', caption: 'Fashion colour', src: photo(IMG.vivid, 900), ratio: 1.3 },
  { id: 'g7', category: 'Hair', caption: 'Textured waves', src: photo(IMG.curls, 900), ratio: 0.8 },
  { id: 'g8', category: 'Bridal', caption: 'Bridal editorial', src: photo(IMG.bridal3, 900), ratio: 1.35 },
  { id: 'g9', category: 'Spa', caption: 'Ritual set-up', src: photo(IMG.spa1, 900), ratio: 1 },
  { id: 'g10', category: 'Nails', caption: 'Minimal nude', src: photo(IMG.nails2, 900), ratio: 1.3 },
  { id: 'g11', category: 'Hair', caption: 'Precision cut', src: photo(IMG.cut, 900), ratio: 1.3 },
  { id: 'g12', category: 'Skin', caption: 'Calming mask', src: photo(IMG.facial2, 900), ratio: 0.8 },
  { id: 'g13', category: 'Bridal', caption: 'Evening makeup', src: photo(IMG.makeupArtist, 900), ratio: 1.3 },
  { id: 'g14', category: 'Spa', caption: 'Cucumber & calm', src: photo(IMG.spa2, 900), ratio: 1.3 },
];

export const TESTIMONIALS = [
  { id: 't1', name: 'Amelia R.', service: 'Balayage', text: 'Emma listened to exactly what I wanted and gave me the softest, most natural colour. I get compliments every single week.' },
  { id: 't2', name: 'Charlotte W.', service: 'Bridal makeup', text: 'From the trial to the wedding morning, everything was calm and beautiful. My makeup lasted all night and looked perfect in every photo.' },
  { id: 't3', name: 'Isabella T.', service: 'Hydrating facial', text: 'The most relaxing hour of my month. My skin felt fresh and glowing for days, and the advice for home care was genuinely helpful.' },
];

export const FAQS = [
  { q: 'How do I book an appointment?', a: 'Tap “Book” anywhere in the app, pick your service, stylist, date and time, and confirm. Then send the booking to the salon on WhatsApp so the team can confirm your slot.' },
  { q: 'Can I change or cancel my booking?', a: 'Yes. Message us on WhatsApp with your booking reference. Rescheduling is free up to 24 hours before your appointment.' },
  { q: 'Do I need a consultation for colour or bridal services?', a: 'We recommend one. Mention it in the notes when booking and we will allow extra time, or book a bridal trial ahead of your big day.' },
  { q: 'Which payment methods do you accept?', a: 'Payment is taken at the salon after your appointment. Please ask the team which payment methods are accepted.' },
  { q: 'How long will my appointment take?', a: 'Each service shows its typical duration. Longer treatments like balayage or bridal can take a little more, depending on hair length and detail.' },
];

export const OFFERS = [
  { id: 'o2', tag: 'Seasonal', title: 'Bridal trial session', text: 'Plan your look early with a styled trial before the big day.', image: photo(IMG.bridal4, 900) },
];
