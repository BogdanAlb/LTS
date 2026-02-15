import { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./language-context";
import { LANGUAGE_LOCALES, translations } from "./translations";

const DEFAULT_LANGUAGE = "ro";
const DEFAULT_THEME = "night";
const LANGUAGE_STORAGE_KEY = "lts_language";
const THEME_STORAGE_KEY = "lts_theme";
const supportedLanguages = Object.keys(LANGUAGE_LOCALES);
const supportedThemes = ["night", "day"];

function resolvePath(object, path) {
  return path.split(".").reduce((acc, segment) => acc?.[segment], object);
}

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return supportedLanguages.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return supportedThemes.includes(savedTheme) ? savedTheme : DEFAULT_THEME;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.fontStyle = theme === "day" ? "light" : "regular";
  }, [theme]);

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
      theme,
      setTheme,
      supportedThemes,
      t,
    };
  }, [dictionary, language, locale, theme]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
