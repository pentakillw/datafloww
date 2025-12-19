import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import en from './en'
import es from './es'

const dictionaries = { en, es }

const I18nContext = createContext({ lang: 'es', setLang: () => {}, t: (k) => k })

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang')
    if (saved && dictionaries[saved]) return saved
    const nav = navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es'
    return nav
  })

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  const t = useMemo(() => {
    const dict = dictionaries[lang] || dictionaries.es
    return (key) => {
      const parts = key.split('.')
      let cur = dict
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
        else return key
      }
      return typeof cur === 'string' ? cur : key
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
