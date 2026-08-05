/* global route */
import { Head, Link } from '@inertiajs/react';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { formatDateTimePtBr } from '@/utils/datetime';
import {
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroPixelIcon,
  RetroSectionHeader,
  RetroThumbCard,
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
  const hasAnyMatches = pastMatchesCount > 0 || upcomingMatchesCount > 0;

  const statCards = [
    {
      key: 'groups',
      title: t('home.admin.ownerGroups'),
      icon: 'groups' as const,
      value: ownerGroupsCount,
      disabled: ownerGroupsCount === 0,
    },
    {
      key: 'played',
      title: t('home.admin.playedMatches'),
      icon: 'flag' as const,
      value: pastMatchesCount,
      disabled: pastMatchesCount === 0,
    },
    {
      key: 'scheduled',
      title: t('home.admin.scheduledMatches'),
      icon: 'calendar' as const,
      value: upcomingMatchesCount,
      disabled: upcomingMatchesCount === 0,
    },
  ];

  const matchCards = [
    {
      key: 'last',
      title: t('home.admin.lastMatch'),
      icon: 'arrow-back' as const,
      value: lastMatchDate ? formatDateTimePtBr(lastMatchDate) : t('home.admin.noPlayedMatches'),
      disabled: !hasAnyMatches,
    },
    {
      key: 'next',
      title: t('home.admin.nextMatch'),
      icon: 'arrow-forward' as const,
      value: nextMatchDate ? formatDateTimePtBr(nextMatchDate) : t('home.admin.noScheduledMatches'),
      disabled: !hasAnyMatches,
    },
  ];

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

          <div className="flex flex-wrap justify-center gap-3">
            {statCards.map((card) => (
              <div key={card.key} className="w-full sm:w-64">
                <RetroThumbCard disabled={card.disabled}>
                  <RetroThumbCard.Title>{card.title}</RetroThumbCard.Title>
                  <RetroThumbCard.Thumb>
                    <RetroPixelIcon name={card.icon} size="sm" />
                  </RetroThumbCard.Thumb>
                  <RetroThumbCard.Body>
                    <RetroThumbCard.Counter>{card.value}</RetroThumbCard.Counter>
                  </RetroThumbCard.Body>
                </RetroThumbCard>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {matchCards.map((card) => (
              <div key={card.key} className="w-full sm:w-64">
                <RetroThumbCard disabled={card.disabled}>
                  <RetroThumbCard.Title>{card.title}</RetroThumbCard.Title>
                  <RetroThumbCard.Thumb>
                    <RetroPixelIcon name={card.icon} size="sm" />
                  </RetroThumbCard.Thumb>
                  <RetroThumbCard.Body>
                    <RetroThumbCard.Text>{card.value}</RetroThumbCard.Text>
                  </RetroThumbCard.Body>
                </RetroThumbCard>
              </div>
            ))}
          </div>

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
