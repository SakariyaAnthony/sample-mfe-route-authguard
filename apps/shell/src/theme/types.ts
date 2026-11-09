export type ThemeMode = 'light' | 'dark' | 'custom';

export interface Palette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bodyBg: string;
  bodyColor: string;
}

export type BrandColors = Pick<Palette, 'primary' | 'secondary' | 'bodyBg' | 'bodyColor'>;

export interface ApiTheme {
  mode: 'light' | 'dark';
  name: string;
  colors: Partial<BrandColors>;
}

export interface StoredTheme {
  mode: ThemeMode;
  custom?: Palette;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
