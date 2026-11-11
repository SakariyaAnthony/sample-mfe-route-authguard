/**
 * Shell re-exports shared i18n so remotes and shell share one locale source
 * (`@bank/shared`) via localStorage + `rib-locale-change` events.
 */
export {
  Constants,
  LOCALE_CHANGE_EVENT,
  LOCALE_LABELS_STORAGE_KEY,
  LOCALE_STORAGE_KEY,
  LABELS_CRITERIA,
  DEFAULT_LABELS_CRITERIA,
  LABELS_API_PATH,
  LabelsApiError,
  LocaleSwitcher,
  applyDocumentLanguage,
  changeLocale,
  clearLocaleOverlay,
  fetchLabels,
  getFallbackInventory,
  getLocale,
  getServiceLocaleMap,
  loadFallbackSeeds,
  loadLabels,
  normalizeLabelsMap,
  resetLocaleStrings,
  restoreLocaleFromStorage,
  setLocale,
  setLocaleStrings,
  syncFromStorage,
  t,
  tFormat,
  td,
  useI18n,
} from '@bank/shared';
export type { ConstantKey, LocaleCode, LabelsCriteria, LabelsListResponse } from '@bank/shared';
