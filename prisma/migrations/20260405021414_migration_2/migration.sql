/*
  Warnings:

  - A unique constraint covering the columns `[matricule]` on the table `Professeur` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_professeur_id_fkey";

-- AlterTable
ALTER TABLE "Cours" ADD COLUMN     "specialiteId" INTEGER,
ADD COLUMN     "type_de_salle_id" INTEGER;

-- AlterTable
ALTER TABLE "Seance" ALTER COLUMN "professeur_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Professeur_matricule_key" ON "Professeur"("matricule");

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_type_de_salle_id_fkey" FOREIGN KEY ("type_de_salle_id") REFERENCES "TypeDeSalle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "Professeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
