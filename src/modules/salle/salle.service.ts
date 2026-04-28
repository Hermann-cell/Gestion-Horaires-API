import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

// -------------------------------
// LIST
// -------------------------------
export type SalleFilters = {
  code?: string;
  typeDeSalleId?: string;
};

export async function listSalles(app: FastifyInstance, filters: SalleFilters = {}) {
  const { code, typeDeSalleId } = filters;

  const where: Prisma.SalleWhereInput = {
    supprimeLe: null,
  };

  if (code && code.trim() !== "") {
    where.code = { contains: code.trim(), mode: "insensitive" };
  }

  if (typeDeSalleId && typeDeSalleId.trim() !== "") {
    const parsedTypeId = Number(typeDeSalleId);
    if (!Number.isNaN(parsedTypeId)) {
      where.typeDeSalleId = parsedTypeId;
    }
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
  nom: string;
  capacite: number;
  typeDeSalleId: number;
  description?: string;
};

export async function createSalle(app: FastifyInstance, data: CreateSallePayload) {
  const existingSalle = await app.prisma.salle.findFirst({
    where: {
      code: data.code,
      supprimeLe: null,
    },
  });

  console.log("Existing salle check:", { code: data.code, existingSalle });

  if (existingSalle) {
    throw new Error("Une salle avec ce code existe déjà");
  }


  return app.prisma.salle.create({
    data: {
      code: data.code,
      nom: data.nom,
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
  nom?: string;
  capacite?: number;
  typeDeSalleId?: number;
  description?: string;
};

export async function updateSalle(app: FastifyInstance, id: number, data: UpdateSallePayload) {
  const salle = await app.prisma.salle.findFirst({
    where: { id, supprimeLe: null },
  });

  if (!salle) {
    throw new Error("Salle introuvable ou déjà supprimée");
  }

  return app.prisma.salle.update({
    where: { id },
    data: {
      ...(data.code !== undefined ? { code: data.code } : {}),
      ...(data.nom !== undefined ? { nom: data.nom } : {}),
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
  return app.prisma.salle.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: { typeDeSalle: true },
  });
}

// -------------------------------
// DELETE
// -------------------------------
export async function deleteSalle(
  app: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  const salle = await app.prisma.salle.findFirst({
    where: { id, supprimeLe: null },
  });

  if (!salle) {
    throw new Error("Salle introuvable ou déjà supprimée");
  }

  const seanceOccupee = await app.prisma.seance.findFirst({
    where: {
      salleId: id,
      supprimeLe: null,
    },
  });

  if (seanceOccupee) {
    throw new Error(
      "Impossible de supprimer cette salle car elle est utilisée par une séance"
    );
  }

  return app.prisma.salle.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
      ...(supprimePar !== undefined ? { supprimePar } : {}),
    },
  });
}