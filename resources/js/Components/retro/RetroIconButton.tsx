import { ButtonHTMLAttributes, ReactNode } from 'react';

type RetroIconButtonVariant = 'metal';

interface RetroIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children'
> {
  icon: ReactNode;
  'aria-label': string;
  variant?: RetroIconButtonVariant;
  flat?: boolean;
}

export function RetroIconButton({
  icon,
  variant = 'metal',
  flat = false,
  disabled,
  ...props
}: RetroIconButtonProps) {
  const base =
    'flex items-center justify-center outline-none cursor-pointer transition-all font-retro';

  const metalRaised =
    'bg-gradient-to-b from-[#e0e0e0] to-[#999999] border-[2px] border-t-white border-l-white border-b-[#444444] border-r-[#444444] text-black w-9 h-9 shadow-[1.5px_1.5px_0_#000] active:border-t-[#444444] active:border-l-[#444444] active:border-b-white active:border-r-white active:pt-[1.5px] active:pl-[1.5px] active:bg-gradient-to-t';

  const metalFlat = 'text-black w-9 h-9';

  const disabledStyles = 'opacity-60 cursor-not-allowed shadow-none active:pt-0 active:pl-0';

  const metal = flat ? metalFlat : metalRaised;

  const classes = `${base} ${metal} ${disabled ? disabledStyles : ''}`;

  return (
    <button type="button" {...props} disabled={disabled} className={classes}>
      {icon}
    </button>
  );
}
