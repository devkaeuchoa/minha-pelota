import { ReactNode } from 'react';

interface RetroThumbCardRootProps {
  children: ReactNode;
  disabled?: boolean;
}

function RetroThumbCardRoot({ children, disabled = false }: RetroThumbCardRootProps) {
  return (
    <div
      data-component="retro-thumb-card"
      data-disabled={disabled || undefined}
      className={`flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded border-2 border-[#4060c0] bg-[#0b1340] p-3 ${
        disabled ? 'opacity-40 grayscale' : ''
      }`}
    >
      {children}
    </div>
  );
}

interface RetroThumbCardTitleProps {
  children: ReactNode;
}

function RetroThumbCardTitle({ children }: RetroThumbCardTitleProps) {
  return <div className="retro-text-shadow text-center text-xl text-[#a0b0ff]">{children}</div>;
}

type RetroThumbCardThumbSize = 'sm' | 'md' | 'lg';

interface RetroThumbCardThumbProps {
  children: ReactNode;
  size?: RetroThumbCardThumbSize;
}

const THUMB_SIZE_PX: Record<RetroThumbCardThumbSize, number> = {
  sm: 40,
  md: 56,
  lg: 72,
};

function RetroThumbCardThumb({ children, size = 'md' }: RetroThumbCardThumbProps) {
  const px = THUMB_SIZE_PX[size];

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-2 border-[#ffd700] bg-[#1e348c]"
      style={{ width: px, height: px }}
    >
      {children}
    </div>
  );
}

interface RetroThumbCardBodyProps {
  children: ReactNode;
}

function RetroThumbCardBody({ children }: RetroThumbCardBodyProps) {
  return <div className="flex w-full flex-col gap-2">{children}</div>;
}

interface RetroThumbCardCounterProps {
  children: ReactNode;
}

function RetroThumbCardCounter({ children }: RetroThumbCardCounterProps) {
  return <div className="retro-text-shadow text-center text-4xl text-[#ffd700]">{children}</div>;
}

interface RetroThumbCardTextProps {
  children: ReactNode;
}

function RetroThumbCardText({ children }: RetroThumbCardTextProps) {
  return <div className="retro-text-shadow text-center text-lg text-[#ffd700]">{children}</div>;
}

export const RetroThumbCard = Object.assign(RetroThumbCardRoot, {
  Title: RetroThumbCardTitle,
  Thumb: RetroThumbCardThumb,
  Body: RetroThumbCardBody,
  Counter: RetroThumbCardCounter,
  Text: RetroThumbCardText,
});
