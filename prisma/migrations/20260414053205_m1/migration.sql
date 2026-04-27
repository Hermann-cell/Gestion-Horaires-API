/*
  Warnings:

  - A unique constraint covering the columns `[professeur_id,date,plage_horaire_id]` on the table `Seance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Seance_professeur_id_date_plage_horaire_id_key" ON "Seance"("professeur_id", "date", "plage_horaire_id");
