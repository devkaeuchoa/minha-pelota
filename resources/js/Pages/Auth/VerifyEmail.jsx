import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function VerifyEmail() {
  return (
    <GuestLayout>
      <Head title="Verificação de conta" />

      <div className="mb-4 text-sm text-gray-600">
        A verificação por e-mail não é utilizada neste sistema. A identificação da conta é feita
        exclusivamente por telefone.
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Link
          href={route('login')}
          className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
        >
          Ir para login
        </Link>
        <Link
          href={route('logout')}
          method="post"
          as="button"
          className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
        >
          Sair
        </Link>
      </div>
    </GuestLayout>
  );
}
