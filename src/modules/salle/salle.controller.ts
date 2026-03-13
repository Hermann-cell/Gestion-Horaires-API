import { FastifyRequest, FastifyReply } from "fastify";
import {
  listSalles,
  getSalleById,
  updateSalle,
  createSalle,
  deleteSalle,
  CreateSallePayload,
  UpdateSallePayload,
} from "./salle.service.js";

type ListQuery = {
  code?: string;
  typeDeSalleId?: string;
};

// LIST
export async function getAllSalles(
  request: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply
) {
  const salles = await listSalles(request.server, request.query ?? {});
  return reply.send(salles);
}

// GET BY ID
export async function getSalle(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  const salle = await getSalleById(request.server, id);
  if (!salle) return reply.code(404).send({ message: "Salle introuvable" });
  return reply.send(salle);
}

// CREATE
export async function createSalleController(
  request: FastifyRequest<{ Body: CreateSallePayload }>,
  reply: FastifyReply
) {
  try {
    const newSalle = await createSalle(request.server, request.body);
    return reply.code(201).send(newSalle);
  } catch (err) {
    return reply.code(400).send({ message: "Erreur lors de la création de la salle", error: err });
  }
}

// UPDATE
type UpdateBody = UpdateSallePayload;
export async function editSalle(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateBody }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  try {
    const updatedSalle = await updateSalle(request.server, id, request.body ?? {});
    return reply.send(updatedSalle);
  } catch (err) {
    return reply.code(400).send({ message: "Erreur lors de la modification", error: err });
  }
}

// DELETE
export async function deleteSalleController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  try {
    await deleteSalle(request.server, id);
    return reply.code(204).send();
  } catch (err) {
    return reply.code(400).send({ message: "Erreur lors de la suppression", error: err });
  }
}