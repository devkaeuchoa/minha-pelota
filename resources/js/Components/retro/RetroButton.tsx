import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'success' | 'danger';

interface RetroButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  success:
    'bg-[#39ff14] border-2 border-white text-white font-bold shadow-[0_0_8px_#39ff14] hover:brightness-110',
  danger:
    'bg-[#ff0055] border-2 border-white text-white font-bold shadow-[0_0_8px_#ff0055] hover:brightness-110',
};

const disabledStyles =
  'opacity-60 cursor-not-allowed shadow-none hover:brightness-100 border-[#9ca3af] text-[#e5e7eb]';

export function RetroButton({ variant, children, disabled, ...props }: RetroButtonProps) {
  const baseClasses = `retro-text-shadow flex-1 px-4 py-2 text-xl ${variantStyles[variant]}`;
  const finalClasses = disabled ? `${baseClasses} ${disabledStyles}` : baseClasses;

  return (
    <button {...props} disabled={disabled} className={finalClasses}>
      {children}
    </button>
  );
}
