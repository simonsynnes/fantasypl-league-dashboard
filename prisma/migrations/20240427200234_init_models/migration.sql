-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER NOT NULL,
    "webName" TEXT NOT NULL,
    "nowCost" DOUBLE PRECISION NOT NULL,
    "costChangeStart" DOUBLE PRECISION NOT NULL,
    "chanceOfPlayingNextRound" INTEGER,
    "news" TEXT,
    "newsAdded" TIMESTAMP(3),

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjuryUpdate" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "news" TEXT,
    "severity" TEXT NOT NULL,

    CONSTRAINT "InjuryUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceChange" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL,
    "priceChange" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PriceChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_externalId_key" ON "Player"("externalId");

-- AddForeignKey
ALTER TABLE "InjuryUpdate" ADD CONSTRAINT "InjuryUpdate_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceChange" ADD CONSTRAINT "PriceChange_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
