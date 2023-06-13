/*
  Warnings:

  - You are about to drop the column `autoCalibrationId` on the `developmentExperience` table. All the data in the column will be lost.
  - You are about to drop the column `autoCalibrationId` on the `skillSummary` table. All the data in the column will be lost.
  - Added the required column `environments` to the `developmentExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frameworks` to the `developmentExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programmingLanguages` to the `developmentExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startYear` to the `developmentExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tools` to the `developmentExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cloud` to the `skillSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `developmentDomain` to the `skillSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `environment` to the `skillSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `framework` to the `skillSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `library` to the `skillSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programmingLanguage` to the `skillSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tool` to the `skillSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "developmentExperience" DROP CONSTRAINT "developmentExperience_autoCalibrationId_fkey";

-- DropForeignKey
ALTER TABLE "skillSummary" DROP CONSTRAINT "skillSummary_autoCalibrationId_fkey";

-- AlterTable
ALTER TABLE "developmentExperience" DROP COLUMN "autoCalibrationId",
ADD COLUMN     "environments" TEXT NOT NULL,
ADD COLUMN     "frameworks" TEXT NOT NULL,
ADD COLUMN     "programmingLanguages" TEXT NOT NULL,
ADD COLUMN     "startYear" TEXT NOT NULL,
ADD COLUMN     "tools" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "skillSummary" DROP COLUMN "autoCalibrationId",
ADD COLUMN     "cloud" TEXT NOT NULL,
ADD COLUMN     "developmentDomain" TEXT NOT NULL,
ADD COLUMN     "environment" TEXT NOT NULL,
ADD COLUMN     "framework" TEXT NOT NULL,
ADD COLUMN     "library" TEXT NOT NULL,
ADD COLUMN     "programmingLanguage" TEXT NOT NULL,
ADD COLUMN     "tool" TEXT NOT NULL;
