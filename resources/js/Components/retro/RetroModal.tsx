import { ReactNode } from 'react';
import { RetroButton } from './RetroButton';
import styles from './RetroModal.module.css';

type RetroModalVariant = 'hug' | 'full-width';
type RetroModalConfirmVariant = 'danger' | 'success' | 'neutral';

interface RetroModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  processing?: boolean;
  variant?: RetroModalVariant;
  confirmVariant?: RetroModalConfirmVariant;
}

export function RetroModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR',
  processing = false,
  variant = 'hug',
  confirmVariant = 'danger',
}: RetroModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.overlay} />
      <div
        className={`retro-border-panel ${styles.panel} ${
          variant === 'full-width' ? styles.panelFullWidth : styles.panelHug
        }`}
      >
        <div
          className={`retro-bg-metallic retro-border-emboss text-shadow-retro ${styles.titleBar}`}
        >
          {title}
        </div>

        <div className={`retro-text-shadow ${styles.message}`}>{message}</div>

        <div className={styles.actions}>
          <RetroButton type="button" variant="neutral" onClick={onCancel} disabled={processing}>
            {cancelText}
          </RetroButton>
          <RetroButton
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={processing}
          >
            {confirmText}
          </RetroButton>
        </div>
      </div>
    </div>
  );
}
