import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type UpdateProfesseurPayload = {
  nom?: string;
  prenom?: string;
  modifierPar: string; // Obligatoire pour la traçabilité
  disponibilites?: Array<{ jour: string; heure_debut: string; heure_fin: string }>;
};

export type CreateProfesseurPayload = {
  nom: string;
  prenom: string;
  creerPar: string; // Ajouté pour la traçabilité
};

// --- Fonctions utilitaires ---
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

// --- Lecture (Inchangé) ---
export async function getProfesseurById(app: FastifyInstance, id: number) {
  return app.prisma.professeur.findFirst({
    where: { id, supprimeLe: null },
    include: {
      seances: true,
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
  return app.prisma.professeur.findMany({
    where: { supprimeLe: null },
    orderBy: { id: "asc" },
  });
}

// --- Création avec traçabilité ---
export async function createProfesseur(app: FastifyInstance, data: CreateProfesseurPayload) {
  const matricule = await generateNextMatricule(app);
  return app.prisma.professeur.create({
    data: { 
      nom: data.nom, 
      prenom: data.prenom, 
      matricule,
      creerPar: data.creerPar,
      creerLe: new Date()
    },
  });
}

// --- Mise à jour avec traçabilité ---
export async function updateProfesseur(app: FastifyInstance, id: number, data: UpdateProfesseurPayload) {
  return app.prisma.$transaction(async (tx) => {
    
    const updateData: Prisma.ProfesseurUpdateInput = {
      modifierLe: new Date(),
      modifierPar: data.modifierPar, // L'auteur vient du payload (token JWT)
    };

    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.prenom !== undefined) updateData.prenom = data.prenom;

    const updatedProf = await tx.professeur.update({
      where: { id },
      data: updateData,
    });

    if (data.disponibilites) {
      // Pour les tables de jointure, on peut aussi tracer qui a modifié les dispos
      await tx.disponibilite_Professeur.deleteMany({ where: { professeurId: id } });

      for (const d of data.disponibilites) {
        const jourEntry = await tx.disponibilite.create({
          data: { 
            jour: d.jour,
            creerPar: data.modifierPar 
          }
        });

        const dateRef = new Date();
        const hDebut = new Date(dateRef.setHours(parseInt(d.heure_debut), 0, 0, 0));
        const hFin = new Date(dateRef.setHours(parseInt(d.heure_fin), 0, 0, 0));

        const plage = await tx.plageHoraire.create({
          data: { 
            heure_debut: hDebut, 
            heure_fin: hFin, 
            statut: true,
            creerPar: data.modifierPar
          }
        });

        await tx.plageHoraire_Disponibilite.create({
          data: { 
            disponibiliteId: jourEntry.id, 
            plageHoraireId: plage.id,
            creerPar: data.modifierPar
          }
        });

        await tx.disponibilite_Professeur.create({
          data: { 
            professeurId: id, 
            disponibiliteId: jourEntry.id,
            creerPar: data.modifierPar
          }
        });
      }
    }
    return updatedProf;
  });
}

// --- Suppression avec traçabilité ---
export async function softDeleteProfesseur(app: FastifyInstance, id: number, supprimePar: string) {
  const seance = await app.prisma.seance.findFirst({ where: { professeurId: id, supprimeLe: null } });
  if (seance) throw new Error("Impossible : professeur affecté à une séance");

  return app.prisma.professeur.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
      supprimePar: supprimePar, // Reçu du controller (user.fullname ou id)
    },
  });
}

export function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}