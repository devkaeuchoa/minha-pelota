import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import styles from './RetroIconTextButton.module.css';

type RetroIconTextButtonVariant = 'neutral' | 'danger';

interface RetroIconTextButtonProps {
  icon: ReactNode;
  label: string;
  variant?: RetroIconTextButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
}

export function RetroIconTextButton({
  icon,
  label,
  variant = 'neutral',
  disabled = false,
  onClick,
  href,
  ariaLabel,
}: RetroIconTextButtonProps) {
  const className = `${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''}`;

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel ?? label} className={className}>
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
