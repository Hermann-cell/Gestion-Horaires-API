/*
  Warnings:

  - You are about to drop the column `cours_programmeId` on the `Cours` table. All the data in the column will be lost.
  - You are about to drop the column `seanceId` on the `Cours` table. All the data in the column will be lost.
  - You are about to drop the column `disponibilite_professeurId` on the `Disponibilite` table. All the data in the column will be lost.
  - You are about to drop the column `plageHoraire_disponibiliteId` on the `Disponibilite` table. All the data in the column will be lost.
  - You are about to drop the column `plageHoraire_disponibiliteId` on the `PlageHoraire` table. All the data in the column will be lost.
  - You are about to drop the column `seanceId` on the `PlageHoraire` table. All the data in the column will be lost.
  - You are about to drop the column `disponibilite_professeurId` on the `Professeur` table. All the data in the column will be lost.
  - You are about to drop the column `seanceId` on the `Professeur` table. All the data in the column will be lost.
  - You are about to drop the column `specialite_professeurId` on the `Professeur` table. All the data in the column will be lost.
  - You are about to drop the column `cours_programmeId` on the `Programme` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `seanceId` on the `Salle` table. All the data in the column will be lost.
  - You are about to drop the column `specialite_professeurId` on the `Specialite` table. All the data in the column will be lost.
  - You are about to drop the column `salleId` on the `TypeDeSalle` table. All the data in the column will be lost.
  - Added the required column `coursId` to the `Cours_Programme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programmeId` to the `Cours_Programme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disponibiliteId` to the `Disponibilite_Professeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professeurId` to the `Disponibilite_Professeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disponibiliteId` to the `PlageHoraire_Disponibilite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plageHoraireId` to the `PlageHoraire_Disponibilite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeDeSalleId` to the `Salle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coursId` to the `Seance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plageHoraireId` to the `Seance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professeurId` to the `Seance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salleId` to the `Seance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professeurId` to the `Specialite_Professeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialiteId` to the `Specialite_Professeur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cours" DROP CONSTRAINT "Cours_cours_programmeId_fkey";

-- DropForeignKey
ALTER TABLE "Cours" DROP CONSTRAINT "Cours_seanceId_fkey";

-- DropForeignKey
ALTER TABLE "Disponibilite" DROP CONSTRAINT "Disponibilite_disponibilite_professeurId_fkey";

-- DropForeignKey
ALTER TABLE "Disponibilite" DROP CONSTRAINT "Disponibilite_plageHoraire_disponibiliteId_fkey";

-- DropForeignKey
ALTER TABLE "PlageHoraire" DROP CONSTRAINT "PlageHoraire_plageHoraire_disponibiliteId_fkey";

-- DropForeignKey
ALTER TABLE "PlageHoraire" DROP CONSTRAINT "PlageHoraire_seanceId_fkey";

-- DropForeignKey
ALTER TABLE "Professeur" DROP CONSTRAINT "Professeur_disponibilite_professeurId_fkey";

-- DropForeignKey
ALTER TABLE "Professeur" DROP CONSTRAINT "Professeur_seanceId_fkey";

-- DropForeignKey
ALTER TABLE "Professeur" DROP CONSTRAINT "Professeur_specialite_professeurId_fkey";

-- DropForeignKey
ALTER TABLE "Programme" DROP CONSTRAINT "Programme_cours_programmeId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_userId_fkey";

-- DropForeignKey
ALTER TABLE "Salle" DROP CONSTRAINT "Salle_seanceId_fkey";

-- DropForeignKey
ALTER TABLE "Specialite" DROP CONSTRAINT "Specialite_specialite_professeurId_fkey";

-- DropForeignKey
ALTER TABLE "TypeDeSalle" DROP CONSTRAINT "TypeDeSalle_salleId_fkey";

-- AlterTable
ALTER TABLE "Cours" DROP COLUMN "cours_programmeId",
DROP COLUMN "seanceId";

-- AlterTable
ALTER TABLE "Cours_Programme" ADD COLUMN     "coursId" INTEGER NOT NULL,
ADD COLUMN     "programmeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Disponibilite" DROP COLUMN "disponibilite_professeurId",
DROP COLUMN "plageHoraire_disponibiliteId";

-- AlterTable
ALTER TABLE "Disponibilite_Professeur" ADD COLUMN     "disponibiliteId" INTEGER NOT NULL,
ADD COLUMN     "professeurId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlageHoraire" DROP COLUMN "plageHoraire_disponibiliteId",
DROP COLUMN "seanceId";

-- AlterTable
ALTER TABLE "PlageHoraire_Disponibilite" ADD COLUMN     "disponibiliteId" INTEGER NOT NULL,
ADD COLUMN     "plageHoraireId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Professeur" DROP COLUMN "disponibilite_professeurId",
DROP COLUMN "seanceId",
DROP COLUMN "specialite_professeurId";

-- AlterTable
ALTER TABLE "Programme" DROP COLUMN "cours_programmeId";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Salle" DROP COLUMN "seanceId",
ADD COLUMN     "typeDeSalleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Seance" ADD COLUMN     "coursId" INTEGER NOT NULL,
ADD COLUMN     "plageHoraireId" INTEGER NOT NULL,
ADD COLUMN     "professeurId" INTEGER NOT NULL,
ADD COLUMN     "salleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Specialite" DROP COLUMN "specialite_professeurId";

-- AlterTable
ALTER TABLE "Specialite_Professeur" ADD COLUMN     "professeurId" INTEGER NOT NULL,
ADD COLUMN     "specialiteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TypeDeSalle" DROP COLUMN "salleId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salle" ADD CONSTRAINT "Salle_typeDeSalleId_fkey" FOREIGN KEY ("typeDeSalleId") REFERENCES "TypeDeSalle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "Salle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_plageHoraireId_fkey" FOREIGN KEY ("plageHoraireId") REFERENCES "PlageHoraire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours_Programme" ADD CONSTRAINT "Cours_Programme_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours_Programme" ADD CONSTRAINT "Cours_Programme_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialite_Professeur" ADD CONSTRAINT "Specialite_Professeur_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "Specialite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialite_Professeur" ADD CONSTRAINT "Specialite_Professeur_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilite_Professeur" ADD CONSTRAINT "Disponibilite_Professeur_disponibiliteId_fkey" FOREIGN KEY ("disponibiliteId") REFERENCES "Disponibilite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilite_Professeur" ADD CONSTRAINT "Disponibilite_Professeur_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlageHoraire_Disponibilite" ADD CONSTRAINT "PlageHoraire_Disponibilite_plageHoraireId_fkey" FOREIGN KEY ("plageHoraireId") REFERENCES "PlageHoraire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlageHoraire_Disponibilite" ADD CONSTRAINT "PlageHoraire_Disponibilite_disponibiliteId_fkey" FOREIGN KEY ("disponibiliteId") REFERENCES "Disponibilite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
