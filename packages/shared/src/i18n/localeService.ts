import { DEFAULT_LABELS_CRITERIA, fetchLabels, type LabelsCriteria } from './labelsApi'
import {
  getLocale,
  getServiceLocaleMap,
  loadFallbackSeeds,
  resetLocaleStrings,
  setLocale,
  setLocaleStrings,
  t,
  type LocaleCode,
} from './t'

/** Criteria kept for future real API headers (unit / channel / screenId). */
export const LABELS_CRITERIA: LabelsCriteria = { ...DEFAULT_LABELS_CRITERIA }

export function applyDocumentLanguage(code: string) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.lang = code
  root.dir = code === 'ar' ? 'rtl' : 'ltr'
}

const labelsInflight = new Map<string, Promise<Record<string, string>>>()

/**
 * Load labels for the given language.
 * Soft mode: on failure, keep locale switch + fall back to bundled seeds.
 * Today `fetchLabels` is hardcoded; later it will call the real backend.
 */
export function loadLabels(langCode: string = getLocale(), { soft = true }: { soft?: boolean } = {}) {
  const normalized = langCode === 'ar' ? 'ar' : 'en'
  const key = `${normalized}:${soft ? 'soft' : 'hard'}`
  if (labelsInflight.has(key)) return labelsInflight.get(key)!

  const pending = (async () => {
    try {
      await loadFallbackSeeds(normalized)
      const map = await fetchLabels(normalized, LABELS_CRITERIA)
      applyDocumentLanguage(normalized)
      setLocale(normalized)
      setLocaleStrings(map)
      return map
    } catch (error) {
      applyDocumentLanguage(normalized)
      setLocale(normalized)
      if (!soft) throw error
      return getServiceLocaleMap()
    }
  })().finally(() => {
    labelsInflight.delete(key)
  })

  labelsInflight.set(key, pending)
  return pending
}

export async function changeLocale(langCode: string) {
  const previous = getLocale()
  const previousMap = getServiceLocaleMap()
  try {
    await loadLabels(langCode, { soft: false })
    return true
  } catch (error) {
    setLocale(previous)
    setLocaleStrings(previousMap)
    applyDocumentLanguage(previous)
    throw error
  }
}

export function restoreLocaleFromStorage(): LocaleCode {
  const locale = getLocale() || 'en'
  setLocale(locale)
  applyDocumentLanguage(locale)
  void loadFallbackSeeds(locale).catch(() => {})
  return locale
}

export function clearLocaleOverlay() {
  resetLocaleStrings()
  setLocale('en')
  applyDocumentLanguage('en')
}

export { t }
