/* global route */

export type AppNavItem = {
  id: string;
  label: string;
  href: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', label: 'HOME', href: route('home') },
  { id: 'groups', label: 'GRUPOS', href: route('groups.index') },
  { id: 'dates', label: 'DATAS', href: route('dates.index') },
  { id: 'profile', label: 'PERFIL', href: route('profile.edit') },
];

export const PLAYER_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', label: 'HOME', href: route('player.home') },
  { id: 'profile', label: 'PERFIL', href: route('profile.edit') },
];

