import { FALLBACK_AR as SEED_AR } from './fallbackAr'
import { FALLBACK_EN as SEED_EN } from './fallbackEn'

export const LOCALE_STORAGE_KEY = 'rib-locale'
export const LOCALE_LABELS_STORAGE_KEY = 'rib-locale-labels'
export const LOCALE_CHANGE_EVENT = 'rib-locale-change'

export type LocaleCode = 'en' | 'ar'

type StringMap = Record<string, string>

const FALLBACK_EN: StringMap = { ...SEED_EN }
const FALLBACK_AR: StringMap = { ...SEED_AR }

let currentLocale: LocaleCode = 'en'
let serviceMap: StringMap = {}

function notifyLocaleChange() {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(
      new CustomEvent(LOCALE_CHANGE_EVENT, {
        detail: { locale: currentLocale },
      }),
    )
  } catch {
    // ignore
  }
}

try {
  if (typeof window !== 'undefined') {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (storedLocale === 'ar' || storedLocale === 'en') currentLocale = storedLocale
    const raw = window.localStorage.getItem(LOCALE_LABELS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object') serviceMap = parsed as StringMap
    }
  }
} catch {
  currentLocale = 'en'
  serviceMap = {}
}

/** Kept for API compatibility — seeds are already inlined. */
export async function loadFallbackSeeds(_locale: string = currentLocale) {
  return { en: FALLBACK_EN, ar: FALLBACK_AR }
}

function seedFor(locale: string): StringMap {
  return locale === 'ar' ? FALLBACK_AR : FALLBACK_EN
}

/** Re-read locale + overlay from localStorage. */
export function syncFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (storedLocale === 'ar' || storedLocale === 'en') {
      currentLocale = storedLocale
    }
    const raw = window.localStorage.getItem(LOCALE_LABELS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object') {
        serviceMap = parsed as StringMap
      }
    } else {
      serviceMap = {}
    }
  } catch {
    // ignore
  }
}

export function getLocale(): LocaleCode {
  syncFromStorage()
  return currentLocale
}

export function setLocale(locale: string) {
  currentLocale = locale === 'ar' ? 'ar' : 'en'
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale)
    }
  } catch {
    // ignore
  }
  notifyLocaleChange()
}

function isUnresolvedIdPlaceholder(key: string, value: unknown): boolean {
  if (value == null || value === '') return true
  const s = String(value)
  if (s !== key) return false
  return /_/.test(key)
}

function usableLocaleValue(key: string, value: unknown): string | null {
  if (isUnresolvedIdPlaceholder(key, value)) return null
  return String(value)
}

/**
 * Resolve a label key.
 * Priority: CMS overlay → locale seed → EN seed → defaultValue → key
 */
export function t(key: string | null | undefined, defaultValue = ''): string {
  const k = key == null ? '' : String(key)
  if (!k) return defaultValue || ''

  syncFromStorage()

  if (Object.prototype.hasOwnProperty.call(serviceMap, k)) {
    const fromService = usableLocaleValue(k, serviceMap[k])
    if (fromService != null) return fromService
  }

  const seed = seedFor(currentLocale)
  if (Object.prototype.hasOwnProperty.call(seed, k)) {
    const fromSeed = usableLocaleValue(k, seed[k])
    if (fromSeed != null) return fromSeed
  }

  if (currentLocale !== 'en') {
    const fromEn = usableLocaleValue(k, FALLBACK_EN[k])
    if (fromEn != null) return fromEn
  }

  return defaultValue || k
}

/** Replace `{name}` style placeholders after translation. */
export function tFormat(
  key: string,
  defaultValue: string,
  vars: Record<string, string | number>,
): string {
  let out = t(key, defaultValue)
  for (const [name, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${name}}`, String(value))
  }
  return out
}

/**
 * Translate a backend/API string value.
 * Uses the English API value as the lookup key (hardcoded until a real labels API exists).
 */
export function td(value: string | null | undefined): string {
  if (value == null || value === '') return ''
  return t(value, value)
}

export function setLocaleStrings(map: StringMap | null | undefined) {
  serviceMap = { ...(map || {}) }
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_LABELS_STORAGE_KEY, JSON.stringify(serviceMap))
    }
  } catch {
    // ignore
  }
  notifyLocaleChange()
}

export function resetLocaleStrings() {
  serviceMap = {}
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCALE_LABELS_STORAGE_KEY)
    }
  } catch {
    // ignore
  }
  notifyLocaleChange()
}

export function getServiceLocaleMap(): StringMap {
  return { ...serviceMap }
}

export async function getFallbackInventory() {
  return { en: { ...FALLBACK_EN }, ar: { ...FALLBACK_AR } }
}

export default t
