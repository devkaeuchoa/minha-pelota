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

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const dateTimeFormatterPtBr = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: BRAZIL_TIMEZONE,
});

const dateFormatterPtBr = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: BRAZIL_TIMEZONE,
});

const yearMonthFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  timeZone: BRAZIL_TIMEZONE,
});

const dateTimeInputFormatter = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: BRAZIL_TIMEZONE,
});

export function formatDateTimePtBr(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;
  return dateTimeFormatterPtBr.format(date);
}

export function formatDatePtBr(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;
  return dateFormatterPtBr.format(date);
}

export function getBrazilYearMonthKey(date: Date): string {
  return yearMonthFormatter.format(date);
}

export function formatDateTimeLocalInputPtBr(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '';
  return dateTimeInputFormatter.format(date).replace(' ', 'T');
}

export function formatTimeHHMM(value: string | null | undefined): string {
  if (!value) return '-';

  const normalized = value.trim();
  const matched = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!matched) return normalized;

  const hours = matched[1].padStart(2, '0');
  const minutes = matched[2];

  return `${hours}:${minutes}`;
}
