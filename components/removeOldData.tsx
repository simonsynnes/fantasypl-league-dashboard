import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanupOldData() {
  const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);

  await prisma.priceChange.deleteMany({
    where: {
      changeDate: {
        lt: twentyDaysAgo,
      },
    },
  });

  await prisma.injuryUpdate.deleteMany({
    where: {
      updateDate: {
        lt: twentyDaysAgo,
      },
    },
  });

  console.log("Old data has been cleaned up.");
}

export default cleanupOldData;
