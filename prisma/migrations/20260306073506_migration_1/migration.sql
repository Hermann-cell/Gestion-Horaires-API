/*
  Warnings:

  - You are about to drop the `cours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cours_programmes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disponibilite_professeurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disponibilites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plage_horaire_disponibilites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plages_horaires` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professeurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `programmes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialite_professeurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `types_de_salle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cours_programmes" DROP CONSTRAINT "cours_programmes_cours_id_fkey";

-- DropForeignKey
ALTER TABLE "cours_programmes" DROP CONSTRAINT "cours_programmes_programme_id_fkey";

-- DropForeignKey
ALTER TABLE "disponibilite_professeurs" DROP CONSTRAINT "disponibilite_professeurs_disponibilite_id_fkey";

-- DropForeignKey
ALTER TABLE "disponibilite_professeurs" DROP CONSTRAINT "disponibilite_professeurs_professeur_id_fkey";

-- DropForeignKey
ALTER TABLE "plage_horaire_disponibilites" DROP CONSTRAINT "plage_horaire_disponibilites_disponibilite_id_fkey";

-- DropForeignKey
ALTER TABLE "plage_horaire_disponibilites" DROP CONSTRAINT "plage_horaire_disponibilites_plage_horaire_id_fkey";

-- DropForeignKey
ALTER TABLE "salles" DROP CONSTRAINT "salles_type_de_salle_id_fkey";

-- DropForeignKey
ALTER TABLE "seances" DROP CONSTRAINT "seances_cours_id_fkey";

-- DropForeignKey
ALTER TABLE "seances" DROP CONSTRAINT "seances_plage_horaire_id_fkey";

-- DropForeignKey
ALTER TABLE "seances" DROP CONSTRAINT "seances_professeur_id_fkey";

-- DropForeignKey
ALTER TABLE "seances" DROP CONSTRAINT "seances_salle_id_fkey";

-- DropForeignKey
ALTER TABLE "specialite_professeurs" DROP CONSTRAINT "specialite_professeurs_professeur_id_fkey";

-- DropForeignKey
ALTER TABLE "specialite_professeurs" DROP CONSTRAINT "specialite_professeurs_specialite_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropTable
DROP TABLE "cours";

-- DropTable
DROP TABLE "cours_programmes";

-- DropTable
DROP TABLE "disponibilite_professeurs";

-- DropTable
DROP TABLE "disponibilites";

-- DropTable
DROP TABLE "plage_horaire_disponibilites";

-- DropTable
DROP TABLE "plages_horaires";

-- DropTable
DROP TABLE "professeurs";

-- DropTable
DROP TABLE "programmes";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "salles";

-- DropTable
DROP TABLE "seances";

-- DropTable
DROP TABLE "specialite_professeurs";

-- DropTable
DROP TABLE "specialites";

-- DropTable
DROP TABLE "types_de_salle";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professeur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,

    CONSTRAINT "Professeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,

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

    CONSTRAINT "Cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salle" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "type_de_salle_id" INTEGER NOT NULL,

    CONSTRAINT "Salle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeDeSalle" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "TypeDeSalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialite" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Specialite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disponibilite" (
    "id" SERIAL NOT NULL,
    "jour" TEXT NOT NULL,

    CONSTRAINT "Disponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cours_id" INTEGER NOT NULL,
    "salle_id" INTEGER NOT NULL,
    "professeur_id" INTEGER NOT NULL,
    "plage_horaire_id" INTEGER NOT NULL,

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlageHoraire" (
    "id" SERIAL NOT NULL,
    "heure_debut" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3) NOT NULL,
    "statut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlageHoraire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cours_Programme" (
    "id" SERIAL NOT NULL,
    "cours_id" INTEGER NOT NULL,
    "programme_id" INTEGER NOT NULL,

    CONSTRAINT "Cours_Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialite_Professeur" (
    "id" SERIAL NOT NULL,
    "specialite_id" INTEGER NOT NULL,
    "professeur_id" INTEGER NOT NULL,

    CONSTRAINT "Specialite_Professeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disponibilite_Professeur" (
    "id" SERIAL NOT NULL,
    "disponibilite_id" INTEGER NOT NULL,
    "professeur_id" INTEGER NOT NULL,

    CONSTRAINT "Disponibilite_Professeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlageHoraire_Disponibilite" (
    "id" SERIAL NOT NULL,
    "plage_horaire_id" INTEGER NOT NULL,
    "disponibilite_id" INTEGER NOT NULL,

    CONSTRAINT "PlageHoraire_Disponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cours_code_key" ON "Cours"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salle" ADD CONSTRAINT "Salle_type_de_salle_id_fkey" FOREIGN KEY ("type_de_salle_id") REFERENCES "TypeDeSalle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "Salle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_plage_horaire_id_fkey" FOREIGN KEY ("plage_horaire_id") REFERENCES "PlageHoraire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours_Programme" ADD CONSTRAINT "Cours_Programme_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours_Programme" ADD CONSTRAINT "Cours_Programme_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "Programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialite_Professeur" ADD CONSTRAINT "Specialite_Professeur_specialite_id_fkey" FOREIGN KEY ("specialite_id") REFERENCES "Specialite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialite_Professeur" ADD CONSTRAINT "Specialite_Professeur_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilite_Professeur" ADD CONSTRAINT "Disponibilite_Professeur_disponibilite_id_fkey" FOREIGN KEY ("disponibilite_id") REFERENCES "Disponibilite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disponibilite_Professeur" ADD CONSTRAINT "Disponibilite_Professeur_professeur_id_fkey" FOREIGN KEY ("professeur_id") REFERENCES "Professeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlageHoraire_Disponibilite" ADD CONSTRAINT "PlageHoraire_Disponibilite_plage_horaire_id_fkey" FOREIGN KEY ("plage_horaire_id") REFERENCES "PlageHoraire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlageHoraire_Disponibilite" ADD CONSTRAINT "PlageHoraire_Disponibilite_disponibilite_id_fkey" FOREIGN KEY ("disponibilite_id") REFERENCES "Disponibilite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
