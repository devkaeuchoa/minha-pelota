export type PitchPresenceStatus = 'going' | 'not_going';

export interface RetroPitchProps {
  /**
   * Total máximo de jogadores na partida.
   * Por enquanto, este MVP desenha formação fixa para 12 jogadores (6 por lado).
   */
  maxPlayers?: number;
  /**
   * Status por posição (na ordem):
   *  - esquerda: GK, trás(3), frente(2)
   *  - direita: GK, trás(3), frente(2)
   */
  positions?: Array<PitchPresenceStatus | null>;
  /**
   * Permite mostrar só um lado (útil no futuro). Por padrão mostra os dois.
   */
  showSide?: 'both' | 'left' | 'right';
  /**
   * Quantidade máxima visual de reservas no topo.
   * Quando não houver reservas, mostramos quadrados vazios dessa capacidade.
   */
  maxReserves?: number;
  className?: string;
}

type Point = { xPct: number; yPct: number };

const leftPoints: Point[] = [
  // GK
  { xPct: 5, yPct: 50 },
  // Trás (3)
  { xPct: 20, yPct: 25 },
  { xPct: 20, yPct: 50 },
  { xPct: 20, yPct: 75 },
  // Frente (2)
  { xPct: 35, yPct: 35 },
  { xPct: 35, yPct: 65 },
];

function mirrorPoint(p: Point): Point {
  // Espelha o eixo vertical do campo.
  return { xPct: 100 - p.xPct, yPct: p.yPct };
}

function getPointsForSide(side: RetroPitchProps['showSide']): Point[] {
  const rightPoints = leftPoints.map(mirrorPoint);

  if (side === 'left') return leftPoints;
  if (side === 'right') return rightPoints;
  return [...leftPoints, ...rightPoints];
}

function getPointIndexForSide(side: RetroPitchProps['showSide']): number {
  // Se desenhar só um lado, a lista de `positions` ainda segue a ordem completa (0..11).
  // Aqui retornamos o offset a partir do qual os pontos daquele lado começam.
  if (side === 'left') return 0;
  if (side === 'right') return 6;
  return 0;
}

export function RetroPitch({
  maxPlayers = 12,
  positions,
  showSide = 'both',
  maxReserves = 5,
  className,
}: RetroPitchProps) {
  const points = getPointsForSide(showSide);
  const offset = getPointIndexForSide(showSide);

  const pointsLimit = Math.min(12, Math.max(0, maxPlayers));
  const confirmedIndexes = (positions ?? [])
    .map((status, idx) => (status === 'going' ? idx : null))
    .filter((idx): idx is number => idx !== null);

  const hasAnyDot = confirmedIndexes.length > 0;
  const reservesCount = Math.max(0, confirmedIndexes.length - pointsLimit);
  const reservesCapacity = Math.max(0, maxReserves);

  return (
    <div className={`flex flex-col gap-2 md:gap-3 ${className ?? ''}`}>
      <div className="flex flex-col gap-1">
        <span className="retro-text-shadow text-xs uppercase tracking-wider text-[#ffd700] md:text-sm">
          Reservas
        </span>
        <div className="flex min-h-[14px] flex-wrap gap-1 md:min-h-[18px] md:gap-1.5">
          {reservesCount > 0
            ? Array.from({ length: reservesCount }).map((_, idx) => (
                <span
                  key={`reserve-${idx}`}
                  className="h-3 w-3 rounded-full border-2 border-[#b3ecff] bg-[#39b8ff] shadow-[0_0_8px_rgba(57,184,255,0.9)] md:h-4 md:w-4"
                />
              ))
            : Array.from({ length: reservesCapacity }).map((_, idx) => (
                <span
                  key={`reserve-empty-${idx}`}
                  className="h-3 w-3 border border-[#a0b0ff] bg-transparent md:h-4 md:w-4"
                />
              ))}
        </div>
      </div>

      <div
        data-component="retro-pitch"
        className="relative w-full aspect-[4/3] retro-border-panel overflow-hidden bg-[#0b1340]"
      >
        {/* Campo */}
        <div className="absolute inset-0">
          <div className="absolute inset-[10px] rounded-sm border-2 border-white bg-[#2b7a43]">
            {/* Grade (linhas discretas) */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Linha central */}
            <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white opacity-70" />

            {/* Meia-lua / marcação simplificada de gol */}
            <div className="absolute left-[10px] top-1/2 h-[58px] w-[8px] -translate-y-1/2 border-2 border-white border-l-0 opacity-80" />
            <div className="absolute right-[10px] top-1/2 h-[58px] w-[8px] -translate-y-1/2 border-2 border-white border-r-0 opacity-80" />

            {/* Dots (somente confirmados dentro do limite de campo) */}
            {hasAnyDot
              ? points.map((p, localIndex) => {
                  const globalIndex = offset + localIndex;
                  if (globalIndex >= pointsLimit) return null;
                  const status = positions?.[globalIndex];
                  if (status !== 'going') return null;

                  return (
                    <div
                      key={globalIndex}
                      className="absolute -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-[#b3ecff] bg-[#39b8ff] shadow-[0_0_8px_rgba(57,184,255,0.9)] md:h-4 md:w-4"
                      style={{
                        left: `${p.xPct}%`,
                        top: `${p.yPct}%`,
                      }}
                      aria-hidden="true"
                    />
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
