/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Programme` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Programme_nom_key" ON "Programme"("nom");
