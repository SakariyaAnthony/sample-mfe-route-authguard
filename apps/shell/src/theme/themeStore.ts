import { notify } from '@bank/shared';
import { applyBootstrapMode, applyBrandColors } from './applyTheme';
import { fetchApiThemes } from './themeApi';
import { readTheme, writeTheme } from './storage';
import type { BrandColors, Palette } from './types';

export interface ThemeState {
  mode: 'light' | 'dark' | 'custom';
  paletteId: string | null;
  loading: boolean;
  error: string | null;
}

const listeners = new Set<() => void>();
let state: ThemeState = { mode: 'light', paletteId: null, loading: false, error: null };
let requestId = 0;

const BOOTSTRAP_COLORS: Record<'light' | 'dark', BrandColors> = {
  light: { primary: '#0d6efd', secondary: '#6c757d', bodyBg: '#ffffff', bodyColor: '#212529' },
  dark: { primary: '#6ea8fe', secondary: '#6c757d', bodyBg: '#212529', bodyColor: '#dee2e6' },
};

function emit(): void {
  listeners.forEach((listener) => listener());
}

function patch(next: Partial<ThemeState>): void {
  state = { ...state, ...next };
  emit();
}

export function getThemeState(): ThemeState {
  return state;
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function hasBrandColors(colors: Partial<BrandColors>): boolean {
  return Boolean(colors.primary || colors.secondary || colors.bodyBg || colors.bodyColor);
}

async function loadApiTheme(mode: 'light' | 'dark', announce: boolean): Promise<void> {
  const id = ++requestId;
  if (announce) patch({ loading: true, error: null });
  try {
    const themes = await fetchApiThemes();
    if (id !== requestId) return;
    const match = themes.find((theme) => theme.mode === mode);
    if (!match) {
      const error = 'The theme service did not include that light or dark theme.';
      patch({ loading: false, error });
      if (announce) notify(error, 'warning');
      return;
    }
    if (hasBrandColors(match.colors)) {
      applyBrandColors({ ...BOOTSTRAP_COLORS[mode], ...match.colors });
    } else {
      applyBootstrapMode(mode);
    }
    patch({ loading: false, error: null });
  } catch {
    if (id !== requestId) return;
    const error = 'Theme service is unavailable. Showing the default colors.';
    patch({ loading: false, error });
    if (announce) notify(error, 'warning');
  }
}

export function initTheme(): void {
  const stored = readTheme();
  if (stored?.mode === 'custom' && stored.custom) {
    state = { mode: 'custom', paletteId: stored.custom.id, loading: false, error: null };
    applyBrandColors(stored.custom);
    return;
  }
  const mode = stored?.mode === 'dark' ? 'dark' : 'light';
  state = { mode, paletteId: null, loading: false, error: null };
  applyBootstrapMode(mode);
  void loadApiTheme(mode, false);
}

export function selectApiTheme(mode: 'light' | 'dark'): void {
  requestId += 1;
  writeTheme({ mode });
  applyBootstrapMode(mode);
  patch({ mode, paletteId: null, loading: false, error: null });
  void loadApiTheme(mode, true);
}

export function selectPalette(palette: Palette): void {
  requestId += 1;
  writeTheme({ mode: 'custom', custom: palette });
  applyBrandColors(palette);
  patch({ mode: 'custom', paletteId: palette.id, loading: false, error: null });
}
