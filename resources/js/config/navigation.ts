/* global route */

import { User } from '@/types';

export type AppNavItem = {
  id: string;
  labelKey: string;
  href: string;
  children?: AppNavItem[];
};

export const PLAYER_ADMIN_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', labelKey: 'common.home', href: route('home') },
  {
    id: 'groups',
    labelKey: 'common.groups',
    href: route('groups.index'),
    children: [
      { id: 'groups.index', labelKey: 'groups.viewAll', href: route('groups.index') },
      { id: 'groups.create', labelKey: 'groups.newGroup', href: route('groups.create') },
      { id: 'dates', labelKey: 'common.dates', href: route('dates.index') },
    ],
  },
  { id: 'profile', labelKey: 'common.profile', href: route('profile.edit') },
];

export const PLAYER_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', labelKey: 'common.home', href: route('player.home') },
  { id: 'profile', labelKey: 'common.profile', href: route('profile.edit') },
];

export function getDefaultNavItemsForUser(user: User | null | undefined): AppNavItem[] {
  const homeHref =
    user?.home_route && typeof user.home_route === 'string' ? user.home_route : route('home');

  if (user?.can_access_player_admin_area === false) {
    return PLAYER_NAV_ITEMS.map((item) => ({
      ...item,
      href: item.id === 'home' ? homeHref : item.href,
    }));
  }

  return PLAYER_ADMIN_NAV_ITEMS.map((item) => ({
    ...item,
    href: item.id === 'home' ? homeHref : item.href,
  }));
}
