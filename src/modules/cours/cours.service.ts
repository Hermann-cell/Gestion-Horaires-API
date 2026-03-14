import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type UpdateCoursPayload = {
  nom?: string;
  code?: string;
  duree?: number;
  etape?: number;
  est_harchive?: boolean;
  modifierPar?: string | null;
};

/*
================================
API SERVICE : GET COURS BY ID
================================
*/
export async function getCoursById(app: FastifyInstance, id: number) {
  return app.prisma.cours.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      seances: true,
      cours_programmes: {
        include: {
          programme: true,
        },
      },
    },
  });
}

/*
================================
API SERVICE : UPDATE COURS
================================
*/
export async function updateCours(
  app: FastifyInstance,
  id: number,
  data: UpdateCoursPayload
) {
  return app.prisma.cours.update({
    where: { id },
    data: {
      ...("nom" in data ? { nom: data.nom } : {}),
      ...("code" in data ? { code: data.code } : {}),
      ...("duree" in data ? { duree: data.duree } : {}),
      ...("etape" in data ? { etape: data.etape } : {}),
      ...("est_harchive" in data ? { est_harchive: data.est_harchive } : {}),
      ...("modifierPar" in data ? { modifierPar: data.modifierPar } : {}),
      modifierLe: new Date(),
    },
    include: {
      seances: true,
      cours_programmes: {
        include: {
          programme: true,
        },
      },
    },
  });
}

/*
================================
API SERVICE : DELETE COURS (SOFT DELETE)
================================
*/
export async function softDeleteCours(
  app: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  return app.prisma.cours.update({
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