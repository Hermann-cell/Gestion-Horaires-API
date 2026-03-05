import { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./salle.service.js";

type CreateSalleBody = {
  code: string;
  capacite: number;
  typeDeSalleId: number;
};

export async function createSalle(
  request: FastifyRequest<{ Body: CreateSalleBody }>,
  reply: FastifyReply
) {
  try {
    const { code, capacite, typeDeSalleId } = request.body;

    // validations simples
    if (!code || typeof code !== "string" || !code.trim()) {
      return reply.code(400).send({ message: "code is required" });
    }
    if (
      typeof capacite !== "number" ||
      !Number.isInteger(capacite) ||
      capacite <= 0
    ) {
      return reply
        .code(400)
        .send({ message: "capacite must be a positive integer" });
    }
    if (
      typeof typeDeSalleId !== "number" ||
      !Number.isInteger(typeDeSalleId) ||
      typeDeSalleId <= 0
    ) {
      return reply
        .code(400)
        .send({ message: "typeDeSalleId must be a positive integer" });
    }

    const salle = await service.createSalle(request.server, {
      code: code.trim(),
      capacite,
      typeDeSalleId,
    });

    return reply.code(201).send(salle);
  } catch (e: any) {
    const status = e?.statusCode ?? 500;

    if (e?.code === "SALLE_CODE_EXISTS") {
      return reply.code(409).send({ message: "Salle code already exists" });
    }
    if (e?.code === "TYPE_SALLE_NOT_FOUND") {
      return reply.code(400).send({ message: "TypeDeSalle not found" });
    }

    request.log.error(e);
    return reply.code(status).send({ message: "Internal server error" });
  }
}
type Params = {
  id: string;
};

export async function deleteSalle(
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) {
  try {
    const id = Number(request.params.id);

    if (!id || id <= 0) {
      return reply.code(400).send({ message: "Invalid id" });
    }

    await service.deleteSalle(request.server, id);

    return reply.send({
      message: "Salle deleted successfully",
    });

  } catch (e: any) {

    if (e.code === "SALLE_NOT_FOUND") {
      return reply.code(404).send({ message: "Salle not found" });
    }

    request.log.error(e);
    return reply.code(500).send({ message: "Internal server error" });
  }
}