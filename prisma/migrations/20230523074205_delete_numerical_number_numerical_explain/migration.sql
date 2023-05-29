/*
  Warnings:

  - You are about to drop the column `numericalExplain` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the column `numericalNumber` on the `skill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "skill" DROP COLUMN "numericalExplain",
DROP COLUMN "numericalNumber";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "businessSituation" DROP DEFAULT;
