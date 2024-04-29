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
        OR: [{ injuries: { some: {} } }, { priceChanges: { some: {} } }],
      },
      select: {
        id: true,
        webName: true,
        nowCost: true,
        news: true,
        injuries: {
          orderBy: { updateDate: "desc" },
          take: 1,
        },
        priceChanges: {
          orderBy: { changeDate: "desc" },
          take: 1,
        },
      },
    });

    const playersWithStatus = players.map((player) => {
      const statusColor = determineColor(player.injuries[0]?.severity);
      const costChangeEvent = player.priceChanges[0]?.priceChange || 0;
      // Ensure the date is formatted as UTC
      const updateDate = formatUTCDate(
        player.priceChanges[0]?.changeDate ||
          player.injuries[0]?.updateDate ||
          new Date()
      );
      return {
        id: player.id,
        webName: player.webName,
        nowCost: player.nowCost / 10,
        news: player.news,
        statusColor,
        costChangeEvent,
        updateDate, // Formatted UTC date
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

function formatUTCDate(date: Date): string {
  const d = new Date(date);
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10); // format to 'YYYY-MM-DD'
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
