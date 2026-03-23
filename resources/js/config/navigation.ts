export type AppNavItem = {
  id: string;
  label: string;
  href: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', label: 'HOME', href: '/' },
  { id: 'groups', label: 'GRUPOS', href: '/groups' },
  { id: 'dates', label: 'DATAS', href: '/dates' },
  { id: 'profile', label: 'PERFIL', href: '/profile' },
];

export const PLAYER_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', label: 'HOME', href: '/home/player' },
  { id: 'profile', label: 'PERFIL', href: '/profile' },
];

