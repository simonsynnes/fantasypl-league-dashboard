import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const leagueId = "1567755"; // Replace with your actual league ID
  const url = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data" });
  }
}
