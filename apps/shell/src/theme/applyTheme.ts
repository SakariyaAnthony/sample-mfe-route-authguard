import type { BrandColors } from './types';

const INLINE_VARS = [
  '--bs-primary',
  '--bs-primary-rgb',
  '--bs-primary-hover',
  '--bs-primary-active',
  '--bs-secondary',
  '--bs-secondary-rgb',
  '--bs-body-bg',
  '--bs-body-bg-rgb',
  '--bs-body-color',
  '--bs-body-color-rgb',
  '--bs-emphasis-color',
  '--bs-link-color',
  '--bs-link-hover-color',
  '--bs-link-color-rgb',
  '--bs-link-hover-color-rgb',
  '--bs-tertiary-bg',
  '--bs-tertiary-bg-rgb',
  '--bs-focus-ring-color',
  '--brand-surface',
  '--brand-on-primary',
] as const;

function channels(hex: string): string {
  const number = Number.parseInt(hex.slice(1), 16);
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

function mix(hex: string, amount: number): string {
  const number = Number.parseInt(hex.slice(1), 16);
  const parts = [(number >> 16) & 255, (number >> 8) & 255, number & 255].map((channel) => {
    const next = amount < 0 ? channel * (1 + amount) : channel + (255 - channel) * amount;
    return Math.round(Math.min(255, Math.max(0, next)))
      .toString(16)
      .padStart(2, '0');
  });
  return `#${parts.join('')}`;
}

function isDark(hex: string): boolean {
  const number = Number.parseInt(hex.slice(1), 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255 < 0.55;
}

function clearBrand(): void {
  const root = document.documentElement;
  root.removeAttribute('data-brand-colors');
  for (const name of INLINE_VARS) root.style.removeProperty(name);
  document.body.classList.remove('bg-light');
}

export function applyBootstrapMode(mode: 'light' | 'dark'): void {
  clearBrand();
  document.documentElement.setAttribute('data-bs-theme', mode);
}

export function applyBrandColors(colors: BrandColors): void {
  const root = document.documentElement;
  const surface = isDark(colors.bodyBg) ? mix(colors.bodyBg, 0.14) : '#ffffff';
  const onPrimary = isDark(colors.primary) ? '#ffffff' : '#212529';
  const hover = mix(colors.primary, isDark(colors.primary) ? 0.12 : -0.12);
  const active = mix(colors.primary, isDark(colors.primary) ? 0.2 : -0.2);

  root.setAttribute('data-bs-theme', isDark(colors.bodyBg) ? 'dark' : 'light');
  root.setAttribute('data-brand-colors', 'true');
  document.body.classList.remove('bg-light');

  const vars: Record<string, string> = {
    '--bs-primary': colors.primary,
    '--bs-primary-rgb': channels(colors.primary),
    '--bs-primary-hover': hover,
    '--bs-primary-active': active,
    '--bs-secondary': colors.secondary,
    '--bs-secondary-rgb': channels(colors.secondary),
    '--bs-body-bg': colors.bodyBg,
    '--bs-body-bg-rgb': channels(colors.bodyBg),
    '--bs-body-color': colors.bodyColor,
    '--bs-body-color-rgb': channels(colors.bodyColor),
    '--bs-emphasis-color': colors.bodyColor,
    '--bs-link-color': colors.primary,
    '--bs-link-hover-color': hover,
    '--bs-link-color-rgb': channels(colors.primary),
    '--bs-link-hover-color-rgb': channels(hover),
    '--bs-tertiary-bg': surface,
    '--bs-tertiary-bg-rgb': channels(surface),
    '--bs-focus-ring-color': `rgba(${channels(colors.primary)}, 0.25)`,
    '--brand-surface': surface,
    '--brand-on-primary': onPrimary,
  };

  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
}
