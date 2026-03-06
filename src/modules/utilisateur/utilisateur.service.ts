import { FastifyInstance } from "fastify";

export async function getAllUsers(fastify: FastifyInstance) {
  return fastify.prisma.user.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      roleId: true,
    },
  });
}

export async function getUserById(
  fastify: FastifyInstance,
  id: number
) {
  return fastify.prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(
  fastify: FastifyInstance,
  data: {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    roleId: number;
  }
) {
  return fastify.prisma.user.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      mot_de_passe: data.mot_de_passe,
      roleId: data.roleId,
    },
  });
}

export async function updateUser(
  fastify: FastifyInstance,
  id: number,
  data: { nom?: string; prenom?: string; email?: string; mot_de_passe?: string; roleId?: number }
) {
  return fastify.prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(
  fastify: FastifyInstance,
  id: number
) {
  return fastify.prisma.user.delete({
    where: { id },
  });
}