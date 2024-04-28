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
  const playerUpdates = data.elements.map(async (playerData: any) => {
    const existingPlayer = await prisma.player.findUnique({
      where: { externalId: playerData.id },
    });

    if (existingPlayer) {
      const newData = {
        webName: playerData.web_name,
        nowCost: playerData.now_cost / 10,
        chanceOfPlayingNextRound: playerData.chance_of_playing_next_round,
        news: playerData.news,
        newsAdded: playerData.news_added
          ? new Date(playerData.news_added)
          : null,
      };

      const updatedPlayer = await prisma.player.update({
        where: { externalId: playerData.id },
        data: newData,
      });

      // Check and log price change if there is any
      if (existingPlayer.nowCost !== newData.nowCost) {
        await prisma.priceChange.create({
          data: {
            playerId: updatedPlayer.id,
            changeDate: new Date(),
            priceChange: newData.nowCost - existingPlayer.nowCost,
          },
        });
      }

      // Check and log injury update if there is any change
      if (existingPlayer.news !== newData.news) {
        await prisma.injuryUpdate.create({
          data: {
            playerId: updatedPlayer.id,
            updateDate: new Date(),
            status: newData.news,
            news: newData.news,
            severity: determineSeverity(newData.chanceOfPlayingNextRound),
          },
        });
      }
    } else {
      // Create new player
      const newPlayer = await prisma.player.create({
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

      // Initialize price and injury logs for new players if necessary
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
  });

  await Promise.allSettled(playerUpdates);
  console.log("All players have been updated or created.");
}
