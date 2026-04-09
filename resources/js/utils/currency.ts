const brlCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function parseBrlCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '0';
  }

  return (Number(digits) / 100).toFixed(2);
}

export function formatBrlCurrencyValue(value: string): string {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return brlCurrencyFormatter.format(0);
  }

  return brlCurrencyFormatter.format(numeric);
}
