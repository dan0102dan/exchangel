import React, { createContext, useContext, useState, useEffect } from 'react'
import defaultTranslations from '../../locales/en.json'

const LocalizationContext = createContext()

export const LocalizationProvider = ({ children }) => {
    const [language, setLanguage] = useState(window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code)
    const [translations, setTranslations] = useState(defaultTranslations)

    useEffect(() => {
        const loadTranslations = async (lang) => {
            try {
                setTranslations(
                    (await import(`../../locales/${lang}.json`)).default
                )
            } catch (error) {
                console.error(`Could not load translations for language: ${lang}`, error)
            }
        }

        if (language)
            loadTranslations(language)
    }, [language])

    const t = (key) => translations[key]

    return (
        <LocalizationContext.Provider value={{ t, setLanguage }}>
            {children}
        </LocalizationContext.Provider>
    )
}

export const useTranslation = () => useContext(LocalizationContext)