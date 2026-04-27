/*
  Warnings:

  - A unique constraint covering the columns `[heure_debut,heure_fin]` on the table `PlageHoraire` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plage_horaire_id,disponibilite_id]` on the table `PlageHoraire_Disponibilite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nom]` on the table `Specialite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlageHoraire_heure_debut_heure_fin_key" ON "PlageHoraire"("heure_debut", "heure_fin");

-- CreateIndex
CREATE UNIQUE INDEX "PlageHoraire_Disponibilite_plage_horaire_id_disponibilite_i_key" ON "PlageHoraire_Disponibilite"("plage_horaire_id", "disponibilite_id");

-- CreateIndex
CREATE UNIQUE INDEX "Specialite_nom_key" ON "Specialite"("nom");
