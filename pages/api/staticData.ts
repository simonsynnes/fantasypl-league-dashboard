import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = "https://fantasy.premierleague.com/api/bootstrap-static/";

  try {
    const apiResponse = await fetch(url, {
      headers: {
        "User-Agent": "TEST_AGENT", // It's good practice to set a User-Agent
      },
    });

    if (!apiResponse.ok) throw new Error("Failed to fetch static data");

    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
