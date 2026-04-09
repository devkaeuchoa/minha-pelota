import { useLocale } from '@/hooks/useLocale';

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
  onLogout?: () => void;
}

export function RetroDesktopNavbar({
  title,
  versionLabel = 'VER 1.0',
  items,
  activeId,
  onLogout,
}: RetroDesktopNavbarProps) {
  const { t } = useLocale();
  return (
    <header data-component="retro-desktop-navbar" className="relative z-40 w-full">
      <div className="retro-bg-metallic retro-border-emboss flex items-center justify-between px-3 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-4">
          <h1 className="retro-text-shadow-light m-0 text-3xl font-bold leading-none tracking-widest text-red-700 italic">
            {title}
          </h1>
        </div>

        <div className="flex items-center">
          <div className="border-inset-metallic bg-[#ced4da] px-3 py-1 text-lg font-bold tracking-wider text-[#101c54]">
            {versionLabel}
          </div>
        </div>
      </div>

      <nav className="relative z-30 w-full">
        <div className="mx-auto flex flex-col gap-2 border-panel-blue bg-[#0b1340] p-4 shadow-[8px_8px_30px_rgba(0,0,0,0.8)] lg:p-5">
          <div className="relative border-emboss bg-metallic">
            <div className="relative min-h-10 flex items-center justify-between">
              <span className="text-lg font-bold tracking-widest text-[#ffd700] retro-text-shadow">
                SELECIONE O MENU
              </span>
            </div>
          </div>

          <ul className="flex h-fit w-full flex-row gap-4 lg:gap-6">
            {items.map((item) => {
              const isActive = item.id === activeId;

              if (isActive) {
                return (
                  <li key={item.id} className="flex flex-1">
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="flex w-full h-10 cursor-default items-center border-2 border-[#4060c0] justify-center bg-[#1e348c] text-lg font-bold tracking-wider text-[#ffd700] retro-text-shadow shadow-[4px_4px_0_#000]"
                    >
                      {item.label}
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.id} className="flex flex-1">
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full h-10 items-center justify-center border-2 border-[#4060c0] bg-[#1e348c] text-lg text-[#a0b0ff] retro-text-shadow shadow-[4px_4px_0_#000] transition-all duration-100 hover:bg-[#2540a0] hover:text-white focus:outline-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#000]"
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="mt-1 h-10 w-full border-2 border-[#4060c0] bg-[#1e348c] text-lg font-bold tracking-wider text-[#ff7a7a] retro-text-shadow shadow-[4px_4px_0_#000] transition-all duration-100 hover:bg-[#2540a0] hover:text-white focus:outline-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#000]"
            >
              {t('common.logout')}
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
