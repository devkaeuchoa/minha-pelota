export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  owner_id: number;
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
  monthly_fee_cents: number | null;
  payment_day: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Player {
  id: number;
  name: string;
  nick: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface PageProps {
  auth: {
    user: User | null;
  };
  [key: string]: unknown;
}
