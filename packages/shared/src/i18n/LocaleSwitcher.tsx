import { Constants } from './constants'
import { useI18n } from './useI18n'
import type { LocaleCode } from './t'

const OPTIONS: { code: LocaleCode; labelKey: string; fallback: string }[] = [
  { code: 'en', labelKey: Constants.englishKey, fallback: Constants.english },
  { code: 'ar', labelKey: Constants.arabicKey, fallback: Constants.arabic },
]

type LocaleSwitcherProps = {
  /** `dark` for the primary navbar; `light` for the login page. */
  variant?: 'light' | 'dark'
}

export function LocaleSwitcher({ variant = 'light' }: LocaleSwitcherProps) {
  const { locale, t, setLanguage } = useI18n()
  const labelClass = variant === 'dark' ? 'small text-white-50 d-none d-md-inline' : 'small text-secondary'

  return (
    <label className="d-flex align-items-center gap-2 mb-0" title={t(Constants.languageKey, Constants.language)}>
      <span className={labelClass}>{t(Constants.languageKey, Constants.language)}</span>
      <select
        className="form-select form-select-sm"
        style={{ width: 'auto', minWidth: 110 }}
        value={locale}
        aria-label={t(Constants.languageKey, Constants.language)}
        onChange={(e) => {
          void setLanguage(e.target.value as LocaleCode)
        }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {t(opt.labelKey, opt.fallback)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default LocaleSwitcher
