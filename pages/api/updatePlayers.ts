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

    const newNowCost = playerData.now_cost / 10;
    const priceChange = playerData.cost_change_event * 0.1; // Adjusted for decimal places in pricing

    if (existingPlayer) {
      await prisma.player.update({
        where: { externalId: playerData.id },
        data: {
          webName: playerData.web_name,
          nowCost: newNowCost,
          chanceOfPlayingNextRound: playerData.chance_of_playing_next_round,
          news: playerData.news,
          newsAdded: playerData.news_added
            ? new Date(playerData.news_added)
            : null,
        },
      });

      // Record price change if there's a change event
      console.log(
        "playerData.cost_change_event: " + playerData.cost_change_event
      );
      if (playerData.cost_change_event !== 0) {
        console.log("create new priceChange", existingPlayer.webName);
        await prisma.priceChange.create({
          data: {
            playerId: existingPlayer.id,
            changeDate: new Date(),
            priceChange: priceChange,
          },
        });
      }
    } else {
      const newPlayer = await prisma.player.create({
        data: {
          externalId: playerData.id,
          webName: playerData.web_name,
          nowCost: newNowCost,
          costChangeStart: playerData.cost_change_start / 10,
          chanceOfPlayingNextRound: playerData.chance_of_playing_next_round,
          news: playerData.news,
          newsAdded: playerData.news_added
            ? new Date(playerData.news_added)
            : null,
        },
      });

      // Handle initial price change for new players if applicable
      if (playerData.cost_change_start !== 0) {
        await prisma.priceChange.create({
          data: {
            playerId: newPlayer.id,
            changeDate: new Date(),
            priceChange: playerData.cost_change_start / 10,
          },
        });
      }
    }
  }
  console.log("All players have been updated or created.");
}
