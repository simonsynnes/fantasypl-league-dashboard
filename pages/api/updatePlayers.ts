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
  await Promise.all(
    data.elements.map(async (playerData: any) => {
      const existingPlayer = await prisma.player.findUnique({
        where: { externalId: playerData.id },
      });

      const newNowCost = playerData.now_cost / 10;
      const priceChange = playerData.cost_change_event * 0.1; // Decimal adjustment

      if (existingPlayer) {
        // Update player only if there are relevant changes
        if (
          existingPlayer.nowCost !== newNowCost ||
          existingPlayer.news !== playerData.news
        ) {
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
        }

        // Check for price change and record only if there's a significant change
        if (priceChange !== 0) {
          await prisma.priceChange.create({
            data: {
              playerId: existingPlayer.id,
              changeDate: new Date(),
              priceChange: priceChange,
            },
          });
        }

        // Record injury updates if news has changed
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
        // Create new player if not found
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

        // Initialize price change and injury logs for new players if necessary
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
    })
  );
  console.log("All players have been updated or created.");
}
