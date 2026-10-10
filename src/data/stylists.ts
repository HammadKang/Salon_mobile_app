import { IMG, photo } from '../lib/images';
import type { CategoryId } from './services';

export type Stylist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  categories: CategoryId[];
  image: string;
  /** weekdays this person does not work (0 = Sunday) */
  daysOff?: number[];
};

export const STYLISTS: Stylist[] = [
  { id: 'emma', name: 'Emma Collins', role: 'Creative Director', bio: 'Twelve seasons of runway and editorial work have shaped her calm, precise approach to cutting and colour.', specialties: ['Precision cuts', 'Balayage'], categories: ['hair', 'color'], image: photo(IMG.portrait1, 800), daysOff: [0] },
  { id: 'olivia', name: 'Olivia Bennett', role: 'Senior Colourist', bio: 'Known for soft, lived-in colour and glossy finishes that look expensive and grow out gracefully.', specialties: ['Blonding', 'Colour correction'], categories: ['color', 'hair'], image: photo(IMG.portrait3, 800), daysOff: [1] },
  { id: 'sophie', name: 'Sophie Carter', role: 'Bridal & Makeup Artist', bio: 'Creates luminous, long-wear looks, with a trial session so you feel completely at ease on the day.', specialties: ['Bridal looks', 'Evening glam'], categories: ['bridal', 'hair'], image: photo(IMG.portrait4, 800), daysOff: [2] },
  { id: 'charlotte', name: 'Charlotte Reed', role: 'Skin Therapist', bio: 'Treats skin with patience and science: tailored facials, calming rituals and honest homecare advice.', specialties: ['Hydration facials', 'Sensitive skin'], categories: ['skin', 'spa', 'wax'], image: photo(IMG.portrait2, 800), daysOff: [3] },
  { id: 'grace', name: 'Grace Mitchell', role: 'Nail Artist', bio: 'From clean minimal manicures to hand-painted detail, always with meticulous, healthy-nail care.', specialties: ['Gel & nail art', 'Pedicures'], categories: ['nails', 'wax'], image: photo(IMG.portrait5, 800), daysOff: [4] },
];

export const getStylist = (id: string) => STYLISTS.find(s => s.id === id);
