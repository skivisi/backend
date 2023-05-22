/*
  Warnings:

  - The `businessSituation` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "businessSituation",
ADD COLUMN     "businessSituation" BOOLEAN NOT NULL DEFAULT false;
