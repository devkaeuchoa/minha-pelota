import { PropsWithChildren } from 'react';

export function RetroLayout({ children }: PropsWithChildren) {
  return (
    <div className="retro-body-bg retro-scanlines font-retro min-h-screen w-full overflow-x-hidden p-3 pb-10 uppercase text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">{children}</div>
    </div>
  );
}
