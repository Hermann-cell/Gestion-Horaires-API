import { FastifyInstance } from "fastify";
import type { Prisma } from "../../../generated/prisma/client.js";

// -------------------------------
// LIST
// -------------------------------
export type SalleFilters = {
  code?: string;
  typeDeSalleId?: string;
};

export async function listSalles(app: FastifyInstance, filters: SalleFilters = {}) {
  const { code, typeDeSalleId } = filters;

  const where: Prisma.SalleWhereInput = {};
  if (code && code.trim() !== "") {
    where.code = { contains: code.trim(), mode: "insensitive" };
  }

  if (typeDeSalleId && typeDeSalleId.trim() !== "") {
    where.typeDeSalleId = Number(typeDeSalleId);
  }

  return app.prisma.salle.findMany({
    where,
    include: { typeDeSalle: true },
    orderBy: { id: "asc" },
  });
}


// -------------------------------
// CREATE
// -------------------------------
export type CreateSallePayload = {
  code: string;
  nom: string; // <-- obligatoire et correct
  capacite: number;
  typeDeSalleId: number;
  description?: string;
};

export async function createSalle(app: FastifyInstance, data: CreateSallePayload) {
  return app.prisma.salle.create({
    data: {
      code: data.code,
      nom: data.nom,                 // <-- corrigé
      capacite: data.capacite,
      typeDeSalleId: data.typeDeSalleId,
      description: data.description ?? "",
    },
    include: { typeDeSalle: true },
  });
}

// -------------------------------
// UPDATE
// -------------------------------
export type UpdateSallePayload = {
  code?: string;
  capacite?: number;
  typeDeSalleId?: number;
  description?: string;
};

export async function updateSalle(app: FastifyInstance, id: number, data: UpdateSallePayload) {
  return app.prisma.salle.update({
    where: { id },
    data: {
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.capacite !== undefined ? { capacite: data.capacite } : {}),
      ...(data.typeDeSalleId !== undefined ? { typeDeSalleId: data.typeDeSalleId } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
    include: { typeDeSalle: true },
  });
}

// -------------------------------
// GET BY ID
// -------------------------------
export async function getSalleById(app: FastifyInstance, id: number) {
  return app.prisma.salle.findUnique({
    where: { id },
    include: { typeDeSalle: true },
  });
}

// -------------------------------
// DELETE
// -------------------------------
export async function deleteSalle(app: FastifyInstance, id: number) {
  return app.prisma.salle.delete({
    where: { id },
  });
}