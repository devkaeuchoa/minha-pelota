interface RetroNavItem {
  id: string;
  label: string;
  onClick?: () => void;
}

interface RetroDesktopNavbarProps {
  title: string;
  versionLabel?: string;
  items: RetroNavItem[];
  activeId?: string;
}

export function RetroDesktopNavbar({
  title,
  versionLabel = 'VER 1.0',
  items,
  activeId,
}: RetroDesktopNavbarProps) {
  return (
    <header className="relative z-40 w-full">
      <div className="retro-bg-metallic retro-border-emboss flex items-center justify-between px-8 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-12 items-center justify-center overflow-hidden border-2 border-[#a0b0ff] bg-white shadow-[2px_2px_0_#000]">
            <div className="absolute inset-y-0 left-1/2 -ml-1 w-2 bg-red-600" />
            <div className="absolute inset-x-0 top-1/2 -mt-1 h-2 bg-red-600" />
          </div>
          <h1 className="retro-text-shadow-light m-0 text-5xl font-bold leading-none tracking-widest text-red-700 italic">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-inset-metallic bg-[#0b1340] px-4 py-1">
            <span className="h-4 w-4 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14] animate-pulse" />
            <span className="retro-text-shadow text-xl tracking-widest text-[#39ff14]">
              SYSTEM ONLINE
            </span>
          </div>
          <div className="border-inset-metallic bg-[#ced4da] px-3 py-1 text-2xl font-bold tracking-wider text-[#101c54]">
            {versionLabel}
          </div>
        </div>
      </div>

      <nav className="relative z-30 w-full px-8 pt-8 pb-4">
        <div className="mx-auto flex flex-col gap-5 border-panel-blue bg-[#0b1340] p-4 shadow-[8px_8px_30px_rgba(0,0,0,0.8)] lg:p-5">
          <div className="relative overflow-hidden border-emboss bg-metallic py-2 px-6">
            <div className="pointer-events-none absolute top-0 left-[-100%] h-full w-1/2 skew-x-[-25deg] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.4)] to-transparent animate-[shine_4s_infinite]" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl text-blue-900">🖧</span>
                <span className="retro-text-shadow-light text-3xl font-bold tracking-widest text-blue-900 italic">
                  MAIN NAVIGATION PANEL
                </span>
              </div>
              <span className="text-xl font-bold tracking-widest text-[#343a40]">
                SELECT MODULE
              </span>
            </div>
          </div>

          <ul className="flex h-20 w-full flex-row gap-4 lg:gap-6">
            {items.map((item) => {
              const isActive = item.id === activeId;

              if (isActive) {
                return (
                  <li key={item.id} className="flex flex-1 items-stretch">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-4xl text-[#ffd700] retro-text-shadow drop-shadow-[0_0_5px_rgba(255,215,0,0.8)] animate-pulse">
                      ▶
                    </span>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="relative flex w-full cursor-default items-center justify-center border-highlight-green bg-[#1e348c] text-3xl font-bold tracking-wider text-[#ffd700] retro-text-shadow shadow-[4px_4px_0_#000]"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(57,255,20,0.2)_0%,_transparent_70%)]" />
                      {item.label}
                    </button>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-4xl text-[#ffd700] retro-text-shadow drop-shadow-[0_0_5px_rgba(255,215,0,0.8)] animate-pulse">
                      ◀
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.id} className="flex flex-1">
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full items-center justify-center border-2 border-[#4060c0] bg-[#1e348c] text-3xl text-[#a0b0ff] retro-text-shadow shadow-[4px_4px_0_#000] transition-all duration-100 hover:bg-[#2540a0] hover:text-white focus:outline-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#000]"
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}

