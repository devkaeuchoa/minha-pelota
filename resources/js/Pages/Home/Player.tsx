/* global route */
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { PLAYER_NAV_ITEMS } from '@/config/navigation';
import {
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroSectionHeader,
  RetroValueDisplay,
} from '@/Components/retro';

type PresenceStatus = 'going' | 'not_going' | 'pending';

interface PlayerHomeProps extends PageProps {
  status?: string;
  hasGroup: boolean;
  group: {
    id: number;
    name: string;
  } | null;
  nextMatch: {
    id: number;
    scheduled_at: string;
    location_name: string | null;
  } | null;
  presenceStatus: PresenceStatus;
  canQuickConfirm: boolean;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR');
}

function getPresenceLabel(status: PresenceStatus): string {
  if (status === 'going') return 'CONFIRMADA';
  if (status === 'not_going') return 'DESCONFIRMADA';
  return 'PENDENTE';
}

export default function PlayerHome({
  status,
  hasGroup,
  group,
  nextMatch,
  presenceStatus,
  canQuickConfirm,
}: PlayerHomeProps) {
  const handleQuickConfirm = () => {
    if (!nextMatch) return;
    router.post(route('player.home.presence.confirm', { match: nextMatch.id }));
  };

  return (
    <RetroAppShell activeId="home" items={PLAYER_NAV_ITEMS}>
      <Head title="Home do jogador" />

      <RetroSectionHeader title="HOME DO JOGADOR" />
      <RetroInfoCard>
        {status ? <RetroInlineInfo message={status} /> : null}

        {!hasGroup ? (
          <div className="retro-text-shadow text-base text-[#e5e7eb]">
            Você ainda não participa de nenhum grupo.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <RetroValueDisplay label="GRUPO" value={group?.name ?? '-'} />
            <RetroValueDisplay
              label="PRÓXIMA PARTIDA"
              value={nextMatch ? formatDateTime(nextMatch.scheduled_at) : 'Sem partida agendada'}
            />
            <RetroValueDisplay label="LOCAL" value={nextMatch?.location_name ?? '-'} />
            <RetroValueDisplay label="SUA PRESENÇA" value={getPresenceLabel(presenceStatus)} />

            {nextMatch && canQuickConfirm ? (
              <RetroButton type="button" variant="success" onClick={handleQuickConfirm}>
                CONFIRMAR PRESENÇA
              </RetroButton>
            ) : null}
          </div>
        )}
      </RetroInfoCard>
    </RetroAppShell>
  );
}
