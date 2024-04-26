export interface PlayerPick {
  element: number; // This is the player's ID in the system
  position: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number;
}

export interface UserTeamResponse {
  picks: PlayerPick[];
}

export interface PlayerDetails {
  id: number;
  name: string;
  first_name: string;
  second_name: string;
  web_name: string;
  team_code: number;
  status: string;
  now_cost: number;
  photo: string; // This is actually a part string to build the image URL
  element_type: number;
  multiplier: number;
  event_points: number;
}
export interface Player {
  id: number;
  name: string;
  first_name: string;
  second_name: string;
  web_name: string;
  team_code: number;
  status: string;
  now_cost: number;
  photo: string; // This is actually a part string to build the image URL
  element_type: number;
  multiplier: number;
  playerDetails: PlayerDetails;
}

export interface StaticDataResponse {
  elements: Player[];
}

// Helper function to fetch static data
export async function fetchStaticData(): Promise<StaticDataResponse> {
  const response = await fetch("/api/staticData");
  if (!response.ok) throw new Error("Failed to fetch bootstrap-static data");
  return response.json();
}
