import type { Palette } from './types';

/** Predefined custom palettes. These never go to the theme API. */
export const CUSTOM_PALETTES: readonly Palette[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#0b3d91',
    secondary: '#5c6b7a',
    bodyBg: '#f4f7fb',
    bodyColor: '#1c2430',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '#0f766e',
    secondary: '#5f716b',
    bodyBg: '#f3faf7',
    bodyColor: '#14221e',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    primary: '#8f2d3c',
    secondary: '#6e5b60',
    bodyBg: '#fbf6f6',
    bodyColor: '#2a161a',
  },
];
