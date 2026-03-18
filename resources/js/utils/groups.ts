export type RecurrenceValue = 'none' | 'weekly' | 'biweekly' | 'monthly' | null | undefined;

export function getRecurrenceLabel(recurrence: RecurrenceValue): string {
  switch (recurrence) {
    case 'none':
      return 'NENHUMA';
    case 'weekly':
      return 'SEMANAL';
    case 'biweekly':
      return 'QUINZENAL';
    case 'monthly':
      return 'MENSAL';
    default:
      return 'NÃO DEFINIDA';
  }
}

