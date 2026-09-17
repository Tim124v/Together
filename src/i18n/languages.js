/** Каталог языков и валют Together. Новый язык: добавить сюда + JSON в src/locales. */
export const LANGUAGES = [
  { code: 'ru', flag: '🇷🇺', native: 'Русский' },
  { code: 'en', flag: '🇬🇧', native: 'English' },
  { code: 'es', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', flag: '🇫🇷', native: 'Français' },
  { code: 'de', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'it', flag: '🇮🇹', native: 'Italiano' },
  { code: 'uk', flag: '🇺🇦', native: 'Українська' },
  { code: 'pl', flag: '🇵🇱', native: 'Polski' },
]

export const CURRENCIES = [
  { code: 'RUB', symbol: '₽', flag: '🇷🇺' },
  { code: 'USD', symbol: '$', flag: '💵' },
  { code: 'EUR', symbol: '€', flag: '💶' },
  { code: 'GBP', symbol: '£', flag: '💷' },
  { code: 'UAH', symbol: '₴', flag: '🧡' },
  { code: 'PLN', symbol: 'zł', flag: '🔶' },
]

export const REGION_CURRENCIES = {
  RU: ['RUB', 'USD', 'EUR'],
  UA: ['UAH', 'USD', 'EUR'],
  GB: ['GBP', 'EUR', 'USD'],
  US: ['USD', 'EUR', 'GBP'],
  ES: ['EUR', 'USD', 'GBP'],
  FR: ['EUR', 'USD', 'GBP'],
  DE: ['EUR', 'USD', 'GBP'],
  IT: ['EUR', 'USD', 'GBP'],
  PL: ['PLN', 'EUR', 'USD'],
  EU: ['EUR', 'USD', 'GBP'],
}

export const INTL_LOCALES = {
  ru: 'ru-RU',
  en: 'en-GB',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  uk: 'uk-UA',
  pl: 'pl-PL',
}

export const LANGUAGE_STORAGE_KEY = 'together-language'
export const CURRENCY_STORAGE_KEY = 'together-currency'

export function intlLocale(lang = 'en') {
  return INTL_LOCALES[String(lang).slice(0, 2)] || 'en-GB'
}

export function currenciesForCountry(country) {
  const code = String(country || '').toUpperCase()
  return REGION_CURRENCIES[code] || ['USD', 'EUR', 'GBP']
}
