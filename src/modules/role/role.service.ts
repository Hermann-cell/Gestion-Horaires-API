import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

// -------------------------------
// LIST
// -------------------------------
export type RoleFilters = {
  nom?: string;
};

export async function listRoles(app: FastifyInstance, filters: RoleFilters = {}) {
  const { nom } = filters;

  const where: Prisma.RoleWhereInput = {};
  if (nom && nom.trim() !== "") {
    where.nom = { contains: nom.trim(), mode: "insensitive" };
  }

  return app.prisma.role.findMany({
    where,
    orderBy: { id: "asc" },
  });
}

// -------------------------------
// CREATE
// -------------------------------
export type CreateRolePayload = {
  nom: string;
  description?: string;
};

export async function createRole(app: FastifyInstance, data: CreateRolePayload) {
  return app.prisma.role.create({
    data: {
      nom: data.nom,
      description: data.description ?? "",
    },
  });
}

// -------------------------------
// UPDATE
// -------------------------------
export type UpdateRolePayload = {
  nom?: string;
  description?: string;
};

export async function updateRole(app: FastifyInstance, id: number, data: UpdateRolePayload) {
  return app.prisma.role.update({
    where: { id },
    data: {
      ...(data.nom !== undefined ? { nom: data.nom } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
  });
}

// -------------------------------
// GET BY ID
// -------------------------------
export async function getRoleById(app: FastifyInstance, id: number) {
  return app.prisma.role.findUnique({
    where: { id },
  });
}

// -------------------------------
// DELETE
// -------------------------------
export async function deleteRole(app: FastifyInstance, id: number) {
  return app.prisma.role.delete({
    where: { id },
  });
}