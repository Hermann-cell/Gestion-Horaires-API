/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mot_de_passe]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mot_de_passe` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "mot_de_passe" TEXT NOT NULL,
ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "prenom" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Professeur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "seanceId" INTEGER NOT NULL,
    "specialite_professeurId" INTEGER NOT NULL,
    "disponibilite_professeurId" INTEGER NOT NULL,

    CONSTRAINT "Professeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cours" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "duree" INTEGER NOT NULL,
    "etape" INTEGER NOT NULL,
    "est_harchive" BOOLEAN NOT NULL DEFAULT false,
    "seanceId" INTEGER NOT NULL,
    "cours_programmeId" INTEGER NOT NULL,

    CONSTRAINT "Cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cours_programmeId" INTEGER NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salle" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "seanceId" INTEGER NOT NULL,

    CONSTRAINT "Salle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeDeSalle" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "salleId" INTEGER NOT NULL,

    CONSTRAINT "TypeDeSalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialite" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "specialite_professeurId" INTEGER NOT NULL,

    CONSTRAINT "Specialite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disponibilite" (
    "id" SERIAL NOT NULL,
    "jour" TEXT NOT NULL,
    "disponibilite_professeurId" INTEGER NOT NULL,
    "plageHoraire_disponibiliteId" INTEGER NOT NULL,

    CONSTRAINT "Disponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlageHoraire" (
    "id" SERIAL NOT NULL,
    "heure_debut" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3) NOT NULL,
    "statut" BOOLEAN NOT NULL DEFAULT false,
    "seanceId" INTEGER NOT NULL,
    "plageHoraire_disponibiliteId" INTEGER NOT NULL,

    CONSTRAINT "PlageHoraire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cours_Programme" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Cours_Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialite_Professeur" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Specialite_Professeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disponibilite_Professeur" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Disponibilite_Professeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlageHoraire_Disponibilite" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "PlageHoraire_Disponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cours_code_key" ON "Cours"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_mot_de_passe_key" ON "User"("mot_de_passe");

-- AddForeignKey
ALTER TABLE "Professeur" ADD CONSTRAINT "Professeur_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professeur" ADD CONSTRAINT "Professeur_specialite_professeurId_fkey" FOREIGN KEY ("specialite_professeurId") REFERENCES "Specialite_Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professeur" ADD CONSTRAINT "Professeur_disponibilite_professeurId_fkey" FOREIGN KEY ("disponibilite_professeurId") REFERENCES "Disponibilite_Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_cours_programmeId_fkey" FOREIGN KEY ("cours_programmeId") REFERENCES "Cours_Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_cours_programmeId_fkey" FOREIGN KEY ("cours_programmeId") REFERENCES "Cours_Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salle" ADD CONSTRAINT "Salle_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeDeSalle" ADD CONSTRAINT "TypeDeSalle_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "Salle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialite" ADD CONSTRAINT "Specialite_specialite_professeurId_fkey" FOREIGN KEY ("specialite_professeurId") REFERENCES "Specialite_Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilite" ADD CONSTRAINT "Disponibilite_disponibilite_professeurId_fkey" FOREIGN KEY ("disponibilite_professeurId") REFERENCES "Disponibilite_Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilite" ADD CONSTRAINT "Disponibilite_plageHoraire_disponibiliteId_fkey" FOREIGN KEY ("plageHoraire_disponibiliteId") REFERENCES "PlageHoraire_Disponibilite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlageHoraire" ADD CONSTRAINT "PlageHoraire_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlageHoraire" ADD CONSTRAINT "PlageHoraire_plageHoraire_disponibiliteId_fkey" FOREIGN KEY ("plageHoraire_disponibiliteId") REFERENCES "PlageHoraire_Disponibilite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
