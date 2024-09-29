/*
  Warnings:

  - Added the required column `pluginId` to the `Preset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Preset"
    ADD COLUMN "pluginId" INTEGER;

UPDATE "Preset"
SET "pluginId" = 1
WHERE "pluginId" IS NULL;

ALTER TABLE "Preset"
    ALTER COLUMN "pluginId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Preset"
    ADD CONSTRAINT "Preset_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
