import { FastifyRequest, FastifyReply } from "fastify";

export function authorize(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await request.jwtVerify();
    const userRole = (request.user as any).role; // ou typer proprement request.user
    if (!roles.includes(userRole)) {
      return reply.status(403).send({ error: "Accès refusé" });
    }
  };
}