import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'success' | 'danger';
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
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-xl',
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
  const baseClasses = `retro-text-shadow w-full ${sizeStyles[size]} ${variantStyles[variant]} focus:outline-none ${className}`;
  const finalClasses = disabled ? `${baseClasses} ${disabledStyles}` : baseClasses;

  return (
    <button className={finalClasses} {...props}>
      {children}
    </button>
  );
}
