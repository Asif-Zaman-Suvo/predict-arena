export interface DatabaseUser {
  id: string
  display_name: string
  avatar_seed: string
  created_at: string
  joined_at: string | null
}

export interface DatabasePrediction {
  id: string
  user_id: string
  match_id: string
  home_score: number
  away_score: number
  created_at: string
  updated_at: string
}

export interface DatabaseKnockoutPrediction {
  id: string
  user_id: string
  match_id: string
  team_id: string
  created_at: string
  updated_at: string
}

export interface DatabaseProfile {
  id: string
  user_id: string
  display_name: string
  avatar_seed: string
  joined_at: string | null
  created_at: string
}