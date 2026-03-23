/* global route */
import { Head, Link, useForm } from '@inertiajs/react';
import { maskPhone } from '@/utils/phone';
import PropTypes from 'prop-types';
import {
  RetroButton,
  RetroCheckbox,
  RetroInfoCard,
  RetroInlineInfo,
  RetroPasswordInput,
  RetroSectionHeader,
  RetroTextInput,
} from '@/Components/retro';

export default function Login({ status }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    phone: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="retro-body-bg retro-scanlines flex min-h-screen flex-col items-center pt-6">
      <Head title="Log in" />

      <div className="w-full max-w-xl px-3">
        <RetroSectionHeader title="LOGIN" />
        <div className="mt-4">
          <RetroInfoCard>
            {status && <RetroInlineInfo message={status} />}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <RetroTextInput
                id="phone"
                type="tel"
                name="phone"
                label="TELEFONE"
                value={data.phone}
                autoComplete="tel"
                autoFocus
                onChange={(e) => setData('phone', maskPhone(e.target.value))}
              />
              {errors.phone && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.phone}</p>
              )}

              <RetroPasswordInput
                id="password"
                name="password"
                label="SENHA"
                value={data.password}
                autoComplete="current-password"
                onChange={(e) => setData('password', e.target.value)}
              />
              {errors.password && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.password}</p>
              )}

              <RetroCheckbox
                label="LEMBRAR DE MIM"
                checked={data.remember}
                onChange={(checked) => setData('remember', checked)}
              />

              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex flex-col w-full text-center items-start gap-3">
                  <RetroButton type="submit" variant="success" disabled={processing}>
                    ENTRAR
                  </RetroButton>
                  <Link
                    href={route('register')}
                    className="retro-text-shadow text-sm text-[#a0b0ff] text-center w-full underline hover:text-white"
                  >
                    Criar conta
                  </Link>
                </div>
              </div>
            </form>
          </RetroInfoCard>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  status: PropTypes.string,
};
