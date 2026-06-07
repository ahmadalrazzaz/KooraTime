-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Players table
create table players (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  skill_rating integer not null default 3 check (skill_rating between 1 and 5),
  position text check (position in ('goalkeeper', 'defender', 'midfielder', 'forward', 'flexible')),
  is_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sessions table
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  date date not null,
  location text,
  session_duration integer not null,
  match_duration integer not null,
  break_duration integer not null default 0,
  num_teams integer not null default 2,
  status text not null default 'setup' check (status in ('setup', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Teams table
create table teams (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  color text not null default '#EF4444',
  created_at timestamptz not null default now()
);

-- Team players
create table team_players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  unique(team_id, player_id)
);

-- Matches table
create table matches (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  match_number integer not null,
  team_a_id uuid not null references teams(id),
  team_b_id uuid not null references teams(id),
  score_a integer not null default 0,
  score_b integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'finished')),
  started_at timestamptz,
  ended_at timestamptz,
  timer_state jsonb,
  created_at timestamptz not null default now()
);

-- Match events (goals)
create table match_events (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade,
  team_id uuid not null references teams(id),
  player_id uuid references players(id),
  assister_id uuid references players(id),
  event_type text not null check (event_type in ('goal', 'own_goal', 'penalty')),
  minute integer not null,
  created_at timestamptz not null default now()
);

-- Player session stats
create table player_session_stats (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  matches_played integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  unique(player_id, session_id)
);

-- Player all-time stats
create table player_all_time_stats (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade unique,
  matches_played integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  sessions_played integer not null default 0
);

-- Row Level Security
alter table players enable row level security;
alter table sessions enable row level security;
alter table teams enable row level security;
alter table team_players enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;
alter table player_session_stats enable row level security;
alter table player_all_time_stats enable row level security;

-- RLS Policies
create policy "users_own_players" on players for all using (auth.uid() = user_id);
create policy "users_own_sessions" on sessions for all using (auth.uid() = user_id);
create policy "users_own_teams" on teams for all using (
  session_id in (select id from sessions where user_id = auth.uid())
);
create policy "users_own_team_players" on team_players for all using (
  team_id in (select t.id from teams t join sessions s on t.session_id = s.id where s.user_id = auth.uid())
);
create policy "users_own_matches" on matches for all using (
  session_id in (select id from sessions where user_id = auth.uid())
);
create policy "users_own_match_events" on match_events for all using (
  match_id in (select m.id from matches m join sessions s on m.session_id = s.id where s.user_id = auth.uid())
);
create policy "users_own_player_session_stats" on player_session_stats for all using (
  session_id in (select id from sessions where user_id = auth.uid())
);
create policy "users_own_player_all_time_stats" on player_all_time_stats for all using (
  player_id in (select id from players where user_id = auth.uid())
);

-- Indexes
create index on sessions(user_id);
create index on teams(session_id);
create index on matches(session_id);
create index on match_events(match_id);
create index on player_session_stats(player_id);
create index on player_session_stats(session_id);
