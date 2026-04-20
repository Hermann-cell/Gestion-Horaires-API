/*
  Warnings:

  - Added the required column `nom` to the `Salle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Salle" ADD COLUMN     "description" TEXT,
ADD COLUMN     "nom" TEXT NOT NULL;
