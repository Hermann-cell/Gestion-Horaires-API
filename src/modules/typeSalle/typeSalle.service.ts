import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

export type TypeSalleFilters = {
  nom?: string;
};

export type CreateTypeSallePayload = {
  nom: string;
  description?: string;
};

export type UpdateTypeSallePayload = {
  nom?: string;
  description?: string;
};

// LIST
export async function listTypeSalles(
  app: FastifyInstance,
  filters: TypeSalleFilters = {}
) {
  const { nom } = filters;

  const where: Prisma.TypeDeSalleWhereInput = {};

  if (nom && nom.trim() !== "") {
    where.nom = {
      contains: nom.trim(),
      mode: "insensitive",
    };
  }

  return app.prisma.typeDeSalle.findMany({
    where,
    orderBy: { id: "asc" },
    include: {
      _count: {
        select: {
          salles: true,
        },
      },
    },
  });
}

// GET BY ID
export async function getTypeSalleById(
  app: FastifyInstance,
  id: number
) {
  return app.prisma.typeDeSalle.findUnique({
    where: { id },
    include: {
      salles: true,
      _count: {
        select: {
          salles: true,
        },
      },
    },
  });
}

// CREATE
export async function createTypeSalle(
  app: FastifyInstance,
  data: CreateTypeSallePayload
) {
  const existing = await app.prisma.typeDeSalle.findUnique({
    where: { nom: data.nom },
  });

  if (existing) {
    throw new Error("Un type de salle avec ce nom existe déjà");
  }

  return app.prisma.typeDeSalle.create({
    data: {
      nom: data.nom,
      description: data.description ?? null,
    },
  });
}

// UPDATE
export async function updateTypeSalle(
  app: FastifyInstance,
  id: number,
  data: UpdateTypeSallePayload
) {
  const found = await app.prisma.typeDeSalle.findUnique({
    where: { id },
  });

  if (!found) {
    throw new Error("Type de salle introuvable");
  }

  if (data.nom && data.nom !== found.nom) {
    const existing = await app.prisma.typeDeSalle.findUnique({
      where: { nom: data.nom },
    });

    if (existing) {
      throw new Error("Un type de salle avec ce nom existe déjà");
    }
  }

  return app.prisma.typeDeSalle.update({
    where: { id },
    data: {
      ...(data.nom !== undefined ? { nom: data.nom } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      modifierLe: new Date(),
    },
  });
}

// DELETE
export async function deleteTypeSalle(
  app: FastifyInstance,
  id: number
) {
  const found = await app.prisma.typeDeSalle.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          salles: true,
        },
      },
    },
  });

  if (!found) {
    throw new Error("Type de salle introuvable");
  }

  if (found._count.salles > 0) {
    throw new Error(
      "Impossible de supprimer ce type de salle car il est utilisé par une ou plusieurs salles"
    );
  }

  return app.prisma.typeDeSalle.delete({
    where: { id },
  });
}