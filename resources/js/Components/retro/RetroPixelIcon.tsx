type RetroPixelIconName = 'groups';

interface RetroPixelIconProps {
  name: RetroPixelIconName;
  size?: number;
  className?: string;
}

// Grades 10x10 de 0/1 por ícone ('1' = pixel aceso), desenhando pictogramas simples.
const ICONS: Record<RetroPixelIconName, string[]> = {
  groups: [
    '0111001110',
    '0111001110',
    '0111001110',
    '0000000000',
    '1111111111',
    '1111111111',
    '1111111111',
    '1111111111',
    '0000000000',
    '0000000000',
  ],
};

export function RetroPixelIcon({ name, size = 32, className }: RetroPixelIconProps) {
  const grid = ICONS[name];
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <svg
      data-component="retro-pixel-icon"
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {grid.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#ffd700" />
          ) : null,
        ),
      )}
    </svg>
  );
}
