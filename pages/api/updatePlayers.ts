import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

async function fetchFPLData(): Promise<any> {
  const url = "https://fantasy.premierleague.com/api/bootstrap-static/";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch FPL data");
  return response.json();
}

function determineSeverity(chance: number | null): string {
  if (chance === null) return "unknown";
  if (chance === 0) return "red";
  if (chance <= 50) return "orange";
  return "yellow";
}

export async function updatePlayers() {
  const data = await fetchFPLData();
  for (const playerData of data.elements) {
    const existingPlayer = await prisma.player.findUnique({
      where: { externalId: playerData.id },
    });

    if (existingPlayer) {
      await prisma.player.update({
        where: { externalId: playerData.id },
        data: {
          webName: playerData.web_name,
          nowCost: playerData.now_cost / 10,
          chanceOfPlayingNextRound: playerData.chance_of_playing_next_round,
          news: playerData.news,
          newsAdded: playerData.news_added
            ? new Date(playerData.news_added)
            : null,
        },
      });

      // Log price change if there is any
      if (existingPlayer.nowCost !== playerData.now_cost / 10) {
        await prisma.priceChange.create({
          data: {
            playerId: existingPlayer.id,
            changeDate: new Date(),
            priceChange: playerData.now_cost / 10 - existingPlayer.nowCost,
          },
        });
      }

      // Log injury update if there is any change
      if (existingPlayer.news !== playerData.news) {
        await prisma.injuryUpdate.create({
          data: {
            playerId: existingPlayer.id,
            updateDate: new Date(),
            status: playerData.news,
            news: playerData.news,
            severity: determineSeverity(
              playerData.chance_of_playing_next_round
            ),
          },
        });
      }
    } else {
      // Create new player
      await prisma.player.create({
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
      });
    }
  }
  console.log("All players have been updated or created.");
}

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      await updatePlayers();
      res.status(200).json({ message: "Update completed successfully." });
    } catch (error: any) {
      console.error("Failed to update players:", error);
      res
        .status(500)
        .json({ message: "Failed to update players", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
