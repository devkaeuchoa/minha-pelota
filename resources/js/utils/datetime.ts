export const WEEKDAY_LABELS_PT_BR = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function getWeekdayLabelFromIndex(index: number): string | null {
  if (Number.isNaN(index) || index < 0 || index > 6) {
    return null;
  }

  return WEEKDAY_LABELS_PT_BR[index];
}

export function getWeekdayLabel(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const index = typeof value === 'string' ? parseInt(value, 10) : Number(value);

  return getWeekdayLabelFromIndex(index);
}

