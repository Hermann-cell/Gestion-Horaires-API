
import { FastifyInstance } from "fastify";
import type { Prisma } from "../../../generated/prisma/client.js";

//API qui retoune la liste des salles
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

// API d’édition de la salle
export type UpdateSallePayload = {
  code?: string;
  capacite?: number;
  typeDeSalleId?: number;
};

export async function updateSalle(
  app: FastifyInstance,
  id: number,
  data: UpdateSallePayload
) {
  return app.prisma.salle.update({
    where: { id },
    data: {
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.capacite !== undefined ? { capacite: data.capacite } : {}),
      ...(data.typeDeSalleId !== undefined ? { typeDeSalleId: data.typeDeSalleId } : {}),
    },
    include: { typeDeSalle: true },
  });
}

// API détail d'une salle
export async function getSalleById(app: FastifyInstance, id: number) {
  return app.prisma.salle.findUnique({
    where: { id },
    include: { typeDeSalle: true },
  });
}