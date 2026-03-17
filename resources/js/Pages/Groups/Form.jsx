import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const weekdayOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

export default function Form({ auth, group, submitUrl, method, title }) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: group?.name || '',
    slug: group?.slug || '',
    weekday: group?.weekday || '',
    time: group?.time || '',
    location_name: group?.location_name || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (method === 'post') {
      post(submitUrl);
    } else {
      put(submitUrl);
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} header={<h2>{title}</h2>}>
      <Head title={title} />

      <form onSubmit={handleSubmit} className="form">
        <div className="form__group">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
          />
          {errors.name && <p>{errors.name}</p>}
        </div>

        <div className="form__group">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            type="text"
            value={data.slug}
            onChange={(e) => setData('slug', e.target.value)}
          />
          {errors.slug && <p>{errors.slug}</p>}
        </div>

        <div className="form__group">
          <span>Dia da semana</span>
          <div>
            {weekdayOptions.map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={data.weekday === option.value}
                  onChange={() =>
                    setData('weekday', data.weekday === option.value ? '' : option.value)
                  }
                />{' '}
                {option.label}
              </label>
            ))}
          </div>
          {errors.weekday && <p>{errors.weekday}</p>}
        </div>

        <div className="form__group">
          <label htmlFor="time">Horário</label>
          <input
            id="time"
            type="time"
            value={data.time}
            onChange={(e) => setData('time', e.target.value)}
          />
          {errors.time && <p>{errors.time}</p>}
        </div>

        <div className="form__group">
          <label htmlFor="location_name">Local</label>
          <input
            id="location_name"
            type="text"
            value={data.location_name}
            onChange={(e) => setData('location_name', e.target.value)}
          />
          {errors.location_name && <p>{errors.location_name}</p>}
        </div>

        <div className="form__actions">
          <button type="submit" disabled={processing}>
            Salvar
          </button>
          <Link href="/groups">Cancelar</Link>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
