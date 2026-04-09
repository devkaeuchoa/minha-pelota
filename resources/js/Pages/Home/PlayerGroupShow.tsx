import { Head } from '@inertiajs/react';
import { GroupRankingEntry, PageProps } from '@/types';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { RetroInfoCard, RetroSectionHeader, RetroValueDisplay } from '@/Components/retro';

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
  return (
    <RetroAppShell activeId="home">
      <Head title={`Detalhes do grupo — ${group.name}`} />

      <RetroSectionHeader title="DETALHES DO GRUPO" />
      <RetroInfoCard>
        <div className="flex flex-col gap-3">
          <RetroValueDisplay label="GRUPO" value={group.name} />
          <RetroValueDisplay label="PERÍODO" value={period.label.toUpperCase()} />
          <RetroValueDisplay label="ARTILHEIRO" value={formatRankingValue(rankings.artilheiro)} />
          <RetroValueDisplay label="GARÇOM" value={formatRankingValue(rankings.garcom)} />
          <RetroValueDisplay label="TÁ EM TODAS" value={formatRankingValue(rankings.ta_em_todas)} />
          <RetroValueDisplay label="SÓ MIGUÉ" value={formatRankingValue(rankings.so_migue)} />
          <RetroValueDisplay label="NEYMAR" value={formatRankingValue(rankings.neymar)} />
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}

function formatRankingValue(entry: GroupRankingEntry | null): string {
  if (!entry) {
    return 'SEM DADOS NO MÊS';
  }

  const displayName = entry.nick || entry.name;

  return `${displayName} (${entry.metric} ${entry.metric_label})`;
}
