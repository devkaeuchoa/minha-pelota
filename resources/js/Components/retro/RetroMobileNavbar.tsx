import { useState } from 'react';
import { router } from '@inertiajs/react';
import { RetroIconButton } from '@/Components/retro';

interface RetroNavItem {
  id: string;
  label: string;
  onClick?: () => void;
}

interface RetroMobileNavbarProps {
  title: string;
  items: RetroNavItem[];
  activeId?: string;
}

export function RetroMobileNavbar({ title, items, activeId }: RetroMobileNavbarProps) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  const handleItemClick = (item: RetroNavItem) => {
    item.onClick?.();
    setOpen(false);
  };

  return (
    <div data-component="retro-mobile-navbar">
      <header className="retro-bg-metallic retro-border-emboss relative z-20 flex shrink-0 items-center justify-between px-3 py-2 shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2">
          <RetroIconButton
            aria-label="Voltar"
            icon={
              <span className="text-[0.9em] leading-none -ml-[2px] mt-[2px] drop-shadow-[1px_1px_0px_white]">
                ◀
              </span>
            }
            flat
            onClick={() => {
              window.history.back();
            }}
          />
          <h1 className="retro-text-shadow-light m-0 text-2xl font-bold leading-none tracking-widest text-red-700 italic">
            {title}
          </h1>
        </div>

        <RetroIconButton
          aria-label="Abrir menu"
          onClick={toggle}
          flat
          icon={
            <div className="group flex h-full w-full flex-col items-center justify-center gap-[2px]">
              <span className="h-1 w-5 border border-[#0a1440] bg-black group-hover:bg-[#ffd700]" />
              <span className="h-1 w-5 border border-[#0a1440] bg-black group-hover:bg-[#ffd700]" />
              <span className="h-1 w-5 border border-[#0a1440] bg-black group-hover:bg-[#ffd700]" />
            </div>
          }
        />
      </header>

      <div
        className={`fixed inset-0 z-50 flex transform flex-col border-l-4 border-[#5a7add] bg-[#0b1340]/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } retro-scanlines`}
      >
        <div className="flex items-center justify-between border-b-2 border-[#1e348c] bg-[#1a2c7a] p-3">
          <div className="retro-bg-metallic retro-border-emboss mr-4 flex-1 px-4 py-1 text-center shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            <span className="retro-text-shadow-light block pt-1 text-2xl font-bold leading-none tracking-widest text-blue-900 italic">
              MODE SELECT
            </span>
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center border-2 border-white bg-[#ff0055] text-2xl text-white shadow-[0_0_8px_#ff0055] transition-all focus:outline-none hover:brightness-110 active:scale-95 retro-text-shadow"
          >
            X
          </button>
        </div>

        <nav className="relative z-20 flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {items.map((item) => {
            const isActive = item.id === activeId;

            if (isActive) {
              return (
                <div key={item.id} className="relative flex w-full items-center">
                  <span className="pointer-events-none absolute left-2 text-3xl text-[#ffd700] retro-text-shadow animate-[pulse_1s_ease-in-out_infinite]">
                    ▶
                  </span>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full border-highlight-green bg-[#1e348c] py-4 text-3xl font-bold tracking-widest text-[#ffd700] retro-text-shadow focus:outline-none"
                  >
                    {item.label}
                  </button>
                  <span className="pointer-events-none absolute right-2 text-3xl text-[#ffd700] retro-text-shadow animate-[pulse_1s_ease-in-out_infinite]">
                    ◀
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className="w-full border-2 border-[#4060c0] bg-[#1e348c] py-3 text-2xl tracking-widest text-white shadow-[2px_2px_0_#000] retro-text-shadow transition-colors focus:outline-none focus:border-[#ffd700] hover:bg-[#2540a0] hover:border-[#5a7add]"
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t-2 border-[#4060c0] bg-[#1a2c7a] p-3">
          <div className="flex items-center justify-between px-2">
            <span className="retro-text-shadow animate-pulse text-base text-[#a0b0ff]">
              SYSTEM AWAITING INPUT...
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-lg text-white retro-text-shadow">
                <span className="text-xl text-[#39ff14]">A</span> SELECT
              </span>
              <span className="flex items-center gap-1 text-lg text-white retro-text-shadow">
                <span className="text-xl text-[#ff0055]">B</span> BACK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
