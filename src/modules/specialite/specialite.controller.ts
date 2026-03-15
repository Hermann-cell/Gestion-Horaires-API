import { FastifyRequest, FastifyReply } from "fastify";
import {
  listSpecialites,
  getSpecialiteById,
  createSpecialite,
  updateSpecialite,
  deleteSpecialite,
  CreateSpecialitePayload,
  UpdateSpecialitePayload,
} from "./specialite.service.js";

type ListQuery = {
  nom?: string;
};

type CreateSpecialiteBody = {
  nom: string;
};

type UpdateSpecialiteBody = {
  nom?: string;
};

// LIST
export async function getAllSpecialites(
  request: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply
) {
  try {
    const result = await listSpecialites(request.server, request.query ?? {});
    return reply.send(result);
  } catch (err) {
    request.log.error(err);
    return reply
      .code(500)
      .send({ message: "Erreur lors de la récupération des spécialités" });
  }
}

// GET BY ID
export async function getSpecialite(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ message: "ID invalide" });
  }

  try {
    const result = await getSpecialiteById(request.server, id);

    if (!result) {
      return reply.code(404).send({ message: "Spécialité introuvable" });
    }

    return reply.send(result);
  } catch (err) {
    request.log.error(err);
    return reply
      .code(500)
      .send({ message: "Erreur lors de la récupération de la spécialité" });
  }
}

// CREATE
export async function createSpecialiteController(
  request: FastifyRequest<{ Body: CreateSpecialiteBody }>,
  reply: FastifyReply
) {
  try {
    const { nom } = request.body;

    if (!nom || nom.trim() === "") {
      return reply.code(400).send({ message: "Le nom est obligatoire" });
    }

    const payload: CreateSpecialitePayload = {
      nom: nom.trim(),
    };

    const result = await createSpecialite(request.server, payload);

    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.code(400).send({
      message: err.message || "Erreur lors de la création de la spécialité",
    });
  }
}

// UPDATE
export async function editSpecialite(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateSpecialiteBody;
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ message: "ID invalide" });
  }

  try {
    const result = await updateSpecialite(request.server, id, request.body ?? {});
    return reply.send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.code(400).send({
      message: err.message || "Erreur lors de la modification de la spécialité",
    });
  }
}

// DELETE
export async function deleteSpecialiteController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ message: "ID invalide" });
  }

  try {
    await deleteSpecialite(request.server, id);
    return reply.code(204).send();
  } catch (err: any) {
    request.log.error(err);
    return reply.code(400).send({
      message: err.message || "Erreur lors de la suppression de la spécialité",
    });
  }
}