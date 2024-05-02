import { NextApiRequest, NextApiResponse } from "next";

async function fetchLeagueData(leagueId: number) {
  const url = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch league data for league ID ${leagueId}, status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching league data:", error);
    throw error; // Ensure this error is caught in the main handler
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  if (typeof userId !== "string") {
    res
      .status(400)
      .json({ message: "User ID must be provided and must be a string." });
    return;
  }

  const userLeaguesUrl = `https://fantasy.premierleague.com/api/entry/${userId}/`;

  try {
    const userResponse = await fetch(userLeaguesUrl);
    if (!userResponse.ok) {
      throw new Error(
        `Failed to fetch user data, status: ${userResponse.status}`
      );
    }
    const userData = await userResponse.json();

    if (!userData.leagues || !userData.leagues.classic) {
      throw new Error("No classic leagues data found in user data.");
    }

    const managerName = `${userData.player_first_name} ${userData.player_last_name}`;
    const leagues = userData.leagues.classic.filter(
      (league: any) => league.league_type === "x"
    );

    const promises = leagues.map((league: any) => fetchLeagueData(league.id));
    const leagueDetails = await Promise.all(promises);

    res.status(200).json({
      managerName,
      leagues: leagueDetails,
    });
  } catch (error: any) {
    console.error("Error in API handler:", error);
    res.status(500).json({
      message: "Failed to fetch data",
      error: error.message || error.toString(),
    });
  }
}
