/*
  Warnings:

  - Changed the type of `heure_debut` on the `PlageHoraire` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `heure_fin` on the `PlageHoraire` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PlageHoraire" DROP COLUMN "heure_debut",
ADD COLUMN     "heure_debut" INTEGER NOT NULL,
DROP COLUMN "heure_fin",
ADD COLUMN     "heure_fin" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlageHoraire_heure_debut_heure_fin_key" ON "PlageHoraire"("heure_debut", "heure_fin");
