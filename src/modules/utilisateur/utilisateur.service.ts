import { FastifyInstance } from "fastify";

export async function getAllUsers(fastify: FastifyInstance) {
  return fastify.prisma.user.findMany();
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
  data: { name: string; email: string }
) {
  return fastify.prisma.user.create({
    data,
  });
}

export async function updateUser(
  fastify: FastifyInstance,
  id: number,
  data: { name?: string; email?: string }
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