/*
  Warnings:

  - Changed the type of `startDate` on the `developmentExperience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startYear` on the `developmentExperience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "developmentExperience" DROP COLUMN "startDate",
ADD COLUMN     "startDate" INTEGER NOT NULL,
DROP COLUMN "startYear",
ADD COLUMN     "startYear" INTEGER NOT NULL;
