import { FastifyInstance } from "fastify";

// Récupérer tous les users avec leur rôle
export async function getAllUsers(fastify: FastifyInstance) {
  return fastify.prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { role: true },
  });
}

// Récupérer un user par id avec son rôle
export async function getUserById(
  fastify: FastifyInstance,
  id: number
) {
  return fastify.prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

// Créer un user
export async function createUser(
  fastify: FastifyInstance,
  data: {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string; // camelCase
    roleId: number;
  }
) {
  return fastify.prisma.user.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      mot_de_passe: data.mot_de_passe, // correspond à @map("mot_de_passe")
      roleId: data.roleId,
    },
    include: { role: true },
  });
}

// Mettre à jour un user
export async function updateUser(
  fastify: FastifyInstance,
  id: number,
  data: {
    nom?: string;
    prenom?: string;
    email?: string;
    motDePasse?: string; // camelCase
    roleId?: number;
  }
) {
  return fastify.prisma.user.update({
    where: { id },
    data: {
      ...data,
      // Prisma mappe automatiquement motDePasse -> mot_de_passe
    },
    include: { role: true },
  });
}

// Supprimer un user
export async function deleteUser(
  fastify: FastifyInstance,
  id: number
) {
  return fastify.prisma.user.delete({
    where: { id },
    include: { role: true },
  });
}