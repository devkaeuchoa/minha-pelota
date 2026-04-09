import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function ForgotPassword() {
  return (
    <GuestLayout>
      <Head title="Recuperação de acesso" />

      <div className="mb-4 text-sm text-gray-600">
        Este sistema usa autenticação somente por telefone. O fluxo de recuperação por e-mail não
        está disponível.
      </div>

      <div className="mt-4">
        <Link href={route('login')} className="text-sm text-gray-700 underline hover:text-gray-900">
          Voltar para o login
        </Link>
      </div>
    </GuestLayout>
  );
}
