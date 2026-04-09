import { normalizePhone } from '@/utils/phone';

export type PhoneValidationResult = {
  valid: boolean;
  normalized: string;
  errorMessage?: string;
};

export function validatePhone(value: string): PhoneValidationResult {
  const normalized = normalizePhone(value);

  if (normalized.length < 10) {
    return {
      valid: false,
      normalized,
      errorMessage: 'Informe um telefone válido.',
    };
  }

  return {
    valid: true,
    normalized,
  };
}

