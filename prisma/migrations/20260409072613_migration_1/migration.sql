/*
  Warnings:

  - You are about to drop the `Disponibilite_Professeur` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[professeurId,jour]` on the table `Disponibilite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `professeurId` to the `Disponibilite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Disponibilite_Professeur" DROP CONSTRAINT "Disponibilite_Professeur_disponibilite_id_fkey";

-- DropForeignKey
ALTER TABLE "Disponibilite_Professeur" DROP CONSTRAINT "Disponibilite_Professeur_professeur_id_fkey";

-- AlterTable
ALTER TABLE "Disponibilite" ADD COLUMN     "professeurId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Disponibilite_Professeur";

-- CreateIndex
CREATE UNIQUE INDEX "Disponibilite_professeurId_jour_key" ON "Disponibilite"("professeurId", "jour");

-- AddForeignKey
ALTER TABLE "Disponibilite" ADD CONSTRAINT "Disponibilite_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
