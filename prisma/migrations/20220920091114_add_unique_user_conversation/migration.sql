/*
  Warnings:

  - A unique constraint covering the columns `[conversationId,userId]` on the table `user_conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_conversation_conversationId_userId_key" ON "user_conversation"("conversationId", "userId");
