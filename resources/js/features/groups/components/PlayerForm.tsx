import { FormEvent } from 'react';
import { maskPhone } from '@/utils/phone';

interface PlayerFormValues {
  name: string;
  nick: string;
  phone: string;
}

interface PlayerFormErrors {
  name?: string;
  nick?: string;
  phone?: string;
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
    <section className="section section--tight">
      <h3>Adicionar jogador</h3>
      <form onSubmit={onSubmit} className="form">
        <div className="form__group">
          <label htmlFor="player_name">Nome</label>
          <input
            id="player_name"
            type="text"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          {errors.name && <p>{errors.name}</p>}
        </div>

        <div className="form__group">
          <label htmlFor="player_nick">Apelido</label>
          <input
            id="player_nick"
            type="text"
            value={values.nick}
            onChange={(e) => onChange('nick', e.target.value)}
          />
          {errors.nick && <p>{errors.nick}</p>}
        </div>

        <div className="form__group">
          <label htmlFor="player_phone">Telefone</label>
          <input
            id="player_phone"
            type="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', maskPhone(e.target.value))}
          />
          {errors.phone && <p>{errors.phone}</p>}
        </div>

        <div className="form__actions">
          <button type="submit" disabled={processing}>
            Adicionar
          </button>
        </div>
      </form>
    </section>
  );
}
