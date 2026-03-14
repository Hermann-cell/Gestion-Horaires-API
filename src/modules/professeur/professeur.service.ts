import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type UpdateProfesseurPayload = {
  nom?: string | null;
  prenom?: string;
  matricule?: string;
  modifierPar?: string | null;
};

/*
================================
API SERVICE : GET PROFESSEUR
================================
*/
export async function getProfesseurById(app: FastifyInstance, id: number) {
  return app.prisma.professeur.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      seances: true,
      specialite_professeurs: {
        include: {
          specialite: true,
        },
      },
      disponibilite_professeurs: {
        include: {
          disponibilite: true,
        },
      },
    },
  });
}

/*
================================
API SERVICE : UPDATE PROFESSEUR
================================
*/
export async function updateProfesseur(
  app: FastifyInstance,
  id: number,
  data: UpdateProfesseurPayload
) {
  return app.prisma.professeur.update({
    where: { id },
    data: {
      ...("nom" in data ? { nom: data.nom } : {}),
      ...("prenom" in data ? { prenom: data.prenom } : {}),
      ...("matricule" in data ? { matricule: data.matricule } : {}),
      ...("modifierPar" in data ? { modifierPar: data.modifierPar } : {}),
      modifierLe: new Date(),
    },
  });
}

/*
================================
API SERVICE : DELETE PROFESSEUR 
================================
*/
export async function softDeleteProfesseur(
  app: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  return app.prisma.professeur.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
      ...(supprimePar !== undefined ? { supprimePar } : {}),
    },
  });
}

/*
================================
GESTION DES ERREURS PRISMA
================================
*/
export function isPrismaKnownError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}