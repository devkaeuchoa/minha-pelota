import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'success' | 'danger';

interface RetroButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  success:
    'bg-[#39ff14] border-2 border-white text-black font-bold shadow-[0_0_8px_#39ff14] hover:brightness-110',
  danger:
    'bg-[#ff0055] border-2 border-white text-white font-bold shadow-[0_0_8px_#ff0055] hover:brightness-110',
};

export function RetroButton({ variant, children, ...props }: RetroButtonProps) {
  return (
    <button
      {...props}
      className={`retro-text-shadow flex-1 py-2 text-xl ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
}
