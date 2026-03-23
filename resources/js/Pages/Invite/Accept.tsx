import { Head } from '@inertiajs/react';
import { useInviteAcceptController } from '@/features/invite/useInviteAcceptController';
import { InviteGroupSummary } from '@/features/invite/components/InviteGroupSummary';
import { InvitePlayerForm } from '@/features/invite/components/InvitePlayerForm';
import { RetroInfoCard, RetroSectionHeader } from '@/Components/retro';

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
    <div className="retro-body-bg retro-scanlines flex min-h-screen flex-col items-center pt-6">
      <Head title={`Convite — ${group.name}`} />

      <div className="w-full max-w-xl px-3">
        <RetroSectionHeader title="CONVITE" />

        <div className="mt-4">
          <RetroInfoCard>
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
          </RetroInfoCard>
        </div>
      </div>
    </div>
  );
}
