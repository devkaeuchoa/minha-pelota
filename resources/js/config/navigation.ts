export type AppNavItem = {
  id: string;
  label: string;
  href: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', label: 'HOME', href: '/' },
  { id: 'groups', label: 'GRUPOS', href: '/groups' },
  { id: 'settings', label: 'CONFIGURAÇÕES', href: '/settings' },
];

