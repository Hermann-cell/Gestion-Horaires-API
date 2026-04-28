/*
  Warnings:

  - A unique constraint covering the columns `[cours_id,programme_id]` on the table `Cours_Programme` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cours_Programme_cours_id_programme_id_key" ON "Cours_Programme"("cours_id", "programme_id");
