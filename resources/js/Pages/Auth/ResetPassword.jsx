import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function ResetPassword() {
  return (
    <GuestLayout>
      <Head title="Redefinir senha" />

      <div className="mb-4 text-sm text-gray-600">
        A redefinição de senha por e-mail foi desativada. Use seu telefone para autenticação.
      </div>
      <div className="mt-4">
        <Link href={route('login')} className="text-sm text-gray-700 underline hover:text-gray-900">
          Voltar para o login
        </Link>
      </div>
    </GuestLayout>
  );
}
