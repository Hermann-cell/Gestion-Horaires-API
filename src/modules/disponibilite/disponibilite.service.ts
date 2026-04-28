import { Prisma } from "@prisma/client";

type DispoInput = {
  jour: string;
  heure_debut: string;
  heure_fin: string;
};

export async function updateDisponibilites(
  tx: Prisma.TransactionClient,
  professeurId: number,
  disponibilites: DispoInput[],
  auteur: string
) {

  // ✅ 1. Nettoyage + validation de base
  const clean = disponibilites
    .filter(d => d.jour && d.heure_debut && d.heure_fin)
    .map(d => {
      const heure_debut = Number(d.heure_debut);
      const heure_fin = Number(d.heure_fin);

      if (isNaN(heure_debut) || isNaN(heure_fin)) {
        throw new Error("Heures invalides");
      }

      if (heure_debut >= heure_fin) {
        throw new Error(`Heure début >= heure fin pour ${d.jour}`);
      }

      return {
        jour: d.jour.toLowerCase().trim(),
        heure_debut,
        heure_fin
      };
    });

  // ✅ 2. Suppression des doublons (ULTRA IMPORTANT)
  const uniqueMap = new Map<string, typeof clean[0]>();

  for (const d of clean) {
    const key = `${d.jour}-${d.heure_debut}-${d.heure_fin}`;
    uniqueMap.set(key, d);
  }

  const unique = Array.from(uniqueMap.values());

  // ✅ 3. Groupement typé
  const grouped: Record<string, typeof unique> = {};

  for (const d of unique) {
    if (!grouped[d.jour]) {
      grouped[d.jour] = [];
    }
    grouped[d.jour]!.push(d);
  }

  // ✅ 4. Validation chevauchement (CRITIQUE)
  for (const jour in grouped) {
    const slots = grouped[jour]!.sort(
      (a, b) => a.heure_debut - b.heure_debut
    );

    for (let i = 0; i < slots.length - 1; i++) {
      if (slots[i]!.heure_fin > slots[i + 1]!.heure_debut) {
        throw new Error(`Chevauchement détecté le ${jour}`);
      }
    }
  }

  // ✅ 5. Suppression propre
  await tx.plageHoraire_Disponibilite.deleteMany({
    where: {
      disponibilite: {
        professeurId
      }
    }
  });

  await tx.disponibilite.deleteMany({
    where: { professeurId }
  });

  // ✅ 6. Création
  for (const d of unique) {

    const dispo = await tx.disponibilite.create({
      data: {
        jour: d.jour,
        professeurId,
        creerPar: auteur
      }
    });

    let plage = await tx.plageHoraire.findUnique({
      where: {
        heure_debut_heure_fin: {
          heure_debut: d.heure_debut,
          heure_fin: d.heure_fin
        }
      }
    });

    if (!plage) {
      plage = await tx.plageHoraire.create({
        data: {
          heure_debut: d.heure_debut,
          heure_fin: d.heure_fin,
          statut: true,
          creerPar: auteur
        }
      });
    }

    await tx.plageHoraire_Disponibilite.create({
      data: {
        plageHoraireId: plage.id,
        disponibiliteId: dispo.id,
        creerPar: auteur
      }
    });
  }
}