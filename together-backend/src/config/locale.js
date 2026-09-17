export const LANGUAGES = ['ru', 'en', 'es', 'fr', 'de', 'it', 'uk', 'pl']
export const CURRENCIES = ['RUB', 'USD', 'EUR', 'GBP', 'UAH', 'PLN']

export const COUNTRY_DEFAULTS = {
  RU: { language: 'ru', currency: 'RUB', currencies: ['RUB', 'USD', 'EUR'] },
  UA: { language: 'uk', currency: 'UAH', currencies: ['UAH', 'USD', 'EUR'] },
  GB: { language: 'en', currency: 'GBP', currencies: ['GBP', 'EUR', 'USD'] },
  US: { language: 'en', currency: 'USD', currencies: ['USD', 'EUR', 'GBP'] },
  ES: { language: 'es', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  FR: { language: 'fr', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  DE: { language: 'de', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  IT: { language: 'it', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  PL: { language: 'pl', currency: 'PLN', currencies: ['PLN', 'EUR', 'USD'] },
  AT: { language: 'de', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  BE: { language: 'fr', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  NL: { language: 'en', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  PT: { language: 'es', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  IE: { language: 'en', currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'] },
  CA: { language: 'en', currency: 'USD', currencies: ['USD', 'EUR', 'GBP'] },
  AU: { language: 'en', currency: 'USD', currencies: ['USD', 'EUR', 'GBP'] },
  MX: { language: 'es', currency: 'USD', currencies: ['USD', 'EUR', 'GBP'] },
  AR: { language: 'es', currency: 'USD', currencies: ['USD', 'EUR', 'GBP'] },
  BY: { language: 'ru', currency: 'RUB', currencies: ['RUB', 'USD', 'EUR'] },
  KZ: { language: 'ru', currency: 'RUB', currencies: ['RUB', 'USD', 'EUR'] },
}

export const FALLBACK_LOCALE = { language: 'en', currency: 'USD', country: 'US', currencies: ['USD', 'EUR', 'GBP'] }

export const STATIC_RATES = {
  USD: { USD: 1, EUR: 0.92, GBP: 0.78, RUB: 92, UAH: 41.5, PLN: 3.95 },
  EUR: { USD: 1.09, EUR: 1, GBP: 0.85, RUB: 100, UAH: 45, PLN: 4.3 },
  GBP: { USD: 1.28, EUR: 1.18, GBP: 1, RUB: 118, UAH: 53, PLN: 5.05 },
  RUB: { USD: 0.011, EUR: 0.01, GBP: 0.0085, RUB: 1, UAH: 0.45, PLN: 0.043 },
  UAH: { USD: 0.024, EUR: 0.022, GBP: 0.019, RUB: 2.22, UAH: 1, PLN: 0.095 },
  PLN: { USD: 0.25, EUR: 0.23, GBP: 0.2, RUB: 23, UAH: 10.5, PLN: 1 },
}

export function localeFromCountry(country) {
  const code = String(country || '').toUpperCase()
  const row = COUNTRY_DEFAULTS[code]
  if (!row) return { ...FALLBACK_LOCALE, country: code || null }
  return { country: code, ...row }
}

export function localeFromAcceptLanguage(header = '') {
  const tag = String(header)
    .split(',')[0]
    ?.trim()
    .split('-')[0]
    ?.toLowerCase()
  if (LANGUAGES.includes(tag)) {
    const byLang = Object.entries(COUNTRY_DEFAULTS).find(([, v]) => v.language === tag)
    if (byLang) return { country: byLang[0], ...byLang[1] }
    return { ...FALLBACK_LOCALE, language: tag }
  }
  return { ...FALLBACK_LOCALE }
}

export function detectRequestLocale(req) {
  const headers = req.headers || {}
  const country = String(
    headers['cf-ipcountry'] ||
      headers['x-vercel-ip-country'] ||
      headers['cloudfront-viewer-country'] ||
      headers['x-country-code'] ||
      '',
  ).toUpperCase()
  if (country && country !== 'XX' && COUNTRY_DEFAULTS[country]) {
    return localeFromCountry(country)
  }
  return localeFromAcceptLanguage(headers['accept-language'])
}
