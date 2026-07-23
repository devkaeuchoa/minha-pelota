/* global route */
import { Head, Link } from '@inertiajs/react';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { formatDateTimePtBr } from '@/utils/datetime';
import {
  RetroButton,
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

          {ownerGroupsCount === 0 && (
            <div className="rounded border-2 border-[#4060c0] bg-[#1e348c] p-3">
              <span className="retro-text-shadow text-base text-[#a0b0ff]">
                {t('home.admin.gettingStarted.header')}
              </span>
              <ul className="mt-2 flex flex-col gap-1">
                <li className="retro-text-shadow text-sm text-[#e5e7eb]">
                  {t('home.admin.gettingStarted.step1')}
                </li>
                <li className="retro-text-shadow text-sm text-[#e5e7eb]">
                  {t('home.admin.gettingStarted.step2')}
                </li>
                <li className="retro-text-shadow text-sm text-[#e5e7eb]">
                  {t('home.admin.gettingStarted.step3')}
                </li>
              </ul>
              <Link href={route('groups.create')} className="mt-3 inline-block">
                <RetroButton size="sm" type="button" variant="success">
                  {t('home.admin.gettingStarted.createGroupCta')}
                </RetroButton>
              </Link>
            </div>
          )}

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
