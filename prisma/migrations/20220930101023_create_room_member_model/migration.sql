-- CreateTable
CREATE TABLE "room_member" (
    "id" TEXT NOT NULL,
    "role" "RoomRole" NOT NULL DEFAULT 'MEMBER',
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "joinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "room_member_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "room_member" ADD CONSTRAINT "room_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_member" ADD CONSTRAINT "room_member_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
