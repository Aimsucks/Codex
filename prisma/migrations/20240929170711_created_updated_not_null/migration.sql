/*
  Warnings:

  - Made the column `createdAt` on table `Plugin` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Preset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Preset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Plugin" ALTER COLUMN "createdAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Preset" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
