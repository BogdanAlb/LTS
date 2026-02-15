import { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./language-context";
import { LANGUAGE_LOCALES, translations } from "./translations";

const DEFAULT_LANGUAGE = "ro";
const STORAGE_KEY = "lts_language";
const supportedLanguages = Object.keys(LANGUAGE_LOCALES);

function resolvePath(object, path) {
  return path.split(".").reduce((acc, segment) => acc?.[segment], object);
}

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return supportedLanguages.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const dictionary = translations[language] ?? translations[DEFAULT_LANGUAGE];
  const locale = LANGUAGE_LOCALES[language] ?? LANGUAGE_LOCALES[DEFAULT_LANGUAGE];

  const value = useMemo(() => {
    const t = (key) => {
      const translated = resolvePath(dictionary, key);
      if (translated !== undefined) {
        return translated;
      }
      const fallback = resolvePath(translations[DEFAULT_LANGUAGE], key);
      return fallback ?? key;
    };

    return {
      language,
      locale,
      setLanguage,
      supportedLanguages,
      t,
    };
  }, [dictionary, language, locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
