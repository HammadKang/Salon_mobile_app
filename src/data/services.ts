import { IMG, photo } from '../lib/images';

export type CategoryId = 'hair' | 'color' | 'bridal' | 'skin' | 'nails' | 'wax' | 'spa';

export const SERVICE_CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'hair', label: 'Hair' },
  { id: 'color', label: 'Colour' },
  { id: 'bridal', label: 'Bridal & Makeup' },
  { id: 'skin', label: 'Skin' },
  { id: 'nails', label: 'Nails' },
  { id: 'wax', label: 'Waxing' },
  { id: 'spa', label: 'Spa' },
];

export type Service = {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  durationMin: number;
  price: number; // starting price
  image: string;
  promo?: string;
  signature?: boolean;
};

export const SERVICES: Service[] = [
  { id: 'signature-cut', category: 'hair', name: 'Signature Cut & Style', description: 'Consultation, precision cut, wash and a finished blow-dry tailored to your face shape.', durationMin: 60, price: 3500, image: photo(IMG.cut), signature: true },
  { id: 'blowdry', category: 'hair', name: 'Blow-Dry & Styling', description: 'Soft waves, sleek lengths or full volume for any occasion.', durationMin: 45, price: 2000, image: photo(IMG.waves) },
  { id: 'updo', category: 'hair', name: 'Party Updo', description: 'Elegant updos and braids built to last through the whole evening.', durationMin: 60, price: 4500, image: photo(IMG.updoB), promo: 'Popular' },
  { id: 'balayage', category: 'color', name: 'Balayage & Highlights', description: 'Hand-painted dimension that grows out beautifully, finished with a gloss and blow-dry.', durationMin: 180, price: 14000, image: photo(IMG.ash), signature: true },
  { id: 'global-color', category: 'color', name: 'Global Colour', description: 'Rich, even all-over colour with a conditioning treatment.', durationMin: 120, price: 8000, image: photo(IMG.colorApply) },
  { id: 'vivid', category: 'color', name: 'Fashion Colours', description: 'Vivid shades and creative colour work for the bold.', durationMin: 150, price: 12000, image: photo(IMG.vivid), promo: 'New' },
  { id: 'bridal-makeup', category: 'bridal', name: 'Bridal Makeup & Hair', description: 'A complete bridal look with a trial consultation beforehand. Radiant, photo-ready, long-lasting.', durationMin: 180, price: 35000, image: photo(IMG.bridal2), signature: true },
  { id: 'party-makeup', category: 'bridal', name: 'Party Makeup', description: 'Polished evening makeup, from soft glam to statement eyes.', durationMin: 75, price: 7000, image: photo(IMG.makeupArtist) },
  { id: 'hydra-facial', category: 'skin', name: 'Hydrating Facial', description: 'Deep cleanse, gentle exfoliation, mask and massage for glowing, rested skin.', durationMin: 60, price: 5500, image: photo(IMG.facial1), signature: true },
  { id: 'glow-facial', category: 'skin', name: 'Radiance Treatment', description: 'A brightening, targeted facial to even tone and restore glow.', durationMin: 75, price: 7500, image: photo(IMG.facial3), promo: 'Popular' },
  { id: 'manicure', category: 'nails', name: 'Manicure & Pedicure', description: 'Shape, cuticle care, massage and polish for hands and feet.', durationMin: 75, price: 3500, image: photo(IMG.nails1) },
  { id: 'nail-art', category: 'nails', name: 'Nail Art & Gel', description: 'Gel colour with hand-drawn art, from minimal to statement.', durationMin: 90, price: 4500, image: photo(IMG.nails4) },
  { id: 'waxing', category: 'wax', name: 'Waxing & Threading', description: 'Gentle, precise hair removal using soothing, skin-friendly wax.', durationMin: 30, price: 1200, image: photo(IMG.wax) },
  { id: 'spa-ritual', category: 'spa', name: 'Relaxation Ritual', description: 'Warm towels, aromatic oils and an unhurried massage to reset body and mind.', durationMin: 90, price: 9000, image: photo(IMG.spa1), signature: true },
  { id: 'head-spa', category: 'spa', name: 'Scalp & Hair Spa', description: 'Deep scalp massage and nourishing hair treatment.', durationMin: 60, price: 4000, image: photo(IMG.spa2) },
];

export const getService = (id: string) => SERVICES.find(s => s.id === id);
