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
      disponibilite_professeurs: {
        include: {
          disponibilite: {
            include: {
              plageHoraire_Disponibilites: { include: { plageHoraire: true } }
            }
          }
        }
      },
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

export async function updateProfesseur(app: FastifyInstance, id: number, data: UpdateProfesseurPayload) {
  return app.prisma.$transaction(async (tx) => {
    const updatedProf = await tx.professeur.update({
      where: { id },
      data: {
        ...(data.nom && { nom: data.nom }),
        ...(data.prenom && { prenom: data.prenom }),
        modifierLe: new Date(),
        modifierPar: data.modifierPar,
      },
    });

    if (data.disponibilites) {
      await tx.disponibilite_Professeur.deleteMany({ where: { professeurId: id } });
      for (const d of data.disponibilites) {
        const jourEntry = await tx.disponibilite.create({
          data: { jour: d.jour, creerPar: data.modifierPar }
        });
        const dateRef = new Date();
        const hDebut = new Date(dateRef.setHours(parseInt(d.heure_debut), 0, 0, 0));
        const hFin = new Date(dateRef.setHours(parseInt(d.heure_fin), 0, 0, 0));
        const plage = await tx.plageHoraire.create({
          data: { heure_debut: hDebut, heure_fin: hFin, statut: true, creerPar: data.modifierPar }
        });
        await tx.plageHoraire_Disponibilite.create({
          data: { disponibiliteId: jourEntry.id, plageHoraireId: plage.id, creerPar: data.modifierPar }
        });
        await tx.disponibilite_Professeur.create({
          data: { professeurId: id, disponibiliteId: jourEntry.id, creerPar: data.modifierPar }
        });
      }
    }
    return updatedProf;
  });
}

export async function softDeleteProfesseur(app: FastifyInstance, id: number, supprimePar: string) {
  const seance = await app.prisma.seance.findFirst({ where: { professeurId: id, supprimeLe: null } });
  if (seance) throw new Error("Impossible : professeur affecté à une séance");
  return app.prisma.professeur.update({ where: { id }, data: { supprimeLe: new Date(), supprimePar } });
}

export async function affecterProfesseurASeance(app: FastifyInstance, professeurId: number, seanceId: number, auteur: string) {
  return app.prisma.seance.update({
    where: { id: seanceId },
    data: { professeurId, modifierPar: auteur, modifierLe: new Date() }
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
      disponibilite_professeurs: {
        include: {
          disponibilite: {
            include: {
              plageHoraire_Disponibilites: {
                include: {
                  plageHoraire: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}