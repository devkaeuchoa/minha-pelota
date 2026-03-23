/* global confirm, route, navigator, window */
import { Head, router } from '@inertiajs/react';
import { Group, PageProps, PhysicalCondition } from '@/types';
import {
  RetroPitch,
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroSectionHeader,
  RetroPlayerList,
  RetroValueDisplay,
  RetroPhysicalConditionEmoji,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { useMemo, useState } from 'react';
import { formatDateTimePtBr } from '@/utils/datetime';

interface MatchPresenceManageProps extends PageProps {
  group: Pick<Group, 'id' | 'name'>;
  match: {
    id: number;
    scheduled_at: string;
    location_name: string | null;
  };
  hasLink: boolean;
  expired: boolean;
  link: null | {
    token: string;
    expires_at: string;
    linkUrl: string;
  };
  players: Array<{
    id: number;
    name: string;
    nick: string;
    status: 'going' | 'not_going' | 'maybe' | null;
    physicalCondition: PhysicalCondition | null;
  }>;
  summary: {
    going: number;
    not_going: number;
    maybe: number;
    pending: number;
  };
  status?: string;
}

export default function Manage({
  group,
  match,
  hasLink,
  expired,
  link,
  players,
  summary,
  status,
}: MatchPresenceManageProps) {
  const [copied, setCopied] = useState(false);

  const matchLabel = useMemo(() => formatDateTimePtBr(match.scheduled_at), [match.scheduled_at]);

  // Movimenta confirmados (`going`) para o topo da lista e mantém a ordem original
  // entre os demais.
  const sortedPlayers = useMemo(() => {
    const decorated = players.map((p, originalIndex) => ({
      p,
      originalIndex,
      isGoing: p.status === 'going',
    }));

    decorated.sort((a, b) => {
      if (a.isGoing === b.isGoing) {
        return a.originalIndex - b.originalIndex;
      }
      return a.isGoing ? -1 : 1;
    });

    return decorated.map((d) => d.p);
  }, [players]);

  // O campinho deve refletir somente jogadores confirmados, seguindo a ordem já
  // priorizada por `sortedPlayers`.
  const pitchPositions = useMemo(
    () => sortedPlayers.filter((p) => p.status === 'going').map(() => 'going' as const),
    [sortedPlayers],
  );

  const handleGenerateLink = () => {
    if (!confirm('Deseja gerar o link de presença para esta partida?')) return;
    router.post(
      route('groups.matches.presence.generate-link', { group: group.id, match: match.id }),
    );
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.linkUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <RetroAppShell activeId="groups">
      <Head title={`Escalação — ${group.name}`} />

      <RetroSectionHeader title="VISUALIZAR ESCALAÇÃO" />

      <RetroInfoCard>
        <div className="flex flex-col gap-4">
          {status ? <RetroInlineInfo message={status} /> : null}

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              <RetroValueDisplay label="PARTIDA" value={matchLabel} />
              {match.location_name ? (
                <RetroValueDisplay label="LOCAL" value={match.location_name} />
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              {!hasLink ? (
                <RetroButton size="md" type="button" variant="success" onClick={handleGenerateLink}>
                  GERAR LINK DE PRESENÇA
                </RetroButton>
              ) : (
                <div className="flex flex-col gap-2 rounded">
                  <RetroInlineInfo
                    message={
                      expired
                        ? 'O link expirou para esta partida.'
                        : 'Link pronto. Copie e envie aos jogadores.'
                    }
                  />
                  {link ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        readOnly
                        value={link.linkUrl}
                        className="retro-input w-full bg-transparent font-retro text-base tracking-widest text-[#ffd700] outline-none placeholder:text-[#4060a0] retro-inset-shadow border-2 border-[#4060c0] px-3 py-2"
                      />
                      <RetroButton
                        size="sm"
                        type="button"
                        variant="neutral"
                        className="w-auto"
                        onClick={handleCopy}
                      >
                        {copied ? 'COPIADO' : 'COPIAR'}
                      </RetroButton>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-3 md:justify-between">
            <RetroValueDisplay label="CONFIRMADOS" value={summary.going.toString()} />
            <RetroValueDisplay label="DESCONFIRMADOS" value={summary.not_going.toString()} />
            <RetroValueDisplay label="TALVEZ" value={summary.maybe.toString()} />
            <RetroValueDisplay label="PENDENTES" value={summary.pending.toString()} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <RetroPitch maxPlayers={12} positions={pitchPositions} />

            <RetroPlayerList
              title="LISTA DE PRESENÇA"
              players={sortedPlayers.map((player) => {
                return {
                  id: player.id,
                  name: player.name,
                  nick: player.nick,
                  physicalEmoji: (
                    <RetroPhysicalConditionEmoji condition={player.physicalCondition} />
                  ),
                };
              })}
              selectedIds={sortedPlayers.filter((p) => p.status === 'going').map((p) => p.id)}
              highlightSelectedBackground
            />
          </div>
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
