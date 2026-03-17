import { Group } from '@/types';

export function getGroupInviteUrl(group: Group): string | null {
  if (!group.invite_code) {
    return null;
  }
  return `${window.location.origin}/invite/${group.invite_code}`;
}
