export type Position = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'flexible';

export interface Player {
  id: string;
  name: string;
  skill_rating: number; // 1-5
  position?: Position;
  is_guest: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id?: string;
  name: string;
  date: string;
  location?: string;
  session_duration: number; // minutes
  match_duration: number; // minutes
  break_duration: number; // minutes
  num_teams: number;
  status: 'setup' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  player_id: string;
  player?: Player;
}

export interface Team {
  id: string;
  session_id: string;
  name: string;
  color: string;
  players?: TeamPlayer[];
}

export interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
  player?: Player;
}

export interface Match {
  id: string;
  session_id: string;
  match_number: number;
  team_a_id: string;
  team_b_id: string;
  team_a?: Team;
  team_b?: Team;
  score_a: number;
  score_b: number;
  status: 'pending' | 'in_progress' | 'finished';
  started_at?: string;
  ended_at?: string;
  timer_state?: TimerState;
}

export interface TimerState {
  duration: number; // seconds
  remaining: number; // seconds
  is_running: boolean;
  start_timestamp?: number; // unix ms
  paused_at?: number; // unix ms
}

export interface MatchEvent {
  id: string;
  match_id: string;
  team_id: string;
  player_id?: string;
  assister_id?: string;
  player?: Player;
  assister?: Player;
  event_type: 'goal' | 'own_goal' | 'penalty';
  minute: number;
  created_at: string;
}

export interface Standing {
  team_id: string;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface PlayerStats {
  player_id: string;
  player?: Player;
  session_id?: string;
  matches_played: number;
  goals: number;
  assists: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface LocalSession {
  session: Session;
  players: Player[];
  teams: Team[];
  matches: Match[];
  events: MatchEvent[];
  current_match_id?: string;
  timer_state?: TimerState;
}
