import { PropsWithChildren, useState } from 'react';

interface RetroAccordionProps extends PropsWithChildren {
  title: string;
  defaultOpen?: boolean;
}

export function RetroAccordion({ title, defaultOpen = true, children }: RetroAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div data-component="retro-accordion" className="retro-border-panel bg-[#0b1340]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="retro-bg-metallic retro-border-emboss flex w-full items-center justify-between px-4 py-1 text-left text-xl text-[#1f2933] text-shadow-retro focus:outline-none"
      >
        <span>{title}</span>
        <span className="text-2xl">{open ? '−' : '+'}</span>
      </button>

      {open && <div className="p-2 pt-3 flex flex-col gap-3">{children}</div>}
    </div>
  );
}
