import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { normalizePhone, maskPhone } from '@/utils/phone';

interface AcceptProps {
  group: {
    id: number;
    name: string;
    weekday: number;
    time: string;
    location_name: string;
  };
  inviteCode: string;
}

const weekdayLabels = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function Accept({ group, inviteCode }: AcceptProps) {
  const { data, setData, transform, post, processing, errors } = useForm({
    name: '',
    nick: '',
    phone: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    transform((current) => ({
      ...current,
      phone: normalizePhone(current.phone),
    }));
    post(route('invite.store', inviteCode));
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
      <Head title={`Convite — ${group.name}`} />

      <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
        <h2>{group.name}</h2>
        <p>
          {weekdayLabels[group.weekday]} às {group.time} — {group.location_name}
        </p>

        <hr />

        <h3>Entrar no grupo</h3>
        <form onSubmit={handleSubmit} className="form">
          <div className="form__group">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            {errors.name && <p>{errors.name}</p>}
          </div>

          <div className="form__group">
            <label htmlFor="nick">Apelido</label>
            <input
              id="nick"
              type="text"
              value={data.nick}
              onChange={(e) => setData('nick', e.target.value)}
            />
            {errors.nick && <p>{errors.nick}</p>}
          </div>

          <div className="form__group">
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => setData('phone', maskPhone(e.target.value))}
            />
            {errors.phone && <p>{errors.phone}</p>}
          </div>

          <div className="form__actions">
            <button type="submit" disabled={processing}>
              Participar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
