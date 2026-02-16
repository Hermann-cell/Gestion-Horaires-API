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

export async function createUser(
  request: FastifyRequest<{ Body: { name: string; email: string } }>,
  reply: FastifyReply
) {
  const user = await service.createUser(
    request.server,
    request.body
  );

  return reply.code(201).send(user);
}

export async function updateUser(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { name?: string; email?: string };
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
