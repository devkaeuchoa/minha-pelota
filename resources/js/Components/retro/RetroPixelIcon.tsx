type RetroPixelIconName = 'groups' | 'flag' | 'calendar' | 'arrow-back' | 'arrow-forward';
type RetroPixelIconSize = 'sm' | 'md' | 'lg';

interface RetroPixelIconProps {
  name: RetroPixelIconName;
  size?: RetroPixelIconSize;
  className?: string;
}

const SIZE_PX: Record<RetroPixelIconSize, number> = {
  sm: 28,
  md: 32,
  lg: 64,
};

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
  flag: [
    '0111111000',
    '0111111000',
    '0111100000',
    '0111111000',
    '0111111000',
    '0100000000',
    '0100000000',
    '0100000000',
    '0100000000',
    '0100000000',
  ],
  calendar: [
    '0011001100',
    '0111111110',
    '0111111110',
    '0100000010',
    '0111111110',
    '0100000010',
    '0100000010',
    '0111111110',
    '0100000010',
    '0111111110',
  ],
  'arrow-back': [
    '0000000000',
    '0000100000',
    '0001100000',
    '0011111100',
    '0111111100',
    '0111111100',
    '0011111100',
    '0001100000',
    '0000100000',
    '0000000000',
  ],
  'arrow-forward': [
    '0000000000',
    '0000010000',
    '0000011000',
    '0011111100',
    '0011111110',
    '0011111110',
    '0011111100',
    '0000011000',
    '0000010000',
    '0000000000',
  ],
};

export function RetroPixelIcon({ name, size = 'md', className }: RetroPixelIconProps) {
  const grid = ICONS[name];
  const rows = grid.length;
  const cols = grid[0].length;
  const px = SIZE_PX[size];

  return (
    <svg
      data-component="retro-pixel-icon"
      viewBox={`0 0 ${cols} ${rows}`}
      width={px}
      height={px}
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
