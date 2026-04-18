import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type UpdateProfesseurPayload = {
  nom?: string;
  prenom?: string;
  modifierPar: string;
  disponibilites?: Array<{ jour: string; heure_debut: string; heure_fin: string }>;
};

export type CreateProfesseurPayload = { nom: string; prenom: string; creerPar: string; specialiteIds?: number[] };

async function generateNextMatricule(app: FastifyInstance): Promise<string> {
  const professeurs = await app.prisma.professeur.findMany({ select: { matricule: true } });
  let maxNum = 0;
  for (const prof of professeurs) {
    const match = /^PROF(\d+)$/i.exec(prof.matricule ?? "");
    if (match) {
      const num = Number(match[1]);
      if (!Number.isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  return `PROF${String(maxNum + 1).padStart(3, "0")}`;
}

export async function getProfesseurById(app: FastifyInstance, id: number) {
  return app.prisma.professeur.findFirst({
    where: { id, supprimeLe: null },
    include: {
      seances: {
        include: {
          cours: true,
          plageHoraire: {
            include: {
              plageHoraire_Disponibilites: {
                include: { disponibilite: true }
              }
            }
          }
        }
      },
      specialite_professeurs: { include: { specialite: true } },
      disponibilites: {
        include: {
          plageHoraire_Disponibilites: {
            include: {
              plageHoraire: true
            }
          }
        }
      }
    },
  });
}

export async function getAllProfesseurs(app: FastifyInstance) {
  return app.prisma.professeur.findMany({ where: { supprimeLe: null }, orderBy: { id: "asc" } });
}

export async function createProfesseur(app: FastifyInstance, data: CreateProfesseurPayload) {
  const matricule = await generateNextMatricule(app);
  
  return app.prisma.$transaction(async (tx) => {
    // Créer le professeur
    const prof = await tx.professeur.create({
      data: { nom: data.nom, prenom: data.prenom, matricule, creerPar: data.creerPar },
    });

    // Assigner les spécialités si fournies
    if (data.specialiteIds && data.specialiteIds.length > 0) {
      for (const specialiteId of data.specialiteIds) {
        await tx.specialite_Professeur.upsert({
          where: {
            professeurId_specialiteId: {
              professeurId: prof.id,
              specialiteId,
            },
          },
          update: {},
          create: {
            professeurId: prof.id,
            specialiteId,
            creerPar: data.creerPar,
            creerLe: new Date(),
          },
        });
      }
    }

    return prof;
  });
}

export async function updateProfesseur(
  app: FastifyInstance,
  id: number,
  data: UpdateProfesseurPayload
) {
  return app.prisma.$transaction(async (tx) => {

    // 1. Update du professeur
    const updatedProf = await tx.professeur.update({
      where: { id },
      data: {
        ...(data.nom && { nom: data.nom }),
        ...(data.prenom && { prenom: data.prenom }),
        modifierLe: new Date(),
        modifierPar: data.modifierPar,
      },
    });

    if (!data.disponibilites) return updatedProf;

    // 2. Suppression des anciennes dispos
    await tx.plageHoraire_Disponibilite.deleteMany({
      where: {
        disponibilite: {
          professeurId: id
        }
      }
    });

    await tx.disponibilite.deleteMany({
      where: { professeurId: id }
    });

    // 3. Reconstruction PROPRE avec DATE FIXE
    for (const d of data.disponibilites) {

      // 🔥 NORMALISATION JOUR (CRITIQUE)
      const jour = d.jour.toLowerCase();

      const jourEntry = await tx.disponibilite.upsert({
        where: {
          professeurId_jour: {
            professeurId: id,
            jour
          }
        },
        update: {},
        create: {
          jour,
          professeurId: id,
          creerPar: data.modifierPar
        }
      });

      // 🔥 DATE FIXE pour éviter les bugs
      const baseDate = new Date("1970-01-01T00:00:00");

      const hDebut = new Date(baseDate);
      hDebut.setHours(parseInt(d.heure_debut), 0, 0, 0);

      const hFin = new Date(baseDate);
      hFin.setHours(parseInt(d.heure_fin), 0, 0, 0);

      // Recherche ou création de la plage
      let plage = await tx.plageHoraire.findFirst({
        where: {
          heure_debut: hDebut,
          heure_fin: hFin
        }
      });

      if (!plage) {
        plage = await tx.plageHoraire.create({
          data: {
            heure_debut: hDebut,
            heure_fin: hFin,
            statut: true,
            creerPar: data.modifierPar
          }
        });
      }

      // Liaison
      await tx.plageHoraire_Disponibilite.upsert({
        where: {
          plageHoraireId_disponibiliteId: {
            plageHoraireId: plage.id,
            disponibiliteId: jourEntry.id
          }
        },
        update: {},
        create: {
          plageHoraireId: plage.id,
          disponibiliteId: jourEntry.id,
          creerPar: data.modifierPar
        }
      });
    }

    // Retourner le professeur avec les disponibilités complètes
    return tx.professeur.findFirst({
      where: { id },
      include: {
        seances: {
          include: {
            cours: true,
            plageHoraire: {
              include: {
                plageHoraire_Disponibilites: {
                  include: { disponibilite: true }
                }
              }
            }
          }
        },
        specialite_professeurs: { include: { specialite: true } },
        disponibilites: {
          include: {
            plageHoraire_Disponibilites: {
              include: {
                plageHoraire: true
              }
            }
          }
        }
      }
    });
  });
}

export async function softDeleteProfesseur(app: FastifyInstance, id: number, supprimePar: string) {
  const seance = await app.prisma.seance.findFirst({ where: { professeurId: id, supprimeLe: null } });
  if (seance) throw new Error("Impossible : professeur affecté à une séance");
  return app.prisma.professeur.update({ where: { id }, data: { supprimeLe: new Date(), supprimePar } });
}


// utilitaire robuste pour gérer les jours
function getJourFromDate(dateInput: Date): string {
  const joursMap = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi"
  ];

  const date = new Date(dateInput);

  // correction timezone Canada
  const localDate = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Toronto" })
  );

  return joursMap[localDate.getDay()] ?? "dimanche";
}

export async function affecterProfesseurASeance(
  app: FastifyInstance,
  professeurId: number,
  seanceId: number,
  auteur: string
) {
  const seance = await app.prisma.seance.findUnique({
    where: { id: seanceId },
    include: {
      plageHoraire: true,
      cours: true
    }
  });

  if (!seance) throw new Error("Séance introuvable");

  // Calcul du jour avec normalisation en minuscules
  const joursMap = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi"
  ];

  const jour = joursMap[new Date(seance.date).getDay()]?.toLowerCase() ?? "dimanche";

  // Récupération du professeur avec ses disponibilités
  const prof = await app.prisma.professeur.findUnique({
    where: { id: professeurId },
    include: {
      disponibilites: {
        where: { 
          jour: {
            equals: jour,
            mode: "insensitive"
          },
          supprimeLe: null
        },
        include: {
          plageHoraire_Disponibilites: {
            include: {
              plageHoraire: true
            }
          }
        }
      }
    }
  });

  if (!prof) throw new Error("Professeur introuvable");

  // Vérifier que le professeur a au moins une disponibilité pour ce jour
  if (!prof.disponibilites || prof.disponibilites.length === 0) {
    throw new Error(`Professeur non disponible le ${jour}`);
  }

  // Récupération de l'heure de début de la séance (extraction robuste)
  const heureDebut = new Date(seance.plageHoraire.heure_debut);
  const heureSeance = heureDebut.getHours();

  // Vérifier que le professeur a une disponibilité à cette heure
  const disponibiliteValide = prof.disponibilites[0]?.plageHoraire_Disponibilites?.some((ph) => {
    const plageHeure = new Date(ph.plageHoraire.heure_debut).getHours();
    return plageHeure === heureSeance;
  });

  if (!disponibiliteValide) {
    const heuresDisponibles = prof.disponibilites[0]?.plageHoraire_Disponibilites
      ?.map(ph => new Date(ph.plageHoraire.heure_debut).getHours())
      ?.join(", ") || "Aucune";
    throw new Error(
      `Séance à ${heureSeance}h hors disponibilité. Heures disponibles: ${heuresDisponibles}h`
    );
  }

  // Vérifier conflit (prof déjà assigné à cette date/horaire)
  const conflit = await app.prisma.seance.findFirst({
    where: {
      professeurId,
      date: seance.date,
      plageHoraireId: seance.plageHoraireId,
      NOT: { id: seanceId },
      supprimeLe: null
    }
  });

  if (conflit) {
    throw new Error("Conflit : le professeur a déjà une séance à cet horaire");
  }

  // Affectation
  return app.prisma.seance.update({
    where: { id: seanceId },
    data: {
      professeurId,
      modifierPar: auteur,
      modifierLe: new Date()
    }
  });
}

export async function getSeancesSansProfesseur(app: FastifyInstance) {
  return app.prisma.seance.findMany({
    where: {
      professeurId: null,
      supprimeLe: null
    },
    include: {
      cours: true,
      plageHoraire: {
        include: {
          // On va chercher la jointure vers la disponibilité
          plageHoraire_Disponibilites: {
            include: {
              disponibilite: true
            }
          }
        }
      }
    }
  });
}

export async function getAllProfesseursWithPlanning(app: FastifyInstance) {
  return app.prisma.professeur.findMany({
    where: { supprimeLe: null },
    orderBy: { id: "asc" },
    include: {
      seances: {
        where: { supprimeLe: null },
        orderBy: { date: "asc" },
        include: {
          cours: true,
          salle: true,
          plageHoraire: {
            include: {
              plageHoraire_Disponibilites: {
                include: {
                  disponibilite: true,
                },
              },
            },
          },
        },
      },
      specialite_professeurs: {
        include: {
          specialite: true,
        },
      },
      disponibilites: {
        include: {
          plageHoraire_Disponibilites: {
            include: {
              plageHoraire: true
            }
          }
        }
      }
    },
  });
}

export function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}