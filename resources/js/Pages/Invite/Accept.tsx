import { Head } from '@inertiajs/react';
import { useInviteAcceptController } from '@/features/invite/useInviteAcceptController';
import { InviteGroupSummary } from '@/features/invite/components/InviteGroupSummary';
import { InvitePlayerForm } from '@/features/invite/components/InvitePlayerForm';
import { RetroInfoCard, RetroSectionHeader } from '@/Components/retro';

interface AcceptProps {
  group: {
    id: number;
    name: string;
    weekday?: number | null;
    time?: string | null;
    location_name: string;
    group_settings?: {
      default_weekday?: number | null;
      default_time?: string | null;
    } | null;
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
              weekday={group.group_settings?.default_weekday ?? group.weekday ?? null}
              time={group.group_settings?.default_time ?? group.time ?? null}
              locationName={group.location_name}
            />

            <InvitePlayerForm
              values={form.values}
              errors={form.errors}
              processing={form.processing}
              canSubmit={form.canSubmit}
              isCheckingPhone={form.isCheckingPhone}
              phoneMessage={form.phoneMessage}
              onChange={form.onChange}
              onPhoneBlur={form.onPhoneBlur}
              onSubmit={form.onSubmit}
            />
          </RetroInfoCard>
        </div>
      </div>
    </div>
  );
}
