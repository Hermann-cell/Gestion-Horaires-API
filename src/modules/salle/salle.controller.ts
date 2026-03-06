import { FastifyReply, FastifyRequest } from "fastify";
import { listSalles } from "./salle.service.js";
import { updateSalle } from "./salle.service.js";
import { getSalleById } from "./salle.service.js";

type ListQuery = {
  code?: string;
  typeDeSalleId?: string;
};

// API qui retourne la liste des salles
export async function getAllSalles(
  request: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply
) {
  const salles = await listSalles(request.server, request.query ?? {});
  return reply.send(salles);
}

type UpdateBody = {
  code?: string;
  capacite?: number;
  typeDeSalleId?: number;
};

// API d’édition de la salle
export async function editSalle(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateBody }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  const salle = await updateSalle(request.server, id, request.body ?? {});
  return reply.send(salle);
}

// API détail d'une salle
export async function getSalle(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  const salle = await getSalleById(request.server, id);

  // Si pas trouvé
  if (!salle) {
    return reply.code(404).send({ message: "Salle introuvable" });
  }
  return reply.send(salle);
}