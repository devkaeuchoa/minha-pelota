import ptBR from './pt-BR';

export type LocaleCode = 'pt-BR';
type LocaleDictionary = Record<string, string>;

const dictionaries: Record<LocaleCode, LocaleDictionary> = {
  'pt-BR': ptBR,
};

export function resolveLocale(input?: string | null): LocaleCode {
  return input === 'pt-BR' ? input : 'pt-BR';
}

export function translate(
  key: string,
  locale: LocaleCode,
  replacements?: Record<string, string | number>,
): string {
  const dictionary = dictionaries[locale];
  const template = dictionary[key] ?? key;

  if (!replacements) {
    return template;
  }

  return Object.entries(replacements).reduce((acc, [replacementKey, value]) => {
    return acc.replaceAll(`{{${replacementKey}}}`, String(value));
  }, template);
}
