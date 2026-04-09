import { PropsWithChildren, useMemo } from 'react';
import { LocaleContext } from '@/hooks/useLocale';
import { resolveLocale, translate } from '@/locales';

interface LocaleProviderProps extends PropsWithChildren {
  locale?: string | null;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const resolvedLocale = resolveLocale(locale);

  const value = useMemo(
    () => ({
      locale: resolvedLocale,
      t: (key: string, replacements?: Record<string, string | number>) =>
        translate(key, resolvedLocale, replacements),
    }),
    [resolvedLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
