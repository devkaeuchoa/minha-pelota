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
  return (
    <RetroAppShell activeId="home">
      <Head title="Home do admin" />

      <RetroSectionHeader title="HOME DO ADMIN" />
      <RetroInfoCard>
        <div className="flex flex-col gap-3">
          <RetroInlineInfo message="BEM-VINDO! AQUI ESTÁ UM RESUMO RÁPIDO DA SUA GESTÃO." />

          <RetroValueDisplay label="GRUPOS QUE VOCÊ É DONO" value={String(ownerGroupsCount)} />

          <RetroValueDisplay label="PARTIDAS REALIZADAS" value={String(pastMatchesCount)} />
          <RetroValueDisplay
            label="ÚLTIMA PARTIDA"
            value={lastMatchDate ? formatDateTimePtBr(lastMatchDate) : 'Sem partidas realizadas'}
          />

          <RetroValueDisplay label="PARTIDAS AGENDADAS" value={String(upcomingMatchesCount)} />
          <RetroValueDisplay
            label="PRÓXIMA PARTIDA"
            value={nextMatchDate ? formatDateTimePtBr(nextMatchDate) : 'Sem partidas agendadas'}
          />

          <div className="rounded border-2 border-[#4060c0] bg-[#1e348c] p-3">
            <span className="retro-text-shadow text-base text-[#a0b0ff]">QUADRO DE AVISOS</span>
            <p className="mt-2 retro-text-shadow text-sm text-[#e5e7eb]">
              Em breve você poderá publicar e acompanhar avisos por aqui.
            </p>
          </div>
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
