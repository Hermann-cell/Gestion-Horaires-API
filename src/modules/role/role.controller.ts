import { FastifyRequest, FastifyReply } from "fastify";
import {
  listRoles,
  getRoleById,
  updateRole,
  createRole,
  deleteRole,
  CreateRolePayload,
  UpdateRolePayload,
} from "./role.service.js";

// LIST
type ListQuery = {
  nom?: string;
};
export async function getAllRoles(
  request: FastifyRequest<{ Querystring: ListQuery }>,
  reply: FastifyReply
) {
  const roles = await listRoles(request.server, request.query ?? {});
  return reply.send(roles);
}

// GET BY ID
export async function getRole(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  const role = await getRoleById(request.server, id);
  if (!role) return reply.code(404).send({ message: "Rôle introuvable" });
  return reply.send(role);
}

// CREATE
export async function createRoleController(
  request: FastifyRequest<{ Body: CreateRolePayload }>,
  reply: FastifyReply
) {
  try {
    const newRole = await createRole(request.server, request.body);
    return reply.code(201).send(newRole);
  } catch (err) {
    return reply.code(400).send({ message: "Erreur lors de la création du rôle", error: err });
  }
}

// UPDATE
export async function editRole(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateRolePayload }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  try {
    const updatedRole = await updateRole(request.server, id, request.body ?? {});
    return reply.send(updatedRole);
  } catch (err) {
    return reply.code(400).send({ message: "Erreur lors de la modification", error: err });
  }
}

// DELETE
export async function deleteRoleController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  try {
    await deleteRole(request.server, id);
    return reply.code(204).send();
  } catch (err) {
    return reply.code(400).send({ message: "Erreur lors de la suppression", error: err });
  }
}