import { useCallback, useSyncExternalStore } from 'react'
import { changeLocale, loadLabels, restoreLocaleFromStorage } from './localeService'
import {
  LOCALE_CHANGE_EVENT,
  getLocale,
  syncFromStorage,
  t as translate,
  tFormat as translateFormat,
  td as translateData,
  type LocaleCode,
} from './t'

let bootstrapped = false
let localeEpoch = 0

function ensureBootstrapped() {
  if (bootstrapped || typeof window === 'undefined') return
  bootstrapped = true
  restoreLocaleFromStorage()
  void loadLabels(getLocale()).catch(() => {})
}

function subscribe(onStoreChange: () => void) {
  ensureBootstrapped()
  const handle = () => {
    syncFromStorage()
    localeEpoch += 1
    onStoreChange()
  }
  window.addEventListener(LOCALE_CHANGE_EVENT, handle)
  window.addEventListener('storage', handle)
  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, handle)
    window.removeEventListener('storage', handle)
  }
}

function getSnapshot(): string {
  ensureBootstrapped()
  syncFromStorage()
  return `${getLocale()}:${localeEpoch}`
}

function getServerSnapshot(): string {
  return 'en:0'
}

/**
 * Reactive i18n hook — re-renders when locale / overlay labels change.
 */
export function useI18n() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const locale = (snapshot.split(':')[0] || 'en') as LocaleCode

  const t = useCallback(
    (key: string, defaultValue = '') => {
      syncFromStorage()
      return translate(key, defaultValue)
    },
    [snapshot],
  )

  const tFormat = useCallback(
    (key: string, defaultValue: string, vars: Record<string, string | number>) => {
      syncFromStorage()
      return translateFormat(key, defaultValue, vars)
    },
    [snapshot],
  )

  const td = useCallback(
    (value: string | null | undefined) => {
      syncFromStorage()
      return translateData(value)
    },
    [snapshot],
  )

  const setLanguage = useCallback(async (code: LocaleCode) => {
    await changeLocale(code)
  }, [])

  return { locale, t, tFormat, td, setLanguage, dir: locale === 'ar' ? 'rtl' : 'ltr' }
}
