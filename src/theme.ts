import { Platform, TextStyle } from 'react-native';

export const colors = {
  ivory: '#faf6f0',
  champagne: '#efe3d3',
  sand: '#d9c7b0',
  blush: '#ead3cb',
  ink: '#1b1613',
  mocha: '#4a3f38',
  stone: '#8a7d72',
  gold: '#a8844d',
  goldLight: '#cdb07a',
  white: '#ffffff',
  danger: '#a33a2f',
};

/** Elegant system serif for headings. Swap for a bundled font (e.g. Cormorant Garamond) if desired. */
export const displayFont = Platform.select({ ios: 'Baskerville', android: 'serif', default: 'serif' }) as string;

export const type = {
  display: (size: number): TextStyle => ({ fontFamily: displayFont, fontSize: size, lineHeight: size * 1.12, color: colors.ink, fontWeight: '400' }),
  eyebrow: { fontSize: 11, letterSpacing: 3.2, textTransform: 'uppercase', color: colors.gold, fontWeight: '600' } as TextStyle,
  body: { fontSize: 16, lineHeight: 25, color: colors.mocha } as TextStyle,
  label: { fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.ink, fontWeight: '600' } as TextStyle,
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const screenPad = 20;
