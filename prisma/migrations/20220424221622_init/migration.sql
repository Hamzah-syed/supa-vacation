/*
  Warnings:

  - You are about to drop the column `name` on the `Home` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Home" DROP COLUMN "name",
ADD COLUMN     "image" TEXT;
