import { FastifyRequest, FastifyReply } from "fastify";
import * as service from "./utilisateur.service.js";

export async function getUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const users = await service.getAllUsers(request.server);
  return reply.send(users);
}

export async function getUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  const user = await service.getUserById(request.server, id);

  if (!user) {
    return reply.code(404).send({ message: "User not found" });
  }

  return reply.send(user);
}

type CreateUserBody = {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  roleId: number;
};

export async function createUser(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply
) {
  const user = await service.createUser(request.server, request.body);
  return reply.code(201).send(user);
}

export async function updateUser(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { nom?: string; prenom?: string; email?: string; mot_de_passe?: string; roleId?: number };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  const user = await service.updateUser(
    request.server,
    id,
    request.body
  );

  return reply.send(user);
}

export async function deleteUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  await service.deleteUser(request.server, id);

  return reply.code(204).send();
}

export async function getAllUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const users = await service.getAllUsers(request.server);
    return reply.send(users);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send({ message: "Internal server error" });
  }
}