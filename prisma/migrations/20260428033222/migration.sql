/*
  Warnings:

  - A unique constraint covering the columns `[date,plage_horaire_id,salle_id]` on the table `Seance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Seance_date_plage_horaire_id_salle_id_key" ON "Seance"("date", "plage_horaire_id", "salle_id");
