import { PropsWithChildren } from 'react';
import { router } from '@inertiajs/react';
import {
  RetroDesktopNavbar,
  RetroLayout,
  RetroMobileNavbar,
} from '@/Components/retro';

type NavItem = {
  id: string;
  label: string;
  href: string;
};

interface RetroAppShellProps extends PropsWithChildren {
  title?: string;
  versionLabel?: string;
  activeId?: string;
  items?: NavItem[];
}

function getDefaultNavItems(): NavItem[] {
  return [
    { id: 'home', label: 'HOME', href: '/' },
    { id: 'groups', label: 'GRUPOS', href: '/groups' },
    { id: 'settings', label: 'CONFIGURAÇÕES', href: '/settings' },
  ];
}

export function RetroAppShell({
  title = 'MINHA PELOTA',
  versionLabel = 'VER 1.0',
  activeId,
  items,
  children,
}: RetroAppShellProps) {
  const navItems = (items ?? getDefaultNavItems()).map((item) => ({
    id: item.id,
    label: item.label,
    onClick: () => router.visit(item.href),
  }));

  return (
    <RetroLayout>
      <div className="mb-3">
        <div className="md:hidden">
          <RetroMobileNavbar title={title} items={navItems} activeId={activeId} />
        </div>
        <div className="hidden md:block">
          <RetroDesktopNavbar
            title={title}
            versionLabel={versionLabel}
            items={navItems}
            activeId={activeId}
          />
        </div>
      </div>

      {children}
    </RetroLayout>
  );
}

