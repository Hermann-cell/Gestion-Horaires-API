import { FastifyInstance } from "fastify";

export type CreateSalleDTO = {
  code: string;
  capacite: number;
  typeDeSalleId: number;
};

export async function createSalle(
  fastify: FastifyInstance,
  data: CreateSalleDTO
) {
  // (Optionnel) empêcher les doublons de code
  const existing = await fastify.prisma.salle.findFirst({
    where: { code: data.code },
  });

  if (existing) {
    const err: any = new Error("Salle code already exists");
    err.statusCode = 409;
    err.code = "SALLE_CODE_EXISTS";
    throw err;
  }

  // Vérifie que le typeDeSalle existe (sinon FK error plus tard)
  const typeExists = await fastify.prisma.typeDeSalle.findUnique({
    where: { id: data.typeDeSalleId },
  });

  if (!typeExists) {
    const err: any = new Error("TypeDeSalle not found");
    err.statusCode = 400;
    err.code = "TYPE_SALLE_NOT_FOUND";
    throw err;
  }

  return fastify.prisma.salle.create({
    data: {
      code: data.code,
      capacite: data.capacite,
      typeDeSalleId: data.typeDeSalleId,
    },
    include: {
      typeDeSalle: true, // pratique pour renvoyer le type dans la réponse
    },
  });
}
export async function deleteSalle(
  fastify: FastifyInstance,
  id: number
) {
  const salle = await fastify.prisma.salle.findUnique({
    where: { id },
  });

  if (!salle) {
    const err: any = new Error("Salle not found");
    err.statusCode = 404;
    err.code = "SALLE_NOT_FOUND";
    throw err;
  }

  return fastify.prisma.salle.delete({
    where: { id },
  });
}