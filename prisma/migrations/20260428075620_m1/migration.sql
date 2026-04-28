-- DropIndex
DROP INDEX "Disponibilite_professeurId_jour_key";

-- CreateIndex
CREATE INDEX "Disponibilite_professeurId_jour_idx" ON "Disponibilite"("professeurId", "jour");
