/* global route */
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Group, MatchTeamPlayer, PageProps, PhysicalCondition } from '@/types';
import {
  RetroButton,
  RetroFormField,
  RetroInfoCard,
  RetroInlineInfo,
  RetroPlayerList,
  RetroPhysicalConditionEmoji,
  RetroSectionHeader,
  RetroTeamCard,
  RetroTextInput,
  RetroValueDisplay,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { formatDateTimePtBr } from '@/utils/datetime';
import { useLocale } from '@/hooks/useLocale';

interface MatchTeamsManageProps extends PageProps {
  group: Pick<Group, 'id' | 'name'>;
  match: {
    id: number;
    scheduled_at: string;
    location_name: string | null;
    team_size: number | null;
  };
  defaultTeamSize: number | null;
  players: MatchTeamPlayer[];
  status?: string;
  permissions?: {
    can_manage_teams?: boolean;
  };
}

function getPhysicalConditionEmoji(condition: PhysicalCondition): string {
  if (condition === PhysicalCondition.Otimo) return '😊';
  if (condition === PhysicalCondition.Regular) return '😐';
  if (condition === PhysicalCondition.Ruim) return '☹️';
  if (condition === PhysicalCondition.Machucado) return '🏥';
  return '❓';
}

export default function Manage({
  group,
  match,
  defaultTeamSize,
  players,
  status,
  permissions,
}: MatchTeamsManageProps) {
  const { t } = useLocale();
  const canManageTeams = permissions?.can_manage_teams ?? true;
  const [teamSizeInput, setTeamSizeInput] = useState(
    match.team_size !== null
      ? String(match.team_size)
      : defaultTeamSize !== null
        ? String(defaultTeamSize)
        : '',
  );
  const [generating, setGenerating] = useState(false);

  const matchLabel = useMemo(() => formatDateTimePtBr(match.scheduled_at), [match.scheduled_at]);

  const teamA = useMemo(() => players.filter((p) => p.team === 'a'), [players]);
  const teamB = useMemo(() => players.filter((p) => p.team === 'b'), [players]);
  const reserves = useMemo(() => players.filter((p) => p.team === null), [players]);

  const toPlayerListItem = (player: MatchTeamPlayer) => ({
    id: player.id,
    name: player.name,
    nick: player.nick,
    physicalEmoji: (
      <RetroPhysicalConditionEmoji
        emoji={getPhysicalConditionEmoji(player.physicalCondition)}
        ariaLabel={t('retro.condition.ariaLabel')}
      />
    ),
  });

  const movePlayer = (playerId: number, team: 'a' | 'b') => {
    router.patch(
      route('groups.matches.teams.update', { group: group.id, match: match.id, player: playerId }),
      { team },
      { preserveScroll: true },
    );
  };

  const handlePlayerClick = (player: MatchTeamPlayer) => {
    if (!canManageTeams) return;

    if (player.team === 'a') {
      movePlayer(player.id, 'b');
    } else if (player.team === 'b') {
      movePlayer(player.id, 'a');
    } else {
      movePlayer(player.id, teamA.length <= teamB.length ? 'a' : 'b');
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    router.post(
      route('groups.matches.teams.generate', { group: group.id, match: match.id }),
      { team_size: teamSizeInput === '' ? null : Number(teamSizeInput) },
      { onFinish: () => setGenerating(false) },
    );
  };

  return (
    <RetroAppShell activeId="groups">
      <Head title={`Times — ${group.name}`} />

      <RetroSectionHeader title="DIVISÃO DE TIMES" />

      <RetroInfoCard>
        <div className="flex flex-col gap-4">
          {status ? <RetroInlineInfo message={status} /> : null}

          <div className="flex flex-wrap gap-3">
            <RetroValueDisplay label="PARTIDA" value={matchLabel} />
            {match.location_name ? (
              <RetroValueDisplay label="LOCAL" value={match.location_name} />
            ) : null}
          </div>

          {canManageTeams ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <RetroFormField label="JOGADORES POR TIME" htmlFor="team_size">
                <RetroTextInput
                  id="team_size"
                  type="number"
                  min={2}
                  max={50}
                  value={teamSizeInput}
                  onChange={(e) => setTeamSizeInput(e.target.value)}
                />
              </RetroFormField>
              <RetroButton
                type="button"
                variant="success"
                disabled={generating}
                onClick={handleGenerate}
                className="sm:w-auto"
              >
                GERAR TIMES
              </RetroButton>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <RetroTeamCard teamName="TIME A" playerLabel={String(teamA.length)} />
              <RetroPlayerList
                title="TIME A"
                emptyLabel={t('retro.playerList.empty')}
                players={teamA.map(toPlayerListItem)}
                onSelect={(id) => {
                  const player = teamA.find((p) => p.id === id);
                  if (player) handlePlayerClick(player);
                }}
                selectedIds={teamA.map((p) => p.id)}
                highlightSelectedBackground
              />
            </div>

            <div className="flex flex-col gap-2">
              <RetroTeamCard teamName="TIME B" playerLabel={String(teamB.length)} />
              <RetroPlayerList
                title="TIME B"
                emptyLabel={t('retro.playerList.empty')}
                players={teamB.map(toPlayerListItem)}
                onSelect={(id) => {
                  const player = teamB.find((p) => p.id === id);
                  if (player) handlePlayerClick(player);
                }}
                selectedIds={teamB.map((p) => p.id)}
                highlightSelectedBackground
              />
            </div>
          </div>

          {reserves.length > 0 ? (
            <RetroPlayerList
              title="RESERVAS"
              emptyLabel={t('retro.playerList.empty')}
              players={reserves.map(toPlayerListItem)}
              onSelect={(id) => {
                const player = reserves.find((p) => p.id === id);
                if (player) handlePlayerClick(player);
              }}
            />
          ) : null}
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
