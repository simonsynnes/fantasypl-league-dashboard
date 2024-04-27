// pages/api/dailyUpdate.ts
import { NextApiRequest, NextApiResponse } from "next";
import { updatePlayers } from "./updatePlayers"; // Import your updatePlayers function

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }

  try {
    await updatePlayers();
    res.status(200).json({ message: "Players updated successfully." });
  } catch (error: any) {
    console.error("Error updating players:", error);
    res
      .status(500)
      .json({ error: "Failed to update players", message: error.message });
  }
}
