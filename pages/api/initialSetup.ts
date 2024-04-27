import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

async function fetchFPLData() {
  const url = "https://fantasy.premierleague.com/api/bootstrap-static/";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch FPL data");
  return response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // First clear all existing player records
    await prisma.player.deleteMany();
    console.log("Cleared existing player records");

    // Fetch new data and populate the database
    const data: any = await fetchFPLData();
    const createPlayerPromises = data.elements.map((playerData: any) =>
      prisma.player.create({
        data: {
          externalId: playerData.id,
          webName: playerData.web_name,
          nowCost: playerData.now_cost / 10,
          costChangeStart: playerData.cost_change_start / 10,
          chanceOfPlayingNextRound: playerData.chance_of_playing_next_round,
          news: playerData.news,
          newsAdded: playerData.news_added
            ? new Date(playerData.news_added)
            : null,
        },
      })
    );

    // Wait for all player records to be created
    await Promise.all(createPlayerPromises);
    console.log("All players have been updated or created.");

    res
      .status(200)
      .json({ message: "Initial player data populated successfully!" });
  } catch (error: any) {
    console.error("Failed to populate initial player data:", error);
    res.status(500).json({
      message: "Failed to populate initial player data",
      error: error.message,
    });
  }
}
