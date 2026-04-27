/*
  Warnings:

  - A unique constraint covering the columns `[professeur_id,specialite_id]` on the table `Specialite_Professeur` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Specialite_Professeur_professeur_id_specialite_id_key" ON "Specialite_Professeur"("professeur_id", "specialite_id");
