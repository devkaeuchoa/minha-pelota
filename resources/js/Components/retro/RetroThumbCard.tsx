import { ReactNode } from 'react';

interface RetroThumbCardRootProps {
  children: ReactNode;
}

function RetroThumbCardRoot({ children }: RetroThumbCardRootProps) {
  return (
    <div
      data-component="retro-thumb-card"
      className="flex flex-col items-center gap-2 rounded border-2 border-[#4060c0] bg-[#0b1340] p-3"
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

interface RetroThumbCardThumbProps {
  children: ReactNode;
  size?: number;
}

function RetroThumbCardThumb({ children, size = 56 }: RetroThumbCardThumbProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-2 border-[#ffd700] bg-[#1e348c]"
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

interface RetroThumbCardBodyProps {
  children: ReactNode;
}

function RetroThumbCardBody({ children }: RetroThumbCardBodyProps) {
  return <div className="w-full">{children}</div>;
}

interface RetroThumbCardCounterProps {
  children: ReactNode;
}

function RetroThumbCardCounter({ children }: RetroThumbCardCounterProps) {
  return <div className="retro-text-shadow text-center text-4xl text-[#ffd700]">{children}</div>;
}

export const RetroThumbCard = Object.assign(RetroThumbCardRoot, {
  Title: RetroThumbCardTitle,
  Thumb: RetroThumbCardThumb,
  Body: RetroThumbCardBody,
  Counter: RetroThumbCardCounter,
});
