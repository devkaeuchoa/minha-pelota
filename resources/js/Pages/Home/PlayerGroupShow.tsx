/* global route */
import { Head, router } from '@inertiajs/react';
import { GroupRankingEntry, PageProps } from '@/types';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import {
  RetroButton,
  RetroInfoCard,
  RetroModal,
  RetroSectionHeader,
  RetroValueDisplay,
} from '@/Components/retro';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';

interface PlayerGroupShowProps extends PageProps {
  group: {
    id: number;
    name: string;
  };
  period: {
    start: string;
    end: string;
    label: string;
  };
  rankings: {
    artilheiro: GroupRankingEntry | null;
    garcom: GroupRankingEntry | null;
    ta_em_todas: GroupRankingEntry | null;
    so_migue: GroupRankingEntry | null;
    neymar: GroupRankingEntry | null;
  };
}

export default function PlayerGroupShow({ group, period, rankings }: PlayerGroupShowProps) {
  const { t } = useLocale();
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);

  const handleLeaveGroup = () => {
    setShowLeaveGroupModal(true);
  };

  const handleConfirmLeaveGroup = () => {
    setLeavingGroup(true);
    router.delete(route('api.player.groups.leave', { group: group.id }), {
      preserveScroll: true,
      onFinish: () => {
        setLeavingGroup(false);
        setShowLeaveGroupModal(false);
      },
    });
  };

  return (
    <RetroAppShell activeId="home">
      <Head title={t('home.playerGroupShow.title', { name: group.name })} />

      <RetroSectionHeader title={t('home.playerGroupShow.header')} />
      <RetroInfoCard>
        <div className="flex flex-col gap-3">
          <RetroValueDisplay label={t('home.player.group')} value={group.name} />
          <RetroValueDisplay
            label={t('home.playerGroupShow.period')}
            value={period.label.toUpperCase()}
          />
          <RetroValueDisplay
            label={t('home.playerGroupShow.topScorer')}
            value={formatRankingValue(rankings.artilheiro, t)}
          />
          <RetroValueDisplay
            label={t('home.playerGroupShow.assistLeader')}
            value={formatRankingValue(rankings.garcom, t)}
          />
          <RetroValueDisplay
            label={t('home.playerGroupShow.alwaysThere')}
            value={formatRankingValue(rankings.ta_em_todas, t)}
          />
          <RetroValueDisplay
            label={t('home.playerGroupShow.ghost')}
            value={formatRankingValue(rankings.so_migue, t)}
          />
          <RetroValueDisplay
            label={t('home.playerGroupShow.neymar')}
            value={formatRankingValue(rankings.neymar, t)}
          />
          <div className="flex flex-wrap gap-2">
            <RetroButton type="button" variant="danger" size="sm" onClick={handleLeaveGroup}>
              {t('home.player.leaveGroup')}
            </RetroButton>
          </div>
        </div>
      </RetroInfoCard>

      <RetroModal
        open={showLeaveGroupModal}
        title={t('home.player.leaveGroupTitle')}
        message={<span>{t('home.player.leaveGroupConfirm')}</span>}
        onCancel={() => setShowLeaveGroupModal(false)}
        onConfirm={handleConfirmLeaveGroup}
        confirmText={t('home.player.leaveGroupConfirmButton')}
        cancelText={t('home.player.leaveGroupCancelButton')}
        processing={leavingGroup}
      />
    </RetroAppShell>
  );
}

function formatRankingValue(
  entry: GroupRankingEntry | null,
  t: (key: string, replacements?: Record<string, string | number>) => string,
): string {
  if (!entry) {
    return t('home.playerGroupShow.noDataThisMonth');
  }

  const displayName = entry.nick || entry.name;

  return `${displayName} (${entry.metric} ${entry.metric_label})`;
}
