import { FastifyReply, FastifyRequest } from "fastify";
import { getDashboardStats } from "./dashboard.service.js";

export async function getDashboardController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = await getDashboardStats(request.server);

    return reply.send({
      message: "Données du tableau de bord récupérées avec succès",
      data,
    });
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Erreur lors du chargement du tableau de bord",
    });
  }
}