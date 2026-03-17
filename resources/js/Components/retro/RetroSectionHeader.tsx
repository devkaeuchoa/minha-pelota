interface RetroSectionHeaderProps {
  title: string;
}

export function RetroSectionHeader({ title }: RetroSectionHeaderProps) {
  return (
    <div className="retro-bg-metallic-dark retro-border-emboss py-0.5 px-2">
      <h2 className="retro-text-shadow m-0 text-xl tracking-wider text-[#ffd700]">{title}</h2>
    </div>
  );
}
