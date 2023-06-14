/*
  Warnings:

  - The `environments` column on the `developmentExperience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `frameworks` column on the `developmentExperience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `programmingLanguages` column on the `developmentExperience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tools` column on the `developmentExperience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cloud` column on the `skillSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `developmentDomain` column on the `skillSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `environment` column on the `skillSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `framework` column on the `skillSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `library` column on the `skillSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `programmingLanguage` column on the `skillSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tool` column on the `skillSummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "developmentExperience" DROP COLUMN "environments",
ADD COLUMN     "environments" TEXT[],
DROP COLUMN "frameworks",
ADD COLUMN     "frameworks" TEXT[],
DROP COLUMN "programmingLanguages",
ADD COLUMN     "programmingLanguages" TEXT[],
DROP COLUMN "tools",
ADD COLUMN     "tools" TEXT[];

-- AlterTable
ALTER TABLE "skillSummary" DROP COLUMN "cloud",
ADD COLUMN     "cloud" TEXT[],
DROP COLUMN "developmentDomain",
ADD COLUMN     "developmentDomain" TEXT[],
DROP COLUMN "environment",
ADD COLUMN     "environment" TEXT[],
DROP COLUMN "framework",
ADD COLUMN     "framework" TEXT[],
DROP COLUMN "library",
ADD COLUMN     "library" TEXT[],
DROP COLUMN "programmingLanguage",
ADD COLUMN     "programmingLanguage" TEXT[],
DROP COLUMN "tool",
ADD COLUMN     "tool" TEXT[];
