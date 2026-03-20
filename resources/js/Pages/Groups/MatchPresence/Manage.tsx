/* global confirm, route, navigator, window */
import { Head, router } from '@inertiajs/react';
import { Group, PageProps } from '@/types';
import {
  RetroButton,
  RetroInfoCard,
  RetroInlineInfo,
  RetroSectionHeader,
  RetroTable,
  RetroTableCell,
  RetroTableHeaderCell,
  RetroTableHeaderRow,
  RetroTableRow,
  RetroValueDisplay,
} from '@/Components/retro';
import { RetroAppShell } from '@/Layouts/RetroAppShell';
import { useMemo, useState } from 'react';

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
    status: 'going' | 'not_going' | null;
  }>;
  summary: {
    going: number;
    not_going: number;
    pending: number;
  };
  status?: string;
}

function formatDateTimePtBr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR');
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

          <div className="flex flex-wrap gap-3">
            <RetroValueDisplay label="CONFIRMADOS" value={summary.going.toString()} />
            <RetroValueDisplay label="DESCONFIRMADOS" value={summary.not_going.toString()} />
            <RetroValueDisplay label="PENDENTES" value={summary.pending.toString()} />
          </div>

          <RetroTable>
            <thead>
              <RetroTableHeaderRow>
                <RetroTableHeaderCell>JOGADOR</RetroTableHeaderCell>
                <RetroTableHeaderCell>PRESENÇA</RetroTableHeaderCell>
              </RetroTableHeaderRow>
            </thead>
            <tbody>
              {players.map((player, idx) => {
                const label =
                  player.status === 'going'
                    ? 'CONFIRMADO'
                    : player.status === 'not_going'
                      ? 'DESCONFIRMADO'
                      : 'PENDENTE';
                return (
                  <RetroTableRow key={player.id} index={idx}>
                    <RetroTableCell variant="muted">{player.nick}</RetroTableCell>
                    <RetroTableCell variant="default">{label}</RetroTableCell>
                  </RetroTableRow>
                );
              })}
            </tbody>
          </RetroTable>
        </div>
      </RetroInfoCard>
    </RetroAppShell>
  );
}
