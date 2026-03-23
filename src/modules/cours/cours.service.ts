import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

/*
================================
TYPES
================================
*/
export type CreateCoursPayload = {
  nom: string;
  code: string;
  duree: number;
  etape: number;
  creerPar?: string | null;
};

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
CREATE
================================
*/
export async function createCours(
  app: FastifyInstance,
  data: CreateCoursPayload
) {
  return app.prisma.cours.create({
    data,
  });
}

/*
================================
GET ALL
================================
*/
export async function getAllCours(app: FastifyInstance) {
  return app.prisma.cours.findMany({
    where: { supprimeLe: null },
    include: {
      seances: true,
      cours_programmes: {
        include: { programme: true },
      },
    },
    orderBy: { id: "desc" },
  });
}

/*
================================
GET BY ID
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
        include: { programme: true },
      },
    },
  });
}

/*
================================
UPDATE
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
      ...data,
      modifierLe: new Date(),
    },
    include: {
      seances: true,
      cours_programmes: {
        include: { programme: true },
      },
    },
  });
}

/*
================================
SOFT DELETE
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
PRISMA ERROR
================================
*/
export function isPrismaKnownError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}