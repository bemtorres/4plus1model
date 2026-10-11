import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dictionary, type TranslationKey } from "./en";
import { es } from "./es";
import { pt } from "./pt";
import { fr } from "./fr";
import { de } from "./de";
import { zh } from "./zh";
import { ko } from "./ko";

export type LocaleCode = "en" | "es" | "pt" | "fr" | "de" | "zh" | "ko";

export const DICTIONARIES: Record<LocaleCode, Dictionary> = { en, es, pt, fr, de, zh, ko };

export const LOCALES: { code: LocaleCode; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
  { code: "pt", label: "Português", short: "PT" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "zh", label: "中文", short: "中文" },
  { code: "ko", label: "한국어", short: "한국어" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "c4-modeler:locale";

/** Etiqueta `lang` del atributo HTML para cada idioma. */
export const HTML_LANG: Record<LocaleCode, string> = {
  en: "en",
  es: "es",
  pt: "pt",
  fr: "fr",
  de: "de",
  zh: "zh-Hans",
  ko: "ko",
};

export type TranslateParams = Record<string, string | number>;

export function isLocale(value: unknown): value is LocaleCode {
  return typeof value === "string" && value in DICTIONARIES;
}

/** Detecta el idioma del navegador y devuelve el más cercano disponible. */
export function detectLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const base = candidate.toLowerCase().split("-")[0];
    const match = LOCALES.find((locale) => locale.code === base);
    if (match) return match.code;
  }
  return DEFAULT_LOCALE;
}

export function readStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const param = new URLSearchParams(window.location.search).get("lang")?.trim().toLowerCase();
    if (param && isLocale(param)) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, param);
      return param;
    }
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* almacenamiento no disponible */
  }
  return detectLocale();
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function translate(
  locale: LocaleCode,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  return interpolate(dictionary[key] ?? en[key], params);
}

export type TranslateFn = (key: TranslationKey, params?: TranslateParams) => string;

interface LanguageApi {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageApi | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(readStoredLocale);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* sin persistencia */
    }
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  // Mantiene sincronizadas las pestañas (por ejemplo, /about y el editor).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCALE_STORAGE_KEY) return;
      if (isLocale(event.newValue)) setLocaleState(event.newValue);
    };
    const onPopState = () => {
      const param = new URLSearchParams(window.location.search).get("lang")?.trim().toLowerCase();
      if (param && isLocale(param)) setLocaleState(param);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
  }, []);

  const t = useCallback<TranslateFn>(
    (key, params) => translate(locale, key, params),
    [locale],
  );

  const api = useMemo<LanguageApi>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={api}>{children}</LanguageContext.Provider>;
}

function useLanguage(): LanguageApi {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useT debe usarse dentro de <LanguageProvider>");
  return context;
}

/** Función de traducción: `const t = useT(); t("inspector.name")` */
export function useT(): TranslateFn {
  return useLanguage().t;
}

/** Idioma activo y setter. */
export function useLocale(): LanguageApi {
  return useLanguage();
}

export type { Dictionary, TranslationKey };
