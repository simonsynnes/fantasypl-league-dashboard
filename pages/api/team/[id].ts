import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const teamId = req.query.id as string;
  const currentGameWeek = "35"; // Replace this with dynamic game week logic if necessary

  const url = `https://fantasy.premierleague.com/api/entry/${teamId}/event/${currentGameWeek}/picks/`;

  try {
    const apiResponse = await fetch(url, {
      //   headers: {
      //     "User-Agent": "Next.js Server-side Fetch",
      //   },
    });

    if (!apiResponse.ok)
      throw new Error(`Failed to fetch data for team ${apiResponse.body}`);

    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
