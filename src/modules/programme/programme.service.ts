import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type CreateProgrammePayload = {
  nom: string;
  description?: string | null;
  creerPar?: string | null;
};

export type UpdateProgrammePayload = {
  nom?: string;
  description?: string | null;
  modifierPar?: string | null;
};

/*
================================
API SERVICE : CREATE PROGRAMME
================================
*/
export async function createProgramme(
  app: FastifyInstance,
  data: CreateProgrammePayload
) {
  return app.prisma.programme.create({
    data: {
      nom: data.nom,
      ...("description" in data ? { description: data.description } : {}),
      ...("creerPar" in data ? { creerPar: data.creerPar } : {}),
    },
    include: {
      cours_programmes: {
        include: {
          cours: true,
        },
      },
    },
  });
}

/*
================================
API SERVICE : GET ALL PROGRAMMES
================================
*/
export async function getAllProgrammes(app: FastifyInstance) {
  return app.prisma.programme.findMany({
    where: {
      supprimeLe: null,
    },
    include: {
      cours_programmes: {
        include: {
          cours: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}

/*
================================
API SERVICE : GET PROGRAMME BY ID
================================
*/
export async function getProgrammeById(app: FastifyInstance, id: number) {
  return app.prisma.programme.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      cours_programmes: {
        include: {
          cours: true,
        },
      },
    },
  });
}

/*
================================
API SERVICE : UPDATE PROGRAMME
================================
*/
export async function updateProgramme(
  app: FastifyInstance,
  id: number,
  data: UpdateProgrammePayload
) {
  return app.prisma.programme.update({
    where: { id },
    data: {
      ...("nom" in data ? { nom: data.nom } : {}),
      ...("description" in data ? { description: data.description } : {}),
      ...("modifierPar" in data ? { modifierPar: data.modifierPar } : {}),
      modifierLe: new Date(),
    },
    include: {
      cours_programmes: {
        include: {
          cours: true,
        },
      },
    },
  });
}

/*
================================
API SERVICE : DELETE PROGRAMME 
================================
*/
export async function softDeleteProgramme(
  app: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  return app.prisma.programme.update({
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