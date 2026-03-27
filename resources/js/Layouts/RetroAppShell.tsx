/* global route */

import { PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';
import { RetroDesktopNavbar, RetroLayout, RetroMobileNavbar } from '@/Components/retro';
import { APP_NAV_ITEMS, AppNavItem } from '@/config/navigation';

interface RetroAppShellProps extends PropsWithChildren {
  title?: string;
  versionLabel?: string;
  activeId?: string;
  items?: AppNavItem[];
}

export function RetroAppShell({
  title = 'MINHA PELOTA',
  versionLabel = 'VER 1.0',
  activeId,
  items,
  children,
}: RetroAppShellProps) {
  const navItems = (items ?? APP_NAV_ITEMS).map((item) => ({
    id: item.id,
    label: item.label,
    onClick: () => router.visit(item.href),
  }));
  const handleLogout = () => {
    router.post(route('logout'));
  };

  return (
    <RetroLayout>
      <div className="mb-3">
        <div className="md:hidden">
          <RetroMobileNavbar
            title={title}
            items={navItems}
            activeId={activeId}
            onLogout={handleLogout}
          />
        </div>
        <div className="hidden md:block">
          <RetroDesktopNavbar
            title={title}
            versionLabel={versionLabel}
            items={navItems}
            activeId={activeId}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {children}
    </RetroLayout>
  );
}
