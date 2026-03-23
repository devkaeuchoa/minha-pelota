import { FormEvent } from 'react';
import { maskPhone } from '@/utils/phone';
import { RetroButton, RetroFormField, RetroTextInput } from '@/Components/retro';

interface PlayerFormValues {
  name: string;
  nick: string;
  phone: string;
  rating: number;
}

interface PlayerFormErrors {
  name?: string;
  nick?: string;
  phone?: string;
  rating?: string;
}

interface PlayerFormProps {
  values: PlayerFormValues;
  errors: PlayerFormErrors;
  processing: boolean;
  onChange: (field: keyof PlayerFormValues, value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function PlayerForm({ values, errors, processing, onChange, onSubmit }: PlayerFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <RetroFormField label="NOME" htmlFor="player_name">
        <RetroTextInput
          id="player_name"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
        {errors.name && <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.name}</p>}
      </RetroFormField>

      <RetroFormField label="APELIDO" htmlFor="player_nick">
        <RetroTextInput
          id="player_nick"
          value={values.nick}
          onChange={(e) => onChange('nick', e.target.value)}
        />
        {errors.nick && <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.nick}</p>}
      </RetroFormField>

      <RetroFormField label="TELEFONE" htmlFor="player_phone">
        <RetroTextInput
          id="player_phone"
          type="tel"
          value={values.phone}
          onChange={(e) => onChange('phone', maskPhone(e.target.value))}
        />
        {errors.phone && <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.phone}</p>}
      </RetroFormField>

      <RetroFormField label="RATING (1 A 5)" htmlFor="player_rating">
        <RetroTextInput
          id="player_rating"
          type="number"
          min={1}
          max={5}
          value={String(values.rating)}
          onChange={(e) => onChange('rating', e.target.value)}
        />
        {errors.rating && (
          <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.rating}</p>
        )}
      </RetroFormField>

      <div className="mt-2 flex gap-3">
        <RetroButton type="submit" variant="success" disabled={processing}>
          ADICIONAR
        </RetroButton>
      </div>
    </form>
  );
}
