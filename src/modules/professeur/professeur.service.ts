import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type UpdateProfesseurPayload = {
  nom?: string;
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
API SERVICE : CREATE PROFESSEUR
================================
*/
export type CreateProfesseurPayload = {
  nom: string;
  prenom: string;
  matricule: string;
};

export async function createProfesseur(
  app: FastifyInstance,
  data: CreateProfesseurPayload
) {
  const existingMatricule = await app.prisma.professeur.findFirst({
    where: {
      matricule: {
        equals: data.matricule,
        mode: "insensitive",
      },
      supprimeLe: null,
    },
  });

  if (existingMatricule) {
    throw new Error("Un professeur avec ce matricule existe déjà");
  }

  return app.prisma.professeur.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      matricule: data.matricule,
    },
  });
}

export async function getAllProfesseurs(app: FastifyInstance) {
  return app.prisma.professeur.findMany({
    where: {
      supprimeLe: null,
    },
    orderBy: {
      id: "asc",
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
  const professeur = await app.prisma.professeur.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });

  if (!professeur) {
    throw new Error("Professeur introuvable ou déjà supprimé");
  }

  if (data.matricule !== undefined) {
    const existingMatricule = await app.prisma.professeur.findFirst({
      where: {
        matricule: {
          equals: data.matricule,
          mode: "insensitive",
        },
        supprimeLe: null,
        NOT: { id },
      },
    });

    if (existingMatricule) {
      throw new Error("Un professeur avec ce matricule existe déjà");
    }
  }

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
  const professeur = await app.prisma.professeur.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });

  if (!professeur) {
    throw new Error("Professeur introuvable ou déjà supprimé");
  }

  const seanceAffectee = await app.prisma.seance.findFirst({
    where: {
      professeurId: id,
      supprimeLe: null,
    },
  });

  if (seanceAffectee) {
    throw new Error(
      "Impossible de supprimer ce professeur car il est affecté à une séance"
    );
  }

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