import { Group, GroupPermissions, GroupSettings } from '@/types';

export type RecurrenceValue = 'none' | 'weekly' | 'biweekly' | 'monthly' | null | undefined;

export function getRecurrenceLabel(recurrence: RecurrenceValue): string {
  switch (recurrence) {
    case 'none':
      return 'NENHUMA';
    case 'weekly':
      return 'SEMANAL';
    case 'biweekly':
      return 'QUINZENAL';
    case 'monthly':
      return 'MENSAL';
    default:
      return 'NÃO DEFINIDA';
  }
}

export function resolveGroupSettings(group: Group): GroupSettings {
  const modern = group.group_settings ?? group.settings ?? {};

  return {
    monthly_fee: modern.monthly_fee ?? group.monthly_fee ?? null,
    drop_in_fee: modern.drop_in_fee ?? null,
    default_weekday: modern.default_weekday ?? group.weekday ?? null,
    default_time: modern.default_time ?? group.time ?? null,
    recurrence: modern.recurrence ?? group.recurrence ?? null,
    invite_token: modern.invite_token ?? group.invite_code ?? null,
    invite_expires_at: modern.invite_expires_at ?? null,
  };
}

export function resolveGroupPermissions(group: Group, fallbackCanManage = true): Required<GroupPermissions> {
  const source = group.permissions ?? group.membership?.permissions ?? {};
  const canManageByRole =
    group.membership?.is_admin === true || source.can_manage_group === true || fallbackCanManage;

  const defaultManage = Boolean(canManageByRole);

  return {
    can_manage_group: source.can_manage_group ?? defaultManage,
    can_manage_players: source.can_manage_players ?? defaultManage,
    can_manage_matches: source.can_manage_matches ?? defaultManage,
    can_manage_attendance: source.can_manage_attendance ?? defaultManage,
    can_manage_payments: source.can_manage_payments ?? defaultManage,
    can_manage_invites: source.can_manage_invites ?? defaultManage,
  };
}

