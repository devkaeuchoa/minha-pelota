# Database ERD (Current Schema)

This diagram focuses on the domain tables used by the product flows (players, groups, matches, presence, payments, stats), plus legacy references that still exist in schema.

```mermaid
erDiagram
    PLAYERS {
        INTEGER id PK
        VARCHAR name
        VARCHAR nick
        VARCHAR phone
        VARCHAR physical_condition
        INTEGER rating
        VARCHAR password
        VARCHAR remember_token
        BOOLEAN is_admin
        DATETIME created_at
        DATETIME updated_at
    }

    GROUPS {
        INTEGER id PK
        INTEGER owner_player_id FK
        VARCHAR name
        VARCHAR slug
        INTEGER weekday
        TIME time
        VARCHAR recurrence
        VARCHAR location_name
        VARCHAR status
        INTEGER max_players
        INTEGER max_guests
        BOOLEAN allow_guests
        INTEGER default_match_duration_minutes
        VARCHAR join_mode
        VARCHAR invite_code
        BOOLEAN join_approval_required
        BOOLEAN has_monthly_fee
        FLOAT monthly_fee
        INTEGER payment_day
        VARCHAR currency
        DATETIME deleted_at
    }

    GROUP_SETTINGS {
        INTEGER id PK
        INTEGER group_id FK
        FLOAT monthly_fee
        FLOAT drop_in_fee
        INTEGER default_weekday
        TIME default_time
        VARCHAR recurrence
        VARCHAR invite_token
        DATETIME invite_expires_at
    }

    GROUP_PLAYER {
        INTEGER id PK
        INTEGER group_id FK
        INTEGER player_id FK
        BOOLEAN is_admin
        DATETIME created_at
        DATETIME updated_at
    }

    MATCHES {
        INTEGER id PK
        INTEGER group_id FK
        DATETIME scheduled_at
        VARCHAR status
        VARCHAR location_name
        INTEGER duration_minutes
        DATETIME deleted_at
    }

    MATCH_ATTENDANCE {
        INTEGER id PK
        INTEGER match_id FK
        INTEGER player_id FK
        VARCHAR status
        DATETIME created_at
        DATETIME updated_at
    }

    MATCH_ATTENDANCE_LINKS {
        INTEGER id PK
        INTEGER match_id FK
        VARCHAR token
        DATETIME expires_at
        INTEGER created_by FK
    }

    MATCH_PAYMENTS {
        INTEGER id PK
        INTEGER match_id FK
        INTEGER player_id FK
        VARCHAR payment_status
        FLOAT paid_amount
        BOOLEAN is_monthly_exempt
    }

    MATCH_PLAYER_STATS {
        INTEGER id PK
        INTEGER match_id FK
        INTEGER player_id FK
        INTEGER goals
        INTEGER assists
    }

    PLAYER_STATS {
        INTEGER id PK
        INTEGER player_id FK
        INTEGER goals
        INTEGER assists
        INTEGER manual_goals_delta
        INTEGER manual_assists_delta
        INTEGER games_played
        INTEGER games_missed
    }

    PLAYER_CONDITION_HISTORIES {
        INTEGER id PK
        INTEGER player_id FK
        INTEGER group_id FK
        VARCHAR condition
        DATETIME started_at
        DATETIME ended_at
    }

    USERS {
        INTEGER id PK
        VARCHAR name
        VARCHAR nickname
        VARCHAR email
        VARCHAR phone
    }

    PLAYERS ||--o{ GROUPS : "owner_player_id -> players.id"
    GROUPS ||--|| GROUP_SETTINGS : "group_settings.group_id"
    GROUPS ||--o{ GROUP_PLAYER : "group_player.group_id"
    PLAYERS ||--o{ GROUP_PLAYER : "group_player.player_id"
    GROUPS ||--o{ MATCHES : "matches.group_id"
    MATCHES ||--o{ MATCH_ATTENDANCE : "match_attendance.match_id"
    PLAYERS ||--o{ MATCH_ATTENDANCE : "match_attendance.player_id"
    MATCHES ||--o{ MATCH_PAYMENTS : "match_payments.match_id"
    PLAYERS ||--o{ MATCH_PAYMENTS : "match_payments.player_id"
    MATCHES ||--o{ MATCH_PLAYER_STATS : "match_player_stats.match_id"
    PLAYERS ||--o{ MATCH_PLAYER_STATS : "match_player_stats.player_id"
    PLAYERS ||--|| PLAYER_STATS : "player_stats.player_id"
    PLAYERS ||--o{ PLAYER_CONDITION_HISTORIES : "player_condition_histories.player_id"
    GROUPS ||--o{ PLAYER_CONDITION_HISTORIES : "player_condition_histories.group_id"
    MATCHES ||--o{ MATCH_ATTENDANCE_LINKS : "match_attendance_links.match_id"
    USERS o|--o{ MATCH_ATTENDANCE_LINKS : "match_attendance_links.created_by (legacy FK)"
```

## Foreign Keys (explicit)

- `groups.owner_player_id -> players.id`
- `group_settings.group_id -> groups.id`
- `group_player.group_id -> groups.id`
- `group_player.player_id -> players.id`
- `matches.group_id -> groups.id`
- `match_attendance.match_id -> matches.id`
- `match_attendance.player_id -> players.id`
- `match_payments.match_id -> matches.id`
- `match_payments.player_id -> players.id`
- `match_player_stats.match_id -> matches.id`
- `match_player_stats.player_id -> players.id`
- `player_stats.player_id -> players.id`
- `player_condition_histories.player_id -> players.id`
- `player_condition_histories.group_id -> groups.id`
- `match_attendance_links.match_id -> matches.id`
- `match_attendance_links.created_by -> users.id` (legacy relation still present in schema)
