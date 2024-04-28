import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

async function fetchFPLData(): Promise<any> {
  const url = "https://fantasy.premierleague.com/api/bootstrap-static/";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch FPL data");
  return response.json();
}

export async function updatePlayers() {
  const data = await fetchFPLData();
  const updates = data.elements.map(async (playerData: any) => {
    const existingPlayer = await prisma.player.findUnique({
      where: { externalId: playerData.id },
    });

    const newNowCost = playerData.now_cost / 10;
    const priceDifference = existingPlayer
      ? newNowCost - existingPlayer.nowCost
      : 0;

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

      if (priceDifference !== 0) {
        const latestPriceChange = await prisma.priceChange.findFirst({
          where: { playerId: existingPlayer.id },
          orderBy: { changeDate: "desc" },
        });

        if (
          !latestPriceChange ||
          latestPriceChange.priceChange !== priceDifference
        ) {
          await prisma.priceChange.create({
            data: {
              playerId: existingPlayer.id,
              changeDate: new Date(),
              priceChange: priceDifference,
            },
          });
        }
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

  await Promise.all(updates);
  console.log("All players have been updated or created.");
}
