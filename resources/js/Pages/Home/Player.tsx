/* global route */
import { Head, router } from '@inertiajs/react';
import { PageProps, PhysicalCondition } from '@/types';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { PLAYER_NAV_ITEMS } from '@/config/navigation';
import { formatDateTimePtBr } from '@/utils/datetime';
import {
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroPhysicalConditionScale,
  RetroPitch,
  RetroSectionHeader,
  RetroValueDisplay,
} from '@/Components/retro';
import { useMemo } from 'react';

type PresenceStatus = 'going' | 'not_going' | 'maybe' | 'pending';

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
  confirmedPlayers: Array<{
    id: number;
    name: string;
    nick: string;
  }>;
  physicalCondition: PhysicalCondition;
  playerSummary: {
    id: number;
    rating: number | null;
    stats: {
      goals: number;
      assists: number;
      games_played: number;
      games_missed: number;
    };
  } | null;
}

function getPresenceLabel(status: PresenceStatus): string {
  if (status === 'going') return 'CONFIRMADA';
  if (status === 'not_going') return 'DESCONFIRMADA';
  if (status === 'maybe') return 'TALVEZ';
  return 'PENDENTE';
}

export default function PlayerHome({
  status,
  hasGroup,
  group,
  nextMatch,
  presenceStatus,
  confirmedPlayers,
  physicalCondition,
  playerSummary,
}: PlayerHomeProps) {
  const handlePresenceUpdate = (nextStatus: Exclude<PresenceStatus, 'pending'>) => {
    if (!nextMatch) return;
    router.post(route('player.home.presence.update', { match: nextMatch.id }), {
      status: nextStatus,
    });
  };

  const handlePhysicalConditionUpdate = (condition: PhysicalCondition) => {
    if (!group) return;
    router.post(
      route('player.home.physical-condition.update', { group: group.id }),
      {
        physical_condition: condition,
      },
      {
        preserveScroll: true,
      },
    );
  };

  const presenceActions: Array<{ id: Exclude<PresenceStatus, 'pending'>; label: string }> = [
    { id: 'going', label: 'CONFIRMAR' },
    { id: 'maybe', label: 'TALVEZ' },
    { id: 'not_going', label: 'DESCONFIRMAR' },
  ];

  const pitchPositions = useMemo(
    () => confirmedPlayers.map(() => 'going' as const),
    [confirmedPlayers],
  );

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
            {nextMatch ? (
              <div className="flex flex-wrap gap-2">
                {presenceActions.map((action) => {
                  const isActive = presenceStatus === action.id;
                  return (
                    <RetroButton
                      key={action.id}
                      type="button"
                      size="sm"
                      variant={isActive ? 'success' : 'neutral'}
                      onClick={() => handlePresenceUpdate(action.id)}
                    >
                      {action.label}
                    </RetroButton>
                  );
                })}
              </div>
            ) : null}

            <RetroValueDisplay label="GRUPO" value={group?.name ?? '-'} />
            <RetroValueDisplay
              label="PRÓXIMA PARTIDA"
              value={
                nextMatch ? formatDateTimePtBr(nextMatch.scheduled_at) : 'Sem partida agendada'
              }
            />
            <RetroValueDisplay label="LOCAL" value={nextMatch?.location_name ?? '-'} />
            <RetroValueDisplay label="SUA PRESENÇA" value={getPresenceLabel(presenceStatus)} />
            <RetroValueDisplay
              label="SEU RATING"
              value={playerSummary?.rating ? `${playerSummary.rating}/5` : '-'}
            />
            <RetroValueDisplay label="GOLS" value={String(playerSummary?.stats.goals ?? 0)} />
            <RetroValueDisplay
              label="ASSISTÊNCIAS"
              value={String(playerSummary?.stats.assists ?? 0)}
            />
            <RetroValueDisplay
              label="JOGOS REALIZADOS"
              value={String(playerSummary?.stats.games_played ?? 0)}
            />
            <RetroValueDisplay
              label="JOGOS PERDIDOS"
              value={String(playerSummary?.stats.games_missed ?? 0)}
            />

            <div className="mt-2 flex flex-col gap-2">
              <span className="retro-text-shadow text-base text-[#a0b0ff]">ESCALAÇÃO</span>
              <RetroPitch maxPlayers={12} positions={pitchPositions} />
              <div className="flex flex-col gap-1 rounded border-2 border-[#4060c0] bg-[#1e348c] p-2">
                <span className="retro-text-shadow text-sm text-[#a0b0ff]">
                  CONFIRMADOS ({confirmedPlayers.length})
                </span>
                {confirmedPlayers.length > 0 ? (
                  confirmedPlayers.map((player) => (
                    <span key={player.id} className="retro-text-shadow text-sm text-white">
                      - {player.nick || player.name}
                    </span>
                  ))
                ) : (
                  <span className="retro-text-shadow text-sm text-[#e5e7eb]">
                    Ninguém confirmou ainda.
                  </span>
                )}
              </div>
            </div>

            <RetroPhysicalConditionScale
              value={physicalCondition}
              onChange={handlePhysicalConditionUpdate}
            />
          </div>
        )}
      </RetroInfoCard>
    </RetroAppShell>
  );
}
