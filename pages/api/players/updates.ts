// pages/api/players/updates.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const players = await prisma.player.findMany({
      where: {
        OR: [
          {
            injuries: {
              some: {}, // Checks if there is at least one entry in the injuries relation
            },
          },
          {
            priceChanges: {
              some: {}, // Checks if there is at least one entry in the priceChanges relation
            },
          },
        ],
      },
      select: {
        id: true,
        webName: true,
        nowCost: true,
        news: true,
        injuries: {
          orderBy: {
            updateDate: "desc",
          },
          take: 1,
        },
        priceChanges: {
          orderBy: {
            changeDate: "desc",
          },
          take: 1,
        },
      },
    });

    const playersWithStatus = players.map((player) => {
      const statusColor = determineColor(player.injuries[0]?.severity); // Determine color based on severity
      const costChangeEvent = player.priceChanges[0]?.priceChange || 0;
      return {
        id: player.id,
        webName: player.webName,
        nowCost: player.nowCost / 10, // Convert to more readable format
        news: player.news,
        statusColor,
        costChangeEvent: costChangeEvent, // Convert to more readable format
      };
    });

    res.status(200).json(playersWithStatus);
  } catch (error: any) {
    console.error("Error fetching player updates:", error);
    res.status(500).json({
      message: "Failed to fetch player updates",
      error: error.message,
    });
  }
}

function determineColor(severity: string | undefined): string {
  switch (severity) {
    case "red":
      return "#C0020D";
    case "orange":
      return "#FFAB1B";
    case "yellow":
      return "#FFE65B";
    default:
      return "#CCCCCC"; // Default color for unknown or no injury
  }
}
