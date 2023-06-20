/*
  Warnings:

  - Added the required column `tagColor` to the `spaecialAbility` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spaecialAbility" ADD COLUMN     "tagColor" INTEGER NOT NULL;
