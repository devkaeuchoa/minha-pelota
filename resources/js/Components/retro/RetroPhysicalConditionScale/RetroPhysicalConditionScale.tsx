import { PhysicalCondition } from '@/types';
import styles from './RetroPhysicalConditionScale.module.css';

interface ConditionOption {
  id: PhysicalCondition;
  emoji: string;
  label: string;
}

interface RetroPhysicalConditionScaleProps {
  value: PhysicalCondition;
  onChange: (condition: PhysicalCondition) => void;
  disabled?: boolean;
}

const OPTIONS: ConditionOption[] = [
  { id: PhysicalCondition.Unknown, emoji: '❓', label: 'NÃO SEI' },
  { id: PhysicalCondition.Machucado, emoji: '🏥', label: 'MACHUCADO' },
  { id: PhysicalCondition.Ruim, emoji: '☹️', label: 'RUIM' },
  { id: PhysicalCondition.Regular, emoji: '😐', label: 'REGULAR' },
  { id: PhysicalCondition.Otimo, emoji: '😊', label: 'ÓTIMO' },
];

export function RetroPhysicalConditionScale({
  value,
  onChange,
  disabled = false,
}: RetroPhysicalConditionScaleProps) {
  const active = OPTIONS.find((option) => option.id === value) ?? OPTIONS[0];

  return (
    <div data-component="retro-physical-condition-scale" className={styles.container}>
      <span className={`retro-text-shadow ${styles.label}`}>CONDIÇÃO FÍSICA</span>
      <span className={`retro-text-shadow ${styles.status}`}>[{active.label}]</span>

      <div className={styles.buttons}>
        {OPTIONS.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault();
                onChange(option.id);
              }}
              className={`${styles.button} ${isActive ? styles.buttonActive : ''} ${
                disabled ? styles.buttonDisabled : ''
              }`}
              aria-label={option.label}
              title={option.label}
            >
              {option.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
