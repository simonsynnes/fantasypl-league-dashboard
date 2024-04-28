import cleanupOldData from "@/components/removeOldData";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }

  if (req.method === "POST") {
    try {
      await cleanupOldData();
      res.status(200).json({ message: "Cleanup successful" });
    } catch (error: any) {
      console.error("Cleanup failed:", error);
      res.status(500).json({ message: "Cleanup failed", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
