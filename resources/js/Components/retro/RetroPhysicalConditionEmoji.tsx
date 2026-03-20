import { PhysicalCondition } from '@/types';

type PhysicalConditionValue = PhysicalCondition | 'unknown' | null | undefined;

interface RetroPhysicalConditionEmojiProps {
  condition?: PhysicalConditionValue;
  className?: string;
}

function toEmoji(condition: PhysicalConditionValue): string {
  switch (condition) {
    case PhysicalCondition.Otimo:
      return '😊';
    case PhysicalCondition.Regular:
      return '😐';
    case PhysicalCondition.Ruim:
      return '☹️';
    case PhysicalCondition.Machucado:
      return '🏥';
    case PhysicalCondition.Unknown:
    default:
      return '❓';
  }
}

export function RetroPhysicalConditionEmoji({
  condition,
  className,
}: RetroPhysicalConditionEmojiProps) {
  return (
    <span
      data-component="retro-physical-condition-emoji"
      className={className ?? 'text-xl'}
      aria-label="Condição física"
    >
      {toEmoji(condition)}
    </span>
  );
}
