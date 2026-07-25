import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'success' | 'danger' | 'neutral';
type ButtonSize = 'sm' | 'md' | 'lg';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  success:
    'bg-[#39ff14] border-2 border-white text-white font-bold shadow-[0_0_8px_#39ff14] hover:brightness-110',
  danger:
    'bg-[#ff0055] border-2 border-white text-white font-bold shadow-[0_0_8px_#ff0055] hover:brightness-110',
  neutral:
    'bg-[#1f2937] border-2 border-[#4b5563] text-[#e5e7eb] font-semibold hover:bg-[#111827] hover:border-[#9ca3af]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-9 px-4 text-base',
  lg: 'h-9 px-6 text-xl',
};

const disabledStyles =
  'opacity-60 cursor-not-allowed shadow-none hover:brightness-100 border-[#9ca3af] text-[#e5e7eb]';

export function RetroButton({
  variant,
  size = 'md',
  children,
  disabled,
  className,
  ...props
}: RetroButtonProps) {
  const baseClasses = `retro-text-shadow inline-flex w-full items-center justify-center ${sizeStyles[size]} ${variantStyles[variant]} focus:outline-none ${className}`;
  const finalClasses = disabled ? `${baseClasses} ${disabledStyles}` : baseClasses;

  return (
    <button data-component="retro-button" className={finalClasses} {...props}>
      {children}
    </button>
  );
}
