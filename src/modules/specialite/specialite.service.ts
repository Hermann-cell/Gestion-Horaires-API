import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

export type SpecialiteFilters = {
  nom?: string;
};

export type CreateSpecialitePayload = {
  nom: string;
};

export type UpdateSpecialitePayload = {
  nom?: string;
};

// LIST
export async function listSpecialites(
  app: FastifyInstance,
  filters: SpecialiteFilters = {}
) {
  const { nom } = filters;

  const where: Prisma.SpecialiteWhereInput = {};

  if (nom && nom.trim() !== "") {
    where.nom = {
      contains: nom.trim(),
      mode: "insensitive",
    };
  }

  return app.prisma.specialite.findMany({
    where,
    orderBy: { id: "asc" },
    include: {
      _count: {
        select: {
          specialite_professeurs: true,
        },
      },
    },
  });
}

// GET BY ID
export async function getSpecialiteById(
  app: FastifyInstance,
  id: number
) {
  return app.prisma.specialite.findUnique({
    where: { id },
    include: {
      specialite_professeurs: true,
      _count: {
        select: {
          specialite_professeurs: true,
        },
      },
    },
  });
}

// CREATE
export async function createSpecialite(
  app: FastifyInstance,
  data: CreateSpecialitePayload
) {
  const existing = await app.prisma.specialite.findFirst({
    where: {
      nom: {
        equals: data.nom,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new Error("Une spécialité avec ce nom existe déjà");
  }

  return app.prisma.specialite.create({
    data: {
      nom: data.nom,
    },
  });
}

// UPDATE
export async function updateSpecialite(
  app: FastifyInstance,
  id: number,
  data: UpdateSpecialitePayload
) {
  const found = await app.prisma.specialite.findUnique({
    where: { id },
  });

  if (!found) {
    throw new Error("Spécialité introuvable");
  }

  if (data.nom && data.nom.trim() !== "") {
    const existing = await app.prisma.specialite.findFirst({
      where: {
        nom: {
          equals: data.nom.trim(),
          mode: "insensitive",
        },
        NOT: { id },
      },
    });

    if (existing) {
      throw new Error("Une spécialité avec ce nom existe déjà");
    }
  }

  return app.prisma.specialite.update({
    where: { id },
    data: {
      ...(data.nom !== undefined ? { nom: data.nom.trim() } : {}),
      modifierLe: new Date(),
    },
  });
}

// DELETE
export async function deleteSpecialite(
  app: FastifyInstance,
  id: number
) {
  const found = await app.prisma.specialite.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          specialite_professeurs: true,
        },
      },
    },
  });

  if (!found) {
    throw new Error("Spécialité introuvable");
  }

  if (found._count.specialite_professeurs > 0) {
    throw new Error(
      "Impossible de supprimer cette spécialité car elle est utilisée par un ou plusieurs professeurs"
    );
  }

  return app.prisma.specialite.delete({
    where: { id },
  });
}