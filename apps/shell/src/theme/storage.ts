import { isRecord, type Palette, type StoredTheme } from './types';

const STORAGE_KEY = 'rib.theme';
const HEX = /^#[0-9a-f]{6}$/i;

function isPalette(value: unknown): value is Palette {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.primary === 'string' &&
    typeof value.secondary === 'string' &&
    typeof value.bodyBg === 'string' &&
    typeof value.bodyColor === 'string' &&
    HEX.test(value.primary) &&
    HEX.test(value.secondary) &&
    HEX.test(value.bodyBg) &&
    HEX.test(value.bodyColor)
  );
}

export function readTheme(): StoredTheme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.mode === 'custom' && isPalette(parsed.custom)) {
      return { mode: 'custom', custom: parsed.custom };
    }
    if (parsed.mode === 'light' || parsed.mode === 'dark') return { mode: parsed.mode };
    return null;
  } catch {
    return null;
  }
}

export function writeTheme(theme: StoredTheme): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}
