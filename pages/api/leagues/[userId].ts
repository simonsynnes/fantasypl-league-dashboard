// pages/api/leagues/[userId].js
import { NextApiRequest, NextApiResponse } from "next";

async function fetchLeagueData(leagueId: number) {
  const url = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`;
  const response = await fetch(url);
  return response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;
  const userLeaguesUrl = `https://fantasy.premierleague.com/api/entry/${userId}/`;

  try {
    const userResponse = await fetch(userLeaguesUrl);
    const userData = await userResponse.json();
    const leagues = userData.leagues.classic;

    const promises = leagues.map((league: any) => fetchLeagueData(league.id));
    const leagueDetails = await Promise.all(promises);

    res.status(200).json(leagueDetails);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data" });
  }
}
