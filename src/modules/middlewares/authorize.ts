import { FastifyRequest, FastifyReply } from "fastify";

export function authorize(roles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.user?.role;

    if (!userRole) {
      return reply.status(401).send({
        error: "Utilisateur non authentifié",
      });
    }

    if (!roles.includes(userRole)) {
      return reply.status(403).send({
        error: "Accès refusé",
      });
    }
  };
}