/*
  Warnings:

  - Added the required column `collectionId` to the `Flashcard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "collectionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
