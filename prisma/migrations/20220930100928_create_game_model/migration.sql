-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('BUNNY_JUMP');

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GameType" NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);
