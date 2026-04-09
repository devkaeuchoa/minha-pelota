import { createContext, useContext } from 'react';
import { LocaleCode } from '@/locales';

type TranslationParams = Record<string, string | number>;

export interface LocaleContextValue {
  locale: LocaleCode;
  t: (key: string, replacements?: TranslationParams) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
}
