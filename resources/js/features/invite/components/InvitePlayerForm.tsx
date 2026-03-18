import { FormEvent } from 'react';
import { maskPhone } from '@/utils/phone';

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
  onChange: (field: keyof InvitePlayerFormValues, value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function InvitePlayerForm({
  values,
  errors,
  processing,
  onChange,
  onSubmit,
}: InvitePlayerFormProps) {
  return (
    <>
      <h3>Entrar no grupo</h3>
      <form onSubmit={onSubmit} className="form">
        <div className="form__group">
          <label htmlFor="name">Nome completo</label>
          <input
            id="name"
            type="text"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          {errors.name && <p>{errors.name}</p>}
        </div>

        <div className="form__group">
          <label htmlFor="nick">Apelido</label>
          <input
            id="nick"
            type="text"
            value={values.nick}
            onChange={(e) => onChange('nick', e.target.value)}
          />
          {errors.nick && <p>{errors.nick}</p>}
        </div>

        <div className="form__group">
          <label htmlFor="phone">Telefone</label>
          <input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => onChange('phone', maskPhone(e.target.value))}
          />
          {errors.phone && <p>{errors.phone}</p>}
        </div>

        <div className="form__actions">
          <button type="submit" disabled={processing}>
            Participar
          </button>
        </div>
      </form>
    </>
  );
}
