import { Head } from '@inertiajs/react';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { formatDateTimePtBr } from '@/utils/datetime';
import {
  RetroInfoCard,
  RetroInlineInfo,
  RetroSectionHeader,
  RetroValueDisplay,
} from '@/Components/retro';
import { PageProps } from '@/types';
import { useLocale } from '@/hooks/useLocale';

interface AdminHomeProps extends PageProps {
  ownerGroupsCount: number;
  pastMatchesCount: number;
  upcomingMatchesCount: number;
  lastMatchDate: string | null;
  nextMatchDate: string | null;
}

export default function AdminHome({
  ownerGroupsCount,
  pastMatchesCount,
  upcomingMatchesCount,
  lastMatchDate,
  nextMatchDate,
}: AdminHomeProps) {
  const { t } = useLocale();
  return (
    <RetroAppShell activeId="home">
      <Head title={t('home.admin.title')} />

      <RetroSectionHeader title={t('home.admin.header')} />
      <RetroInfoCard>
        <div className="flex flex-col gap-3">
          <RetroInlineInfo message={t('home.admin.welcome')} />

          <RetroValueDisplay label={t('home.admin.ownerGroups')} value={String(ownerGroupsCount)} />

          <RetroValueDisplay
            label={t('home.admin.playedMatches')}
            value={String(pastMatchesCount)}
          />
          <RetroValueDisplay
            label={t('home.admin.lastMatch')}
            value={
              lastMatchDate ? formatDateTimePtBr(lastMatchDate) : t('home.admin.noPlayedMatches')
            }
          />

          <RetroValueDisplay
            label={t('home.admin.scheduledMatches')}
            value={String(upcomingMatchesCount)}
          />
          <RetroValueDisplay
            label={t('home.admin.nextMatch')}
            value={
              nextMatchDate ? formatDateTimePtBr(nextMatchDate) : t('home.admin.noScheduledMatches')
            }
          />

          <div className="rounded border-2 border-[#4060c0] bg-[#1e348c] p-3">
            <span className="retro-text-shadow text-base text-[#a0b0ff]">
              {t('home.admin.noticeBoard')}
            </span>
            <p className="mt-2 retro-text-shadow text-sm text-[#e5e7eb]">
              {t('home.admin.noticeBoardMessage')}
            </p>
          </div>
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
