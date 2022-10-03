/*
  Warnings:

  - You are about to drop the column `gameId` on the `room` table. All the data in the column will be lost.
  - You are about to drop the `game` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,roomId]` on the table `room_member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_gameId_fkey";

-- AlterTable
ALTER TABLE "room" DROP COLUMN "gameId",
ADD COLUMN     "game" "GameType" NOT NULL DEFAULT 'BUNNY_JUMP';

-- DropTable
DROP TABLE "game";

-- CreateIndex
CREATE UNIQUE INDEX "room_member_userId_roomId_key" ON "room_member"("userId", "roomId");
