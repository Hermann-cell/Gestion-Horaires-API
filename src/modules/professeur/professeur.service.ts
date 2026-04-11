import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type UpdateProfesseurPayload = {
  nom?: string;
  prenom?: string;
  modifierPar: string;
  disponibilites?: Array<{ jour: string; heure_debut: string; heure_fin: string }>;
};

export type CreateProfesseurPayload = { nom: string; prenom: string; creerPar: string };

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
  return app.prisma.professeur.create({
    data: { nom: data.nom, prenom: data.prenom, matricule, creerPar: data.creerPar },
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
      await tx.plageHoraire_Disponibilite.create({
        data: {
          plageHoraireId: plage.id,
          disponibiliteId: jourEntry.id,
          creerPar: data.modifierPar
        }
      });
    }

    return updatedProf;
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

  //  Calcul du jour
  const joursMap = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi"
  ];

  const jour = joursMap[new Date(seance.date).getDay()] ?? "dimanche";

  //  Récupération disponibilité
  const disponibilite = await app.prisma.disponibilite.findFirst({
    where: {
      professeurId,
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
  });

  if (!disponibilite) {
    throw new Error("Professeur non disponible ce jour");
  }

  //  COMPARAISON PAR HEURE (CORRECTION MAJEURE)
  const heureSeance = new Date(seance.plageHoraire.heure_debut).getHours();

  const estDisponible = disponibilite.plageHoraire_Disponibilites.some((ph) => {
    const heureDispo = new Date(ph.plageHoraire.heure_debut).getHours();
    return heureDispo === heureSeance;
  });

  if (!estDisponible) {
    throw new Error("Séance hors disponibilité du professeur");
  }

  //  Vérifier conflit
  const conflit = await app.prisma.seance.findFirst({
    where: {
      professeurId,
      date: seance.date,
      plageHoraireId: seance.plageHoraireId,
      NOT: { id: seanceId }
    }
  });

  if (conflit) {
    throw new Error("Conflit : le professeur a déjà une séance à cet horaire");
  }

  //  Affectation
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