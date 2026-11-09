import { isRecord, type ApiTheme, type BrandColors } from './types';

/** Light and dark only. Custom palettes are not sent here. */
export const THEME_API_URL = import.meta.env.DEV
  ? '/backoffice-service/theme/getAll'
  : 'http://34.18.92.50:8443/backoffice-service/theme/getAll';

const THEME_DOMAIN_ID = 'BOAPP';

const LIST_KEYS = ['data', 'result', 'results', 'themes', 'themeList', 'content', 'items', 'response', 'body', 'payload'];

const COLOR_KEYS: Record<string, keyof BrandColors> = {
  primary: 'primary',
  primarycolor: 'primary',
  brandcolor: 'primary',
  maincolor: 'primary',
  secondary: 'secondary',
  secondarycolor: 'secondary',
  background: 'bodyBg',
  backgroundcolor: 'bodyBg',
  bodybg: 'bodyBg',
  bgcolor: 'bodyBg',
  pagebackground: 'bodyBg',
  textcolor: 'bodyColor',
  bodycolor: 'bodyColor',
  fontcolor: 'bodyColor',
  text: 'bodyColor',
};

let cachedThemes: ApiTheme[] | null = null;

function normalizeColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const digits = hex[1];
    const full = digits.length === 3 ? digits.split('').map((channel) => channel + channel).join('') : digits;
    return `#${full.toLowerCase()}`;
  }
  const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(text);
  if (!rgb) return null;
  const channels = [rgb[1], rgb[2], rgb[3]].map((channel) => {
    const number = Number(channel);
    if (number > 255) return null;
    return number.toString(16).padStart(2, '0');
  });
  if (channels.some((channel) => channel === null)) return null;
  return `#${channels.join('')}`;
}

function collectColors(source: Record<string, unknown>): Partial<BrandColors> {
  const colors: Partial<BrandColors> = {};
  const visit = (obj: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(obj)) {
      const mapped = COLOR_KEYS[key.toLowerCase().replace(/[^a-z]/g, '')];
      if (!mapped || colors[mapped]) continue;
      const color = normalizeColor(value);
      if (color) colors[mapped] = color;
    }
  };
  visit(source);
  for (const key of ['colors', 'palette', 'themeColors', 'colorScheme', 'config']) {
    const nested = source[key];
    if (isRecord(nested)) visit(nested);
  }
  return colors;
}

function readMode(item: Record<string, unknown>, colors: Partial<BrandColors>): 'light' | 'dark' | null {
  const label = ['mode', 'theme', 'themeName', 'themeType', 'name', 'code', 'themeCode', 'type', 'title', 'label']
    .map((key) => item[key])
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase();
  if (label.includes('dark')) return 'dark';
  if (label.includes('light')) return 'light';
  if (item.isDark === true || item.dark === true || item.darkMode === true) return 'dark';
  if (item.isLight === true || item.light === true) return 'light';
  if (colors.bodyBg) return luminance(colors.bodyBg) < 0.55 ? 'dark' : 'light';
  return null;
}

function luminance(hex: string): number {
  const number = Number.parseInt(hex.slice(1), 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
}

function extractList(payload: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 4) return [];
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  for (const key of LIST_KEYS) {
    if (!(key in payload)) continue;
    const found = extractList(payload[key], depth + 1);
    if (found.length) return found;
  }
  return [];
}

export function normalizeThemes(payload: unknown): ApiTheme[] {
  const records = extractList(payload);
  const source = records.length ? records : isRecord(payload) ? [payload] : [];
  const themes: ApiTheme[] = [];
  for (const item of source) {
    const colors = collectColors(item);
    const mode = readMode(item, colors);
    if (!mode || themes.some((theme) => theme.mode === mode)) continue;
    const name = ['themeName', 'name', 'title', 'label']
      .map((key) => item[key])
      .find((value): value is string => typeof value === 'string');
    themes.push({ mode, name: name ?? mode, colors });
  }
  return themes;
}

export async function fetchApiThemes(): Promise<ApiTheme[]> {
  if (cachedThemes) return cachedThemes;
  const response = await fetch(THEME_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      charset: 'utf-8',
      product: 'dkb_retail',
    },
    body: JSON.stringify({ domainId: THEME_DOMAIN_ID }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Theme service responded with ${response.status}`);
  const themes = normalizeThemes(await response.json());
  if (themes.length) cachedThemes = themes;
  return themes;
}
