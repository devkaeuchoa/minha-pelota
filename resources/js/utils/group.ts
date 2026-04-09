import { Group } from '@/types';
import { resolveGroupSettings } from './groups';

export function getGroupInviteUrl(group: Group): string | null {
  const settings = resolveGroupSettings(group);
  const inviteToken = settings.invite_token ?? group.invite_code;

  if (!inviteToken) {
    return null;
  }
  return `${window.location.origin}/invite/${inviteToken}`;
}
