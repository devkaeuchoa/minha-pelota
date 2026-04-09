/* global route */

import { PropsWithChildren } from 'react';
import { router, usePage } from '@inertiajs/react';
import { RetroDesktopNavbar, RetroLayout, RetroMobileNavbar } from '@/Components/retro';
import { AppNavItem, getDefaultNavItemsForUser } from '@/config/navigation';
import { PageProps } from '@/types';
import { useLocale } from '@/hooks/useLocale';

interface RetroAppShellProps extends PropsWithChildren {
  title?: string;
  versionLabel?: string;
  activeId?: string;
  items?: AppNavItem[];
}

export function RetroAppShell({
  title,
  versionLabel,
  activeId,
  items,
  children,
}: RetroAppShellProps) {
  const { t } = useLocale();
  const page = usePage<PageProps>();
  const defaultItems = getDefaultNavItemsForUser(page.props.auth?.user);
  const titleValue = title ?? t('layout.appTitle');
  const versionLabelValue = versionLabel ?? t('common.versionLabel');
  const navItems = (items ?? defaultItems).map((item) => ({
    id: item.id,
    label: t(item.labelKey),
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
            title={titleValue}
            items={navItems}
            activeId={activeId}
            onLogout={handleLogout}
            backAriaLabel={t('retro.mobile.backAriaLabel')}
            openMenuAriaLabel={t('retro.mobile.openMenuAriaLabel')}
            closeMenuAriaLabel={t('retro.mobile.closeMenuAriaLabel')}
            modeSelectLabel={t('retro.mobile.modeSelectLabel')}
            logoutLabel={t('common.logout')}
            statusHint={t('retro.mobile.statusHint')}
            aHintLabel={t('retro.mobile.aHintLabel')}
            bHintLabel={t('retro.mobile.bHintLabel')}
          />
        </div>
        <div className="hidden md:block">
          <RetroDesktopNavbar
            title={titleValue}
            versionLabel={versionLabelValue}
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
