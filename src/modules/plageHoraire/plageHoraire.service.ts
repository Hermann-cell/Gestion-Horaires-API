import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type CreatePlageHorairePayload = {
  heureDebut: Date;
  heureFin: Date;
};

export type UpdatePlageHorairePayload = {
  heureDebut?: Date;
  heureFin?: Date;
};

export async function getAllPlageHoraires(app: FastifyInstance) {
  return app.prisma.plageHoraire.findMany({
    where: {
      supprimeLe: null,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getPlageHoraireById(
  app: FastifyInstance,
  id: number
) {
  return app.prisma.plageHoraire.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });
}

export async function createPlageHoraire(
  app: FastifyInstance,
  data: CreatePlageHorairePayload
) {
  const existing = await app.prisma.plageHoraire.findFirst({
    where: {
      heure_debut: data.heureDebut,
      heure_fin: data.heureFin,
      supprimeLe: null,
    },
  });

  if (existing) {
    throw new Error("Cette plage horaire existe déjà");
  }

  return app.prisma.plageHoraire.create({
    data: {
      heure_debut: data.heureDebut,
      heure_fin: data.heureFin,
    },
  });
}

export async function updatePlageHoraire(
  app: FastifyInstance,
  id: number,
  data: UpdatePlageHorairePayload
) {
  return app.prisma.plageHoraire.update({
    where: { id },
    data: {
      ...(data.heureDebut !== undefined
        ? { heure_debut: data.heureDebut }
        : {}),
      ...(data.heureFin !== undefined
        ? { heure_fin: data.heureFin }
        : {}),
      modifierLe: new Date(),
    },
  });
}

export async function softDeletePlageHoraire(
  app: FastifyInstance,
  id: number
) {
  const existing = await app.prisma.plageHoraire.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });

  if (!existing) {
    return null;
  }

  return app.prisma.plageHoraire.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
    },
  });
}

export function isPrismaKnownError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}