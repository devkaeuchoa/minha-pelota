export interface User {
  id: number;
  name: string;
  nickname?: string | null;
  phone?: string | null;
  home_route?: string | null;
  can_access_player_admin_area?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupSettings {
  monthly_fee?: number | null;
  drop_in_fee?: number | null;
  default_weekday?: number | null;
  default_time?: string | null;
  recurrence?: string | null;
  invite_token?: string | null;
  invite_expires_at?: string | null;
}

export interface GroupPermissions {
  can_manage_group?: boolean;
  can_manage_players?: boolean;
  can_manage_matches?: boolean;
  can_manage_attendance?: boolean;
  can_manage_payments?: boolean;
  can_manage_invites?: boolean;
}

export interface Group {
  id: number;
  owner_player_id: number;
  name: string;
  slug: string;
  weekday: number;
  time: string;
  location_name: string;
  recurrence?: string;
  status: string;
  max_players: number | null;
  max_guests: number | null;
  allow_guests: boolean;
  default_match_duration_minutes: number | null;
  join_mode: string;
  invite_code: string | null;
  join_approval_required: boolean;
  has_monthly_fee: boolean;
  monthly_fee: number | null;
  payment_day: number | null;
  currency: string;
  group_settings?: GroupSettings | null;
  settings?: GroupSettings | null;
  permissions?: GroupPermissions | null;
  membership?: {
    is_admin?: boolean;
    permissions?: GroupPermissions | null;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Match {
  id: number;
  group_id: number;
  scheduled_at: string;
  status: string;
  location_name: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface MatchPayment {
  status: 'paid' | 'unpaid';
  paid_amount: number;
  is_monthly_exempt: boolean;
  has_previous_debt: boolean;
  previous_debt_matches_count: number;
}

export interface Player {
  id: number;
  name: string;
  nick: string;
  phone: string;
  rating?: number | null;
  stats?: {
    goals: number;
    assists: number;
    games_played: number;
    games_missed: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PageProps {
  auth: {
    user: User | null;
  };
  [key: string]: unknown;
}

export interface GroupRankingEntry {
  player_id: number;
  name: string;
  nick?: string | null;
  metric: number;
  metric_label: string;
}

export enum PhysicalCondition {
  Otimo = 'otimo',
  Regular = 'regular',
  Ruim = 'ruim',
  Machucado = 'machucado',
  Unknown = 'unknown',
}
