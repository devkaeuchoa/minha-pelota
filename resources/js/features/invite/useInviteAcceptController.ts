/* global route */
import { FormEvent, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { normalizePhone } from '@/utils/phone';
import axios from 'axios';

export function useInviteAcceptController(inviteCode: string) {
  const { data, setData, transform, post, processing, errors } = useForm({
    name: '',
    nick: '',
    phone: '',
  });
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState('');

  const canSubmit = useMemo(() => {
    const requiredFilled =
      data.name.trim().length > 0 &&
      data.nick.trim().length > 0 &&
      normalizePhone(data.phone).length >= 10;

    return requiredFilled && phoneAvailable && !isCheckingPhone && !processing;
  }, [data, isCheckingPhone, phoneAvailable, processing]);

  const handlePhoneBlur = async () => {
    const normalizedPhone = normalizePhone(data.phone);
    if (normalizedPhone.length < 10) {
      setPhoneAvailable(false);
      setPhoneMessage('Informe um telefone válido.');
      return;
    }

    setIsCheckingPhone(true);
    setPhoneMessage('Verificando telefone...');

    try {
      const response = await axios.get(route('invite.phone-availability', inviteCode), {
        params: { phone: normalizedPhone },
      });

      setPhoneAvailable(Boolean(response.data?.available));
      setPhoneMessage(response.data?.message ?? '');
    } catch (error) {
      setPhoneAvailable(false);
      setPhoneMessage(
        error instanceof Error ? 'Telefone indisponível para convite.' : 'Telefone indisponível.',
      );
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    transform((current) => ({
      ...current,
      phone: normalizePhone(current.phone),
    }));
    post(route('invite.store', inviteCode));
  };

  return {
    values: data,
    errors,
    processing,
    canSubmit,
    isCheckingPhone,
    phoneMessage,
    onChange: (field: 'name' | 'nick' | 'phone', value: string) => {
      setData(field, value);
      if (field === 'phone') {
        setPhoneAvailable(false);
        setPhoneMessage('');
      }
    },
    onPhoneBlur: handlePhoneBlur,
    onSubmit: handleSubmit,
  };
}
