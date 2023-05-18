/*
  Warnings:

  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "skill" (
    "skillId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "InherentName" TEXT NOT NULL,
    "InherentDescription" TEXT NOT NULL,
    "numericalNumber" INTEGER NOT NULL,
    "numericalExplain" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("skillId")
);

-- CreateTable
CREATE TABLE "skillPoint" (
    "skillPointId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "FR" INTEGER NOT NULL,
    "BK" INTEGER NOT NULL,
    "DB" INTEGER NOT NULL,
    "SBR" INTEGER NOT NULL,
    "AR" INTEGER NOT NULL,
    "TS" INTEGER NOT NULL,
    "COM" INTEGER NOT NULL,

    CONSTRAINT "skillPoint_pkey" PRIMARY KEY ("skillPointId")
);

-- CreateTable
CREATE TABLE "spaecialAbility" (
    "spaecialAbilityId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "skillList" TEXT NOT NULL,
    "skillSelection" BOOLEAN NOT NULL,

    CONSTRAINT "spaecialAbility_pkey" PRIMARY KEY ("spaecialAbilityId")
);

-- CreateTable
CREATE TABLE "spec" (
    "specId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "github" TEXT NOT NULL,
    "offHours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spec_pkey" PRIMARY KEY ("specId")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "portfolioId" SERIAL NOT NULL,
    "specId" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("portfolioId")
);

-- CreateTable
CREATE TABLE "skillSummary" (
    "skillSummaryId" SERIAL NOT NULL,
    "specId" INTEGER NOT NULL,
    "autoCalibrationId" INTEGER NOT NULL,

    CONSTRAINT "skillSummary_pkey" PRIMARY KEY ("skillSummaryId")
);

-- CreateTable
CREATE TABLE "sellingPoint" (
    "sellingPointId" SERIAL NOT NULL,
    "specId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "sellingPoint_pkey" PRIMARY KEY ("sellingPointId")
);

-- CreateTable
CREATE TABLE "qualification" (
    "qualificationId" SERIAL NOT NULL,
    "specId" INTEGER NOT NULL,
    "credential" TEXT NOT NULL,
    "acquisitionDate" TEXT NOT NULL,

    CONSTRAINT "qualification_pkey" PRIMARY KEY ("qualificationId")
);

-- CreateTable
CREATE TABLE "previousWork" (
    "previousWorkId" SERIAL NOT NULL,
    "specId" INTEGER NOT NULL,
    "industry" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "JobDuties" TEXT NOT NULL,

    CONSTRAINT "previousWork_pkey" PRIMARY KEY ("previousWorkId")
);

-- CreateTable
CREATE TABLE "developmentExperience" (
    "developmentExperienceId" SERIAL NOT NULL,
    "specId" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "assignedTask" TEXT NOT NULL,
    "teamSize" TEXT NOT NULL,
    "totalProjectHeadcount" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "jobDuties" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "autoCalibrationId" INTEGER NOT NULL,

    CONSTRAINT "developmentExperience_pkey" PRIMARY KEY ("developmentExperienceId")
);

-- CreateTable
CREATE TABLE "autoCalibration" (
    "autoCalibrationId" SERIAL NOT NULL,
    "skill" TEXT NOT NULL,
    "membership" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,
    "FR" INTEGER NOT NULL,
    "CL" INTEGER NOT NULL,
    "ML" INTEGER NOT NULL,
    "QA" INTEGER NOT NULL,
    "JAVA" INTEGER NOT NULL,
    "PHP" INTEGER NOT NULL,

    CONSTRAINT "autoCalibration_pkey" PRIMARY KEY ("autoCalibrationId")
);

-- CreateTable
CREATE TABLE "request" (
    "applicationId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "adminComment" TEXT NOT NULL,
    "engineerComment" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "resultedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "admin" (
    "adminId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skillPoint" ADD CONSTRAINT "skillPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaecialAbility" ADD CONSTRAINT "spaecialAbility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec" ADD CONSTRAINT "spec_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec"("specId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skillSummary" ADD CONSTRAINT "skillSummary_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec"("specId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skillSummary" ADD CONSTRAINT "skillSummary_autoCalibrationId_fkey" FOREIGN KEY ("autoCalibrationId") REFERENCES "autoCalibration"("autoCalibrationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellingPoint" ADD CONSTRAINT "sellingPoint_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec"("specId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualification" ADD CONSTRAINT "qualification_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec"("specId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "previousWork" ADD CONSTRAINT "previousWork_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec"("specId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developmentExperience" ADD CONSTRAINT "developmentExperience_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec"("specId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developmentExperience" ADD CONSTRAINT "developmentExperience_autoCalibrationId_fkey" FOREIGN KEY ("autoCalibrationId") REFERENCES "autoCalibration"("autoCalibrationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;
