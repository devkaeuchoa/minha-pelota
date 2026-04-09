/* global route */
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { useLocale } from '@/hooks/useLocale';

export default function UpdateProfileInformation({ className = '' }) {
  const { t } = useLocale();
  const user = usePage().props.auth.user;

  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    name: user.name,
    phone: user.phone ?? '',
  });

  const submit = (e) => {
    e.preventDefault();

    patch(route('profile.update'));
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">{t('profile.infoTitle')}</h2>

        <p className="mt-1 text-sm text-gray-600">{t('profile.infoDescription')}</p>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="name" value={t('common.name')} />

          <TextInput
            id="name"
            className="mt-1 block w-full"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            required
            isFocused
            autoComplete="name"
          />

          <InputError className="mt-2" message={errors.name} />
        </div>

        <div>
          <InputLabel htmlFor="phone" value={t('common.phone')} />

          <TextInput
            id="phone"
            type="tel"
            className="mt-1 block w-full"
            value={data.phone}
            onChange={(e) => setData('phone', e.target.value)}
            required
            autoComplete="tel"
          />

          <InputError className="mt-2" message={errors.phone} />
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>{t('common.save')}</PrimaryButton>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-gray-600">{t('common.saved')}</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}
