import styles from './RetroPhysicalConditionScale.module.css';

interface ConditionOption<TValue extends string | number> {
  id: TValue;
  emoji: string;
  label: string;
}

interface RetroPhysicalConditionScaleProps<TValue extends string | number> {
  label: string;
  options: Array<ConditionOption<TValue>>;
  value: TValue;
  onChange: (condition: TValue) => void;
  disabled?: boolean;
}

export function RetroPhysicalConditionScale<TValue extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: RetroPhysicalConditionScaleProps<TValue>) {
  const active = options.find((option) => option.id === value) ?? options[0];

  return (
    <div data-component="retro-physical-condition-scale" className={styles.container}>
      <span className={`retro-text-shadow ${styles.label}`}>{label}</span>
      <span className={`retro-text-shadow ${styles.status}`}>
        {active ? `[${active.label}]` : ''}
      </span>

      <div className={styles.buttons}>
        {options.map((option) => {
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
