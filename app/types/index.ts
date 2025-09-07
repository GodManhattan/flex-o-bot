// File: app/types/index.ts
export interface User {
  id: string;
  name: string;
  pin: string;
  created_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  am_spots: number;
  pm_spots: number;
  all_day_spots: number;
  open_until: string;
  share_link: string;
  results_drawn: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  manager_id: string;
}

export interface PollEntry {
  id: string;
  poll_id: string;
  user_id: string;
  spot_type: "am" | "pm" | "all_day";
  created_at: string;
  users?: {
    name: string;
  };
}

export interface PollResult {
  id: string;
  poll_id: string;
  user_id: string;
  spot_type: "am" | "pm" | "all_day";
  created_at: string;
  users?: {
    name: string;
  };
}
