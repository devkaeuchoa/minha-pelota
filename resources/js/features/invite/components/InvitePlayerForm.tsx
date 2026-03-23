import { FormEvent } from 'react';
import { maskPhone } from '@/utils/phone';
import { RetroButton, RetroFormField, RetroTextInput } from '@/Components/retro';

interface InvitePlayerFormValues {
  name: string;
  nick: string;
  phone: string;
}

interface InvitePlayerFormErrors {
  name?: string;
  nick?: string;
  phone?: string;
}

interface InvitePlayerFormProps {
  values: InvitePlayerFormValues;
  errors: InvitePlayerFormErrors;
  processing: boolean;
  canSubmit: boolean;
  isCheckingPhone: boolean;
  phoneMessage?: string;
  onChange: (field: keyof InvitePlayerFormValues, value: string) => void;
  onPhoneBlur: () => void;
  onSubmit: (e: FormEvent) => void;
}

export function InvitePlayerForm({
  values,
  errors,
  processing,
  canSubmit,
  isCheckingPhone,
  phoneMessage,
  onChange,
  onPhoneBlur,
  onSubmit,
}: InvitePlayerFormProps) {
  return (
    <>
      <h3 className="retro-text-shadow text-lg tracking-wider text-[#ffd700]">ENTRAR NO GRUPO</h3>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-4">
        <RetroFormField label="NOME COMPLETO" htmlFor="invite_player_name">
          <RetroTextInput
            id="invite_player_name"
            type="text"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          {errors.name && <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.name}</p>}
        </RetroFormField>

        <RetroFormField label="APELIDO" htmlFor="invite_player_nick">
          <RetroTextInput
            id="invite_player_nick"
            type="text"
            value={values.nick}
            onChange={(e) => onChange('nick', e.target.value)}
          />
          {errors.nick && <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.nick}</p>}
        </RetroFormField>

        <RetroFormField label="TELEFONE" htmlFor="invite_player_phone">
          <RetroTextInput
            id="invite_player_phone"
            type="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', maskPhone(e.target.value))}
            onBlur={onPhoneBlur}
          />
          {errors.phone && (
            <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.phone}</p>
          )}
          {phoneMessage ? (
            <p
              className={`retro-text-shadow text-sm ${
                phoneMessage.includes('disponível') ? 'text-[#39ff14]' : 'text-[#ff0055]'
              }`}
            >
              {isCheckingPhone ? 'Verificando telefone...' : phoneMessage}
            </p>
          ) : null}
        </RetroFormField>

        <div className="mt-2 flex gap-3">
          <RetroButton type="submit" variant="success" disabled={processing || !canSubmit}>
            PARTICIPAR
          </RetroButton>
        </div>
      </form>
    </>
  );
}
