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
      include: {
        priceChanges: {
          orderBy: { changeDate: "desc" },
          take: 1,
        },
      },
    });

    const newNowCost = playerData.now_cost / 10;
    const priceChange = playerData.cost_change_event * 0.1; // Convert from API format to actual price change

    if (existingPlayer) {
      const lastPriceChange = existingPlayer.priceChanges[0];
      const today = new Date().toISOString().slice(0, 10);
      const lastChangeDate = lastPriceChange
        ? new Date(lastPriceChange.changeDate).toISOString().slice(0, 10)
        : null;

      // Update player details
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

      // Check if the last price change was from today and if it differs from the current change
      if (
        lastChangeDate !== today ||
        (lastPriceChange && lastPriceChange.priceChange !== priceChange)
      ) {
        await prisma.priceChange.create({
          data: {
            playerId: existingPlayer.id,
            changeDate: new Date(), // Using the current date
            priceChange: priceChange,
          },
        });
      }

      // Update injuries if there's a change in the news
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
      // Create new player if not existing
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

      if (newPlayer.costChangeStart !== 0) {
        await prisma.priceChange.create({
          data: {
            playerId: newPlayer.id,
            changeDate: new Date(),
            priceChange: newPlayer.costChangeStart,
          },
        });
      }
    }
  }
  console.log("All players have been updated or created.");
}
