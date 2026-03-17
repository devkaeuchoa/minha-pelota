import { Head } from '@inertiajs/react';
import { useInviteAcceptController } from '@/features/invite/useInviteAcceptController';
import { InviteGroupSummary } from '@/features/invite/components/InviteGroupSummary';
import { InvitePlayerForm } from '@/features/invite/components/InvitePlayerForm';

interface AcceptProps {
  group: {
    id: number;
    name: string;
    weekday: number;
    time: string;
    location_name: string;
  };
  inviteCode: string;
}

export default function Accept({ group, inviteCode }: AcceptProps) {
  const form = useInviteAcceptController(inviteCode);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
      <Head title={`Convite — ${group.name}`} />

      <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
        <InviteGroupSummary
          name={group.name}
          weekday={group.weekday}
          time={group.time}
          locationName={group.location_name}
        />

        <InvitePlayerForm
          values={form.values}
          errors={form.errors}
          processing={form.processing}
          onChange={form.onChange}
          onSubmit={form.onSubmit}
        />
      </div>
    </div>
  );
}
