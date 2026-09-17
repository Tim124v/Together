import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { localeApi } from '../api/locale'
import i18n from '../i18n/config'
import {
  CURRENCY_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  LANGUAGES,
  currenciesForCountry,
  intlLocale,
} from '../i18n/languages'
import { useAuth } from './AuthContext'

const LocaleContext = createContext(null)

function readStoredCurrency() {
  try {
    return localStorage.getItem(CURRENCY_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function LocaleProvider({ children }) {
  const { user, updateUser } = useAuth()
  const { i18n: i18nInstance } = useTranslation()
  const [currency, setCurrencyState] = useState(() => readStoredCurrency() || 'USD')
  const [country, setCountry] = useState(null)
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'EUR', 'GBP'])
  const [geoReady, setGeoReady] = useState(false)

  const applyLanguage = useCallback((lang) => {
    if (!lang) return
    const code = String(lang).slice(0, 2)
    if (!LANGUAGES.some((row) => row.code === code)) return
    i18n.changeLanguage(code)
    document.documentElement.lang = code
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  const applyCurrency = useCallback((code) => {
    if (!code) return
    setCurrencyState(code)
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      let geo = null
      try {
        geo = await localeApi.geo()
      } catch {
        geo = null
      }
      if (cancelled) return
      if (geo?.country) setCountry(geo.country)
      if (geo?.currencies?.length) setAvailableCurrencies(geo.currencies)
      else if (geo?.country) setAvailableCurrencies(currenciesForCountry(geo.country))

      const storedLang = (() => {
        try {
          return localStorage.getItem(LANGUAGE_STORAGE_KEY)
        } catch {
          return null
        }
      })()
      const storedCurrency = readStoredCurrency()

      if (!user?.language && !storedLang && geo?.language) applyLanguage(geo.language)
      if (!user?.currency && !storedCurrency && geo?.currency) applyCurrency(geo.currency)
      setGeoReady(true)
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [applyCurrency, applyLanguage, user?.language, user?.currency])

  useEffect(() => {
    if (user?.language) applyLanguage(user.language)
    if (user?.currency) {
      applyCurrency(user.currency)
      if (user.country) setAvailableCurrencies(currenciesForCountry(user.country))
    }
    if (user?.country) setCountry(user.country)
  }, [user?.language, user?.currency, user?.country, applyLanguage, applyCurrency])

  const saveLocale = useCallback(
    async ({ language, currency: nextCurrency }) => {
      if (language) applyLanguage(language)
      if (nextCurrency) applyCurrency(nextCurrency)
      if (!user) return { language: language || i18n.language, currency: nextCurrency || currency }
      const data = await localeApi.update({ language, currency: nextCurrency })
      if (data.user && updateUser) updateUser(data.user)
      else if (updateUser) {
        updateUser({
          language: data.language || language,
          currency: data.currency || nextCurrency,
        })
      }
      return data
    },
    [applyLanguage, applyCurrency, currency, updateUser, user],
  )

  const value = useMemo(
    () => ({
      language: i18nInstance.language?.slice(0, 2) || 'en',
      currency,
      country,
      availableCurrencies,
      intlLocale: intlLocale(i18nInstance.language),
      geoReady,
      applyLanguage,
      applyCurrency,
      saveLocale,
    }),
    [i18nInstance.language, currency, country, availableCurrencies, geoReady, applyLanguage, applyCurrency, saveLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
