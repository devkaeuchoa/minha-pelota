import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { normalizePhone } from '@/utils/phone';

export function useInviteAcceptController(inviteCode: string) {
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

  return {
    values: data,
    errors,
    processing,
    onChange: setData,
    onSubmit: handleSubmit,
  };
}
