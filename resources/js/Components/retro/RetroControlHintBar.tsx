interface Hint {
  key: string;
  label: string;
  color: string;
}

interface RetroControlHintBarProps {
  hints: Hint[];
}

export function RetroControlHintBar({ hints }: RetroControlHintBarProps) {
  return (
    <div className="flex items-center justify-between border-y-2 border-[#5a7add] bg-[#1e348c] px-2 py-1">
      {hints.map((hint) => (
        <span
          key={hint.key}
          className="retro-text-shadow flex items-center gap-1 text-lg text-white"
        >
          <span style={{ color: hint.color }}>{hint.key}</span> {hint.label}
        </span>
      ))}
    </div>
  );
}
