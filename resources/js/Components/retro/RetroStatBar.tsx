type StatVariant = 'purple' | 'green' | 'yellow' | 'pink';

interface RetroStatBarProps {
  label: string;
  /** 0–100 */
  value: number;
  variant: StatVariant;
}

const variantClass: Record<StatVariant, string> = {
  purple: 'retro-stat-purple',
  green: 'retro-stat-green',
  yellow: 'retro-stat-yellow',
  pink: 'retro-stat-pink',
};

export function RetroStatBar({ label, value, variant }: RetroStatBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div data-component="retro-stat-bar" className="flex items-center gap-2">
      <span className="retro-text-shadow w-6 text-lg text-white">{label}</span>
      <div className="retro-stat-bg flex h-4 flex-1">
        <div className={variantClass[variant]} style={{ width: `${clamped}%` }} />
        <div className="retro-stat-empty" style={{ width: `${100 - clamped}%` }} />
      </div>
    </div>
  );
}
