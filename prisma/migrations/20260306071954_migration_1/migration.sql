/*
  Warnings:

  - You are about to drop the `Cours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cours_Programme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Disponibilite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Disponibilite_Professeur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlageHoraire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlageHoraire_Disponibilite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Professeur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Programme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Salle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Seance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Specialite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Specialite_Professeur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeDeSalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cours_Programme" DROP CONSTRAINT "Cours_Programme_coursId_fkey";

-- DropForeignKey
ALTER TABLE "Cours_Programme" DROP CONSTRAINT "Cours_Programme_programmeId_fkey";

-- DropForeignKey
ALTER TABLE "Disponibilite_Professeur" DROP CONSTRAINT "Disponibilite_Professeur_disponibiliteId_fkey";

-- DropForeignKey
ALTER TABLE "Disponibilite_Professeur" DROP CONSTRAINT "Disponibilite_Professeur_professeurId_fkey";

-- DropForeignKey
ALTER TABLE "PlageHoraire_Disponibilite" DROP CONSTRAINT "PlageHoraire_Disponibilite_disponibiliteId_fkey";

-- DropForeignKey
ALTER TABLE "PlageHoraire_Disponibilite" DROP CONSTRAINT "PlageHoraire_Disponibilite_plageHoraireId_fkey";

-- DropForeignKey
ALTER TABLE "Salle" DROP CONSTRAINT "Salle_typeDeSalleId_fkey";

-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_coursId_fkey";

-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_plageHoraireId_fkey";

-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_professeurId_fkey";

-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_salleId_fkey";

-- DropForeignKey
ALTER TABLE "Specialite_Professeur" DROP CONSTRAINT "Specialite_Professeur_professeurId_fkey";

-- DropForeignKey
ALTER TABLE "Specialite_Professeur" DROP CONSTRAINT "Specialite_Professeur_specialiteId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropTable
DROP TABLE "Cours";

-- DropTable
DROP TABLE "Cours_Programme";

-- DropTable
DROP TABLE "Disponibilite";

-- DropTable
DROP TABLE "Disponibilite_Professeur";

-- DropTable
DROP TABLE "PlageHoraire";

-- DropTable
DROP TABLE "PlageHoraire_Disponibilite";

-- DropTable
DROP TABLE "Professeur";

-- DropTable
DROP TABLE "Programme";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "Salle";

-- DropTable
DROP TABLE "Seance";

-- DropTable
DROP TABLE "Specialite";

-- DropTable
DROP TABLE "Specialite_Professeur";

-- DropTable
DROP TABLE "TypeDeSalle";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cours" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "duree" INTEGER NOT NULL,
    "etape" INTEGER NOT NULL,
    "est_harchive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salles" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "type_de_salle_id" INTEGER NOT NULL,

    CONSTRAINT "salles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_de_salle" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "types_de_salle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialites" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "specialites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilites" (
    "id" SERIAL NOT NULL,
    "jour" TEXT NOT NULL,

    CONSTRAINT "disponibilites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seances" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cours_id" INTEGER NOT NULL,
    "salle_id" INTEGER NOT NULL,
    "professeur_id" INTEGER NOT NULL,
    "plage_horaire_id" INTEGER NOT NULL,

    CONSTRAINT "seances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plages_horaires" (
    "id" SERIAL NOT NULL,
    "heure_debut" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3) NOT NULL,
    "statut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "plages_horaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cours_programmes" (
    "id" SERIAL NOT NULL,
    "cours_id" INTEGER NOT NULL,
    "programme_id" INTEGER NOT NULL,

    CONSTRAINT "cours_programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialite_professeurs" (
    "id" SERIAL NOT NULL,
    "specialite_id" INTEGER NOT NULL,
    "professeur_id" INTEGER NOT NULL,

    CONSTRAINT "specialite_professeurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilite_professeurs" (
    "id" SERIAL NOT NULL,
    "disponibilite_id" INTEGER NOT NULL,
    "professeur_id" INTEGER NOT NULL,

    CONSTRAINT "disponibilite_professeurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plage_horaire_disponibilites" (
    "id" SERIAL NOT NULL,
    "plage_horaire_id" INTEGER NOT NULL,
    "disponibilite_id" INTEGER NOT NULL,

    CONSTRAINT "plage_horaire_disponibilites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cours_code_key" ON "cours"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salles" ADD CONSTRAINT "salles_type_de_salle_id_fkey" FOREIGN KEY ("type_de_salle_id") REFERENCES "types_de_salle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "salles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "professeurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "seances_plage_horaire_id_fkey" FOREIGN KEY ("plage_horaire_id") REFERENCES "plages_horaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours_programmes" ADD CONSTRAINT "cours_programmes_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours_programmes" ADD CONSTRAINT "cours_programmes_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialite_professeurs" ADD CONSTRAINT "specialite_professeurs_specialite_id_fkey" FOREIGN KEY ("specialite_id") REFERENCES "specialites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialite_professeurs" ADD CONSTRAINT "specialite_professeurs_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "professeurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilite_professeurs" ADD CONSTRAINT "disponibilite_professeurs_disponibilite_id_fkey" FOREIGN KEY ("disponibilite_id") REFERENCES "disponibilites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilite_professeurs" ADD CONSTRAINT "disponibilite_professeurs_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "professeurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plage_horaire_disponibilites" ADD CONSTRAINT "plage_horaire_disponibilites_plage_horaire_id_fkey" FOREIGN KEY ("plage_horaire_id") REFERENCES "plages_horaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plage_horaire_disponibilites" ADD CONSTRAINT "plage_horaire_disponibilites_disponibilite_id_fkey" FOREIGN KEY ("disponibilite_id") REFERENCES "disponibilites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
