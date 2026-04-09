interface RetroPhysicalConditionEmojiProps {
  emoji: string;
  ariaLabel: string;
  className?: string;
}

export function RetroPhysicalConditionEmoji({
  emoji,
  ariaLabel,
  className,
}: RetroPhysicalConditionEmojiProps) {
  return (
    <span
      data-component="retro-physical-condition-emoji"
      className={className ?? 'text-xl'}
      aria-label={ariaLabel}
    >
      {emoji}
    </span>
  );
}
