import { FastifyRequest, FastifyReply } from "fastify";
import {
  listTypeSalles,
  getTypeSalleById,
  createTypeSalle,
  updateTypeSalle,
  deleteTypeSalle,
  CreateTypeSallePayload,
  UpdateTypeSallePayload,
} from "./typeSalle.service.js";

type ListQuery = {
  nom?: string;
};

// LIST
export async function getAllTypeSalles(
  request: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply
) {
  try {
    const result = await listTypeSalles(request.server, request.query ?? {});
    return reply.send(result);
  } catch (err) {
    request.log.error(err);
    return reply
      .code(500)
      .send({ message: "Erreur lors de la récupération des types de salle" });
  }
}

// GET BY ID
export async function getTypeSalle(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ message: "ID invalide" });
  }

  try {
    const result = await getTypeSalleById(request.server, id);

    if (!result) {
      return reply.code(404).send({ message: "Type de salle introuvable" });
    }

    return reply.send(result);
  } catch (err) {
    request.log.error(err);
    return reply
      .code(500)
      .send({ message: "Erreur lors de la récupération du type de salle" });
  }
}

// CREATE
export async function createTypeSalleController(
  request: FastifyRequest<{ Body: CreateTypeSallePayload }>,
  reply: FastifyReply
) {
  try {
    const { nom, description } = request.body;

    if (!nom || nom.trim() === "") {
      return reply.code(400).send({ message: "Le nom est obligatoire" });
    }

        const payload: CreateTypeSallePayload = {
        nom: nom.trim(),
        };

        if (description !== undefined && description.trim() !== "") {
        payload.description = description.trim();
        }

    const result = await createTypeSalle(request.server, payload);

    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.code(400).send({
      message: err.message || "Erreur lors de la création du type de salle",
    });
  }
}

// UPDATE
export async function editTypeSalle(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateTypeSallePayload;
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ message: "ID invalide" });
  }

  try {
    const result = await updateTypeSalle(request.server, id, request.body ?? {});
    return reply.send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.code(400).send({
      message: err.message || "Erreur lors de la modification du type de salle",
    });
  }
}

// DELETE
export async function deleteTypeSalleController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ message: "ID invalide" });
  }

  try {
    await deleteTypeSalle(request.server, id);
    return reply.code(204).send();
  } catch (err: any) {
    request.log.error(err);
    return reply.code(400).send({
      message: err.message || "Erreur lors de la suppression du type de salle",
    });
  }
}