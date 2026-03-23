/* global route */
import { Head, Link, useForm } from '@inertiajs/react';
import { maskPhone } from '@/utils/phone';
import axios from 'axios';
import { useMemo, useState } from 'react';
import {
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroPasswordInput,
  RetroSectionHeader,
  RetroTextInput,
} from '@/Components/retro';

export default function Register() {
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState(false);
  const [phoneCheckMessage, setPhoneCheckMessage] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    nickname: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const isFormValid = useMemo(() => {
    const requiredFilled =
      data.name.trim().length > 0 &&
      data.phone.replace(/\D/g, '').length >= 10 &&
      data.password.length > 0 &&
      data.password_confirmation.length > 0;
    const passwordsMatch = data.password === data.password_confirmation;

    return requiredFilled && passwordsMatch && phoneAvailable;
  }, [data, phoneAvailable]);

  const checkPhoneAvailability = async () => {
    const normalizedPhone = data.phone.replace(/\D/g, '');
    if (normalizedPhone.length < 10) {
      setPhoneAvailable(false);
      setPhoneCheckMessage('Informe um telefone válido.');
      return;
    }

    setIsCheckingPhone(true);
    setPhoneCheckMessage('Verificando telefone...');

    try {
      const response = await axios.get(route('register.phone-availability'), {
        params: { phone: normalizedPhone },
      });

      setPhoneAvailable(Boolean(response.data?.available));
      setPhoneCheckMessage(response.data?.message ?? '');
    } catch {
      setPhoneAvailable(false);
      setPhoneCheckMessage('Este telefone já está cadastrado.');
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();

    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="retro-body-bg retro-scanlines flex min-h-screen flex-col items-center pt-6">
      <Head title="Register" />

      <div className="w-full max-w-xl px-3">
        <RetroSectionHeader title="CADASTRO" />
        <div className="mt-4">
          <RetroInfoCard>
            <form onSubmit={submit} className="flex flex-col gap-4">
              {phoneCheckMessage ? <RetroInlineInfo message={phoneCheckMessage} /> : null}

              <RetroTextInput
                id="name"
                name="name"
                label="NOME"
                value={data.name}
                autoComplete="name"
                autoFocus
                onChange={(e) => setData('name', e.target.value)}
                required
              />
              {errors.name && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.name}</p>
              )}

              <RetroTextInput
                id="nickname"
                name="nickname"
                label="NICKNAME (OPCIONAL)"
                value={data.nickname}
                autoComplete="nickname"
                onChange={(e) => setData('nickname', e.target.value)}
              />
              {errors.nickname && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.nickname}</p>
              )}

              <RetroTextInput
                id="phone"
                type="tel"
                name="phone"
                label="TELEFONE"
                value={data.phone}
                autoComplete="tel"
                onChange={(e) => {
                  setData('phone', maskPhone(e.target.value));
                  setPhoneAvailable(false);
                  setPhoneCheckMessage('');
                }}
                onBlur={checkPhoneAvailability}
                required
              />
              {errors.phone && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.phone}</p>
              )}

              <RetroPasswordInput
                id="password"
                name="password"
                label="SENHA"
                value={data.password}
                autoComplete="new-password"
                onChange={(e) => setData('password', e.target.value)}
                required
              />
              {errors.password && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">{errors.password}</p>
              )}

              <RetroPasswordInput
                id="password_confirmation"
                name="password_confirmation"
                label="CONFIRMAR SENHA"
                value={data.password_confirmation}
                autoComplete="new-password"
                onChange={(e) => setData('password_confirmation', e.target.value)}
                required
              />
              {errors.password_confirmation && (
                <p className="retro-text-shadow text-sm text-[#ff0055]">
                  {errors.password_confirmation}
                </p>
              )}

              <div className="mt-2 flex flex-col w-full text-center items-start gap-3">
                <RetroButton
                  type="submit"
                  variant="success"
                  disabled={processing || isCheckingPhone || !isFormValid}
                >
                  CADASTRAR
                </RetroButton>
                <Link
                  href={route('login')}
                  className="retro-text-shadow text-sm text-[#a0b0ff] text-center w-full underline hover:text-white"
                >
                  Já tem conta?
                </Link>
              </div>
            </form>
          </RetroInfoCard>
        </div>
      </div>
    </div>
  );
}
