import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

export type CreatePlageHorairePayload = {
  heureDebut: number;  // 8-22
  heureFin: number;    // 9-23
};

export type UpdatePlageHorairePayload = {
  heureDebut?: number;  // 8-22
  heureFin?: number;    // 9-23
};

function formatTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

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
  // Vérification uniqueness exacte
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

  // Vérifier les chevauchements partiels
  const overlappingPlage = await app.prisma.plageHoraire.findFirst({
    where: {
      supprimeLe: null,
      AND: [
        { heure_debut: { lt: data.heureFin } },  // début existant < fin nouvelle
        { heure_fin: { gt: data.heureDebut } }   // fin existant > début nouveau
      ]
    },
  });

  if (overlappingPlage) {
    throw new Error(
      `Chevauchement détecté avec plage existante: ${formatTime(overlappingPlage.heure_debut)} - ${formatTime(overlappingPlage.heure_fin)}`
    );
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
  const existing = await app.prisma.plageHoraire.findFirst({
    where: { id, supprimeLe: null },
  });

  if (!existing) {
    throw new Error("Plage horaire introuvable");
  }

  const finalHeureDebut = data.heureDebut !== undefined ? data.heureDebut : existing.heure_debut;
  const finalHeureFin = data.heureFin !== undefined ? data.heureFin : existing.heure_fin;

  // Vérifier l'unicité exacte (sauf si les valeurs n'ont pas changé)
  if (
    (data.heureDebut !== undefined || data.heureFin !== undefined) &&
    !(finalHeureDebut === existing.heure_debut && finalHeureFin === existing.heure_fin)
  ) {
    const duplicateExact = await app.prisma.plageHoraire.findFirst({
      where: {
        heure_debut: finalHeureDebut,
        heure_fin: finalHeureFin,
        supprimeLe: null,
        id: { not: id },
      },
    });

    if (duplicateExact) {
      throw new Error("Une plage horaire avec ces heures existe déjà");
    }

    // Vérifier les chevauchements partiels
    const overlappingPlage = await app.prisma.plageHoraire.findFirst({
      where: {
        supprimeLe: null,
        id: { not: id },
        AND: [
          { heure_debut: { lt: finalHeureFin } },
          { heure_fin: { gt: finalHeureDebut } }
        ]
      },
    });

    if (overlappingPlage) {
      throw new Error(
        `Chevauchement détecté avec plage existante: ${formatTime(overlappingPlage.heure_debut)} - ${formatTime(overlappingPlage.heure_fin)}`
      );
    }
  }

  return app.prisma.plageHoraire.update({
    where: { id },
    data: {
      ...(data.heureDebut !== undefined ? { heure_debut: data.heureDebut } : {}),
      ...(data.heureFin !== undefined ? { heure_fin: data.heureFin } : {}),
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