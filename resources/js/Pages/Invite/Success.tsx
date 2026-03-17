import { Head } from '@inertiajs/react';

interface SuccessProps {
  group: {
    name: string;
  };
}

export default function Success({ group }: SuccessProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
      <Head title="Inscrição confirmada" />

      <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
        <h2>Inscrição confirmada</h2>
        <p>
          Você foi adicionado ao grupo <strong>{group.name}</strong>. O organizador poderá ver sua
          inscrição.
        </p>
      </div>
    </div>
  );
}
