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
      const statusColor = player.injuries[0]?.severity; // Assuming severity is already stored as color code
      const costChangeEvent = player.priceChanges[0]?.priceChange || 0;
      return {
        ...player,
        statusColor,
        costChangeEvent,
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
