/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Salle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nom]` on the table `TypeDeSalle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cours" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "Cours_Programme" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "Disponibilite" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "Disponibilite_Professeur" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "PlageHoraire" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "PlageHoraire_Disponibilite" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "Professeur" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT,
ALTER COLUMN "nom" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Programme" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Salle" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "Seance" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "Specialite" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "Specialite_Professeur" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT;

-- AlterTable
ALTER TABLE "TypeDeSalle" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creerLe" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creerPar" TEXT,
ADD COLUMN     "modifierLe" TIMESTAMP(3),
ADD COLUMN     "modifierPar" TEXT,
ADD COLUMN     "statut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supprimeLe" TIMESTAMP(3),
ADD COLUMN     "supprimePar" TEXT,
ALTER COLUMN "nom" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Role_nom_key" ON "Role"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Salle_code_key" ON "Salle"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TypeDeSalle_nom_key" ON "TypeDeSalle"("nom");
