interface RetroTitleBarProps {
  title: string;
}

export function RetroTitleBar({ title }: RetroTitleBarProps) {
  return (
    <div className="retro-bg-metallic retro-border-emboss py-1 px-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
      <h1 className="retro-text-shadow-light m-0 text-3xl italic leading-none tracking-widest text-red-700">
        {title}
      </h1>
    </div>
  );
}
